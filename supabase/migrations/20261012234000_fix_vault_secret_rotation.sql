create or replace function public.store_project_secret(p_project_id uuid, p_secret_key text, p_secret_value text)
returns jsonb language plpgsql security definer set search_path = public, auth, vault
as $$
declare new_secret_id uuid; existing_secret_id uuid; secret_name text;
begin
  if auth.uid() is null or not public.can_edit_project(p_project_id) then raise exception 'Not authorized to change secrets for this project' using errcode='42501'; end if;
  if p_secret_key not in ('OPENROUTER_API_KEY','FIRECRAWL_API_KEY','GITHUB_TOKEN','SUPABASE_SERVICE_ROLE_KEY') then raise exception 'Unsupported secret name'; end if;
  if p_secret_value is null or length(trim(p_secret_value)) < 8 or length(p_secret_value) > 10000 then raise exception 'Secret value is invalid'; end if;
  secret_name := 'figurable:' || p_project_id::text || ':' || p_secret_key;
  select vault_secret_id into existing_secret_id from public.project_secrets where project_id=p_project_id and secret_key=p_secret_key;
  if existing_secret_id is null then
    select vault.create_secret(p_secret_value,secret_name,'Encrypted Figurable project credential') into new_secret_id;
  else
    perform vault.update_secret(existing_secret_id,p_secret_value,secret_name,'Encrypted Figurable project credential',null);
    new_secret_id := existing_secret_id;
  end if;
  insert into public.project_secrets(project_id,secret_key,vault_secret_id,created_by)
  values(p_project_id,p_secret_key,new_secret_id,auth.uid())
  on conflict(project_id,secret_key) do update set vault_secret_id=excluded.vault_secret_id,created_by=auth.uid(),updated_at=now();
  return jsonb_build_object('saved',true,'secret_key',p_secret_key,'updated_at',now());
end;
$$;
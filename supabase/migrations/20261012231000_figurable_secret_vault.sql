create table if not exists public.project_secrets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  secret_key text not null check(secret_key ~ '^[A-Z][A-Z0-9_]{1,80}$'),
  vault_secret_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,secret_key)
);
alter table public.project_secrets enable row level security;
drop policy if exists "project access secret metadata" on public.project_secrets;
create policy "project access secret metadata" on public.project_secrets for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage secret metadata" on public.project_secrets;
create policy "editors manage secret metadata" on public.project_secrets for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id) and created_by=auth.uid());
grant select,insert,update,delete on public.project_secrets to authenticated;

create or replace function public.store_project_secret(p_project_id uuid, p_secret_key text, p_secret_value text)
returns jsonb language plpgsql security definer set search_path = public, auth, vault
as $$
declare new_secret_id uuid; secret_name text;
begin
  if auth.uid() is null or not public.can_edit_project(p_project_id) then raise exception 'Not authorized to change secrets for this project' using errcode='42501'; end if;
  if p_secret_key not in ('OPENROUTER_API_KEY','FIRECRAWL_API_KEY','GITHUB_TOKEN','SUPABASE_SERVICE_ROLE_KEY') then raise exception 'Unsupported secret name'; end if;
  if p_secret_value is null or length(trim(p_secret_value)) < 8 or length(p_secret_value) > 10000 then raise exception 'Secret value is invalid'; end if;
  secret_name := 'figurable:' || p_project_id::text || ':' || p_secret_key;
  select vault.create_secret(p_secret_value,secret_name,'Encrypted Figurable project credential') into new_secret_id;
  insert into public.project_secrets(project_id,secret_key,vault_secret_id,created_by)
  values(p_project_id,p_secret_key,new_secret_id,auth.uid())
  on conflict(project_id,secret_key) do update set vault_secret_id=excluded.vault_secret_id,created_by=auth.uid(),updated_at=now();
  return jsonb_build_object('saved',true,'secret_key',p_secret_key,'secret_id',new_secret_id,'updated_at',now());
end;
$$;
grant execute on function public.store_project_secret(uuid,text,text) to authenticated;

create or replace function public.read_project_secret(p_project_id uuid,p_secret_key text)
returns text language sql security definer set search_path = public, vault
as $$
  select ds.decrypted_secret from public.project_secrets ps
  join vault.decrypted_secrets ds on ds.id=ps.vault_secret_id
  where ps.project_id=p_project_id and ps.secret_key=p_secret_key limit 1;
$$;
revoke all on function public.read_project_secret(uuid,text) from public,anon,authenticated;
grant execute on function public.read_project_secret(uuid,text) to service_role;

create table if not exists public.project_share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token_hash text not null unique,
  label text not null default 'Project preview',
  is_active boolean not null default true,
  expires_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
alter table public.project_share_links enable row level security;
drop policy if exists "project access share link metadata" on public.project_share_links;
create policy "project access share link metadata" on public.project_share_links for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage share links" on public.project_share_links;
create policy "editors manage share links" on public.project_share_links for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id) and created_by=auth.uid());
grant select,insert,update,delete on public.project_share_links to authenticated;

create or replace function public.create_project_share_link(p_project_id uuid, p_label text default 'Project preview')
returns jsonb language plpgsql security definer set search_path = public, auth, extensions
as $$
declare raw_token text; new_id uuid;
begin
  if auth.uid() is null or not public.can_edit_project(p_project_id) then raise exception 'Not authorized to share this project' using errcode='42501'; end if;
  raw_token := encode(gen_random_bytes(32),'hex');
  insert into public.project_share_links(project_id,token_hash,label,created_by)
  values(p_project_id,encode(digest(raw_token,'sha256'),'hex'),left(coalesce(nullif(trim(p_label),''),'Project preview'),120),auth.uid())
  returning id into new_id;
  return jsonb_build_object('id',new_id,'token',raw_token,'created_at',now(),'label',left(coalesce(nullif(trim(p_label),''),'Project preview'),120));
end;
$$;
grant execute on function public.create_project_share_link(uuid,text) to authenticated;

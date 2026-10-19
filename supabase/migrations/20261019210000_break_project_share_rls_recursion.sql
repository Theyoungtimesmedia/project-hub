-- Break the projects <-> project_shares RLS policy cycle.
-- Keep RLS enabled; the narrowly scoped SECURITY DEFINER helper performs only
-- the owner check needed to manage shares for a project.
create or replace function public.can_manage_project_shares(target_project uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = target_project
      and wm.user_id = (select auth.uid())
      and wm.role = 'owner'
  );
$$;

revoke all on function public.can_manage_project_shares(uuid) from public;
grant execute on function public.can_manage_project_shares(uuid) to authenticated;

drop policy if exists "owners manage shares" on public.project_shares;
create policy "owners manage shares" on public.project_shares
for all to authenticated
using (public.can_manage_project_shares(project_id))
with check (public.can_manage_project_shares(project_id));

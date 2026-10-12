drop policy if exists "editors create projects" on public.projects;
create policy "editors create projects" on public.projects
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner','editor')
  )
);

drop policy if exists "editors update projects" on public.projects;
create policy "editors update projects" on public.projects
for update to authenticated
using (public.can_edit_project(id))
with check (public.can_edit_project(id));

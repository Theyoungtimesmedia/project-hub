-- Scope workspace owner/editor checks to the row being changed.\n
drop policy if exists "editors create projects" on public.projects;
create policy "editors create projects" on public.projects
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner','editor')
  )
);

drop policy if exists "owners delete projects" on public.projects;
create policy "owners delete projects" on public.projects
for delete to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
);

drop policy if exists "owners manage skills" on public.skills;
create policy "owners manage skills" on public.skills
for all to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = skills.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
)
with check (
  is_workspace_member(workspace_id)
  and created_by = auth.uid()
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = skills.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
);

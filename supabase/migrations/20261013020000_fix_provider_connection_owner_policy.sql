-- Ensure provider credentials can only be managed by an owner of the row's workspace.
drop policy if exists "owners manage provider config" on public.ai_provider_connections;
create policy "owners manage provider config" on public.ai_provider_connections
for all to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ai_provider_connections.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
)
with check (
  is_workspace_member(workspace_id)
  and created_by = auth.uid()
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ai_provider_connections.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
  )
);

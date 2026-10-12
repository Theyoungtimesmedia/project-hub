-- Restrict exposed SECURITY DEFINER functions to the roles that actually need them.
-- Access helpers remain callable by authenticated users because project/workspace RLS policies use them.
revoke all on function public.bootstrap_figurable_workspace() from public, anon;
grant execute on function public.bootstrap_figurable_workspace() to authenticated, service_role;

revoke all on function public.can_access_project(uuid) from public, anon;
grant execute on function public.can_access_project(uuid) to authenticated, service_role;

revoke all on function public.can_edit_project(uuid) from public, anon;
grant execute on function public.can_edit_project(uuid) to authenticated, service_role;

revoke all on function public.create_project_share_link(uuid, text) from public, anon;
grant execute on function public.create_project_share_link(uuid, text) to authenticated, service_role;

revoke all on function public.ensure_my_workspace() from public, anon;
grant execute on function public.ensure_my_workspace() to authenticated, service_role;

revoke all on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated, service_role;

-- This is an event-trigger function, not an application RPC.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;

-- Seed templates are called internally by the workspace bootstrap function, not directly by browsers.
revoke all on function public.seed_figurable_skills(uuid, uuid) from public, anon, authenticated;
grant execute on function public.seed_figurable_skills(uuid, uuid) to service_role;

revoke all on function public.store_project_secret(uuid, text, text) from public, anon;
grant execute on function public.store_project_secret(uuid, text, text) to authenticated, service_role;

revoke all on function public.read_project_secret(uuid, text) from public, anon, authenticated;
grant execute on function public.read_project_secret(uuid, text) to service_role;

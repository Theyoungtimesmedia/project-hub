create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  instructions text not null default '',
  active_branch text not null default 'main',
  github_repo text,
  github_branch text not null default 'main',
  is_starred boolean not null default false,
  is_published boolean not null default false,
  published_url text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,slug)
);
create table if not exists public.chat_turns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('Build','Plan','Chat')),
  prompt text not null,
  summary text,
  status text not null default 'queued' check (status in ('queued','running','completed','failed','cancelled')),
  plan_payload jsonb,
  result_payload jsonb,
  error_message text,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.turn_events (
  id uuid primary key default gen_random_uuid(),
  turn_id uuid not null references public.chat_turns(id) on delete cascade,
  kind text not null check (kind in ('status','read','edit','command','connector','error','output','checkpoint')),
  label text not null,
  detail text,
  payload jsonb not null default '{}'::jsonb,
  diff_patch text,
  duration_ms integer,
  created_at timestamptz not null default now()
);
create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  storage_path text,
  text_content text,
  sha256 text,
  source text not null default 'upload' check (source in ('upload','github','generated','import')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,file_path)
);
create table if not exists public.project_knowledge (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  content text not null,
  source_file_id uuid references public.project_files(id) on delete set null,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.project_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  turn_id uuid references public.chat_turns(id) on delete set null,
  label text not null,
  branch_name text not null default 'main',
  commit_sha text,
  files_manifest jsonb not null default '{}'::jsonb,
  summary text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.github_integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  account_label text not null,
  repository_owner text not null,
  repository_name text not null,
  default_branch text not null default 'main',
  token_secret_id uuid,
  installation_id text,
  auto_push_enabled boolean not null default false,
  last_synced_at timestamptz,
  last_sync_status text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.supabase_connectors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  organization_label text not null,
  project_url text not null,
  anon_key text not null,
  service_role_secret_id uuid,
  schema_snapshot jsonb not null default '{}'::jsonb,
  last_tested_at timestamptz,
  last_test_status text,
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (project_url ~ '^https://[a-zA-Z0-9-]+\.supabase\.co/?$')
);
create table if not exists public.ai_provider_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text not null check (provider in ('openai','anthropic','openrouter','deepseek','groq','firecrawl')),
  label text not null,
  secret_id uuid,
  is_default boolean not null default false,
  model_preferences jsonb not null default '{}'::jsonb,
  last_tested_at timestamptz,
  last_test_status text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,provider,label)
);
create table if not exists public.project_shares (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('editor','viewer')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(project_id,user_id)
);
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  command text not null,
  description text not null default '',
  instructions text not null,
  version integer not null default 1 check(version > 0),
  is_enabled boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id,command)
);
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_chat_width integer not null default 380 check(preferred_chat_width between 320 and 640),
  default_mode text not null default 'Build' check(default_mode in ('Build','Plan','Chat')),
  theme text not null default 'system' check(theme in ('light','dark','system')),
  updated_at timestamptz not null default now()
);

create index if not exists projects_workspace_updated_idx on public.projects(workspace_id,updated_at desc);
create index if not exists chat_turns_project_created_idx on public.chat_turns(project_id,created_at desc);
create index if not exists turn_events_turn_created_idx on public.turn_events(turn_id,created_at asc);
create index if not exists project_files_project_created_idx on public.project_files(project_id,created_at desc);
create index if not exists project_knowledge_project_active_idx on public.project_knowledge(project_id,is_active);
create index if not exists project_snapshots_project_created_idx on public.project_snapshots(project_id,created_at desc);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public, auth
as $$ select exists(select 1 from public.workspace_members wm where wm.workspace_id=target_workspace and wm.user_id=auth.uid()); $$;
create or replace function public.can_access_project(target_project uuid)
returns boolean language sql stable security definer set search_path = public, auth
as $$ select exists(
  select 1 from public.projects p
  left join public.workspace_members wm on wm.workspace_id=p.workspace_id and wm.user_id=auth.uid()
  left join public.project_shares ps on ps.project_id=p.id and ps.user_id=auth.uid()
  where p.id=target_project and (wm.user_id is not null or ps.user_id is not null)
); $$;
create or replace function public.can_edit_project(target_project uuid)
returns boolean language sql stable security definer set search_path = public, auth
as $$ select exists(
  select 1 from public.projects p
  left join public.workspace_members wm on wm.workspace_id=p.workspace_id and wm.user_id=auth.uid()
  left join public.project_shares ps on ps.project_id=p.id and ps.user_id=auth.uid()
  where p.id=target_project and (wm.role in ('owner','editor') or ps.role='editor')
); $$;

create or replace function public.bootstrap_figurable_workspace()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
declare new_workspace uuid; base_slug text; display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data->>'name',''),split_part(new.email,'@',1),'My');
  base_slug := trim(both '-' from regexp_replace(lower(display_name),'[^a-z0-9]+','-','g'));
  insert into public.workspaces(name,slug,owner_id)
  values(display_name || '''s Workspace',base_slug || '-' || substr(new.id::text,1,8),new.id)
  returning id into new_workspace;
  insert into public.workspace_members(workspace_id,user_id,role) values(new_workspace,new.id,'owner');
  insert into public.user_preferences(user_id) values(new.id) on conflict do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created_figurable on auth.users;
create trigger on_auth_user_created_figurable after insert on auth.users for each row execute procedure public.bootstrap_figurable_workspace();

create or replace function public.ensure_my_workspace()
returns uuid language plpgsql security definer set search_path = public, auth
as $$
declare workspace_id uuid; display_name text; base_slug text;
begin
  select id into workspace_id from public.workspaces where owner_id=auth.uid() order by created_at asc limit 1;
  if workspace_id is not null then return workspace_id; end if;
  select coalesce(nullif(raw_user_meta_data->>'name',''),split_part(email,'@',1),'My') into display_name from auth.users where id=auth.uid();
  base_slug := trim(both '-' from regexp_replace(lower(coalesce(display_name,'workspace')),'[^a-z0-9]+','-','g'));
  insert into public.workspaces(name,slug,owner_id) values(coalesce(display_name,'My') || '''s Workspace',base_slug || '-' || substr(auth.uid()::text,1,8),auth.uid()) returning id into workspace_id;
  insert into public.workspace_members(workspace_id,user_id,role) values(workspace_id,auth.uid(),'owner') on conflict do nothing;
  insert into public.user_preferences(user_id) values(auth.uid()) on conflict do nothing;
  return workspace_id;
end; $$;
grant execute on function public.ensure_my_workspace() to authenticated;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.chat_turns enable row level security;
alter table public.turn_events enable row level security;
alter table public.project_files enable row level security;
alter table public.project_knowledge enable row level security;
alter table public.project_snapshots enable row level security;
alter table public.github_integrations enable row level security;
alter table public.supabase_connectors enable row level security;
alter table public.ai_provider_connections enable row level security;
alter table public.project_shares enable row level security;
alter table public.skills enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "members read workspaces" on public.workspaces;
create policy "members read workspaces" on public.workspaces for select to authenticated using(public.is_workspace_member(id));
drop policy if exists "owners update workspaces" on public.workspaces;
create policy "owners update workspaces" on public.workspaces for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "members read membership" on public.workspace_members;
create policy "members read membership" on public.workspace_members for select to authenticated using(public.is_workspace_member(workspace_id));
drop policy if exists "owners manage membership" on public.workspace_members;
create policy "owners manage membership" on public.workspace_members for all to authenticated using(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=auth.uid())) with check(exists(select 1 from public.workspaces w where w.id=workspace_id and w.owner_id=auth.uid()));
drop policy if exists "members read projects" on public.projects;
create policy "members read projects" on public.projects for select to authenticated using(public.is_workspace_member(workspace_id) or exists(select 1 from public.project_shares ps where ps.project_id=id and ps.user_id=auth.uid()));
drop policy if exists "editors create projects" on public.projects;
create policy "editors create projects" on public.projects for insert to authenticated with check(public.is_workspace_member(workspace_id) and created_by=auth.uid());
drop policy if exists "editors update projects" on public.projects;
create policy "editors update projects" on public.projects for update to authenticated using(public.is_workspace_member(workspace_id) or exists(select 1 from public.project_shares ps where ps.project_id=id and ps.user_id=auth.uid() and ps.role='editor')) with check(public.is_workspace_member(workspace_id) or exists(select 1 from public.project_shares ps where ps.project_id=id and ps.user_id=auth.uid() and ps.role='editor'));
drop policy if exists "owners delete projects" on public.projects;
create policy "owners delete projects" on public.projects for delete to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=workspace_id and wm.user_id=auth.uid() and wm.role='owner'));

drop policy if exists "project access turns" on public.chat_turns;
create policy "project access turns" on public.chat_turns for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors create turns" on public.chat_turns;
create policy "editors create turns" on public.chat_turns for insert to authenticated with check(public.can_edit_project(project_id) and user_id=auth.uid());
drop policy if exists "authors update turns" on public.chat_turns;
create policy "authors update turns" on public.chat_turns for update to authenticated using(public.can_edit_project(project_id) and user_id=auth.uid()) with check(public.can_edit_project(project_id) and user_id=auth.uid());
drop policy if exists "project access events" on public.turn_events;
create policy "project access events" on public.turn_events for select to authenticated using(exists(select 1 from public.chat_turns t where t.id=turn_id and public.can_access_project(t.project_id)));
drop policy if exists "editors create events" on public.turn_events;
create policy "editors create events" on public.turn_events for insert to authenticated with check(exists(select 1 from public.chat_turns t where t.id=turn_id and public.can_edit_project(t.project_id)));
drop policy if exists "project access files" on public.project_files;
create policy "project access files" on public.project_files for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage files" on public.project_files;
create policy "editors manage files" on public.project_files for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id));
drop policy if exists "project access knowledge" on public.project_knowledge;
create policy "project access knowledge" on public.project_knowledge for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage knowledge" on public.project_knowledge;
create policy "editors manage knowledge" on public.project_knowledge for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id));
drop policy if exists "project access snapshots" on public.project_snapshots;
create policy "project access snapshots" on public.project_snapshots for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors create snapshots" on public.project_snapshots;
create policy "editors create snapshots" on public.project_snapshots for insert to authenticated with check(public.can_edit_project(project_id));
drop policy if exists "project access github config" on public.github_integrations;
create policy "project access github config" on public.github_integrations for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage github config" on public.github_integrations;
create policy "editors manage github config" on public.github_integrations for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id) and created_by=auth.uid());
drop policy if exists "project access supabase config" on public.supabase_connectors;
create policy "project access supabase config" on public.supabase_connectors for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "editors manage supabase config" on public.supabase_connectors;
create policy "editors manage supabase config" on public.supabase_connectors for all to authenticated using(public.can_edit_project(project_id)) with check(public.can_edit_project(project_id) and created_by=auth.uid());
drop policy if exists "workspace members read provider config" on public.ai_provider_connections;
create policy "workspace members read provider config" on public.ai_provider_connections for select to authenticated using(public.is_workspace_member(workspace_id));
drop policy if exists "owners manage provider config" on public.ai_provider_connections;
create policy "owners manage provider config" on public.ai_provider_connections for all to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=workspace_id and wm.user_id=auth.uid() and wm.role='owner')) with check(public.is_workspace_member(workspace_id) and created_by=auth.uid());
drop policy if exists "project access shares" on public.project_shares;
create policy "project access shares" on public.project_shares for select to authenticated using(public.can_access_project(project_id));
drop policy if exists "owners manage shares" on public.project_shares;
create policy "owners manage shares" on public.project_shares for all to authenticated using(exists(select 1 from public.projects p join public.workspace_members wm on wm.workspace_id=p.workspace_id where p.id=project_id and wm.user_id=auth.uid() and wm.role='owner')) with check(exists(select 1 from public.projects p join public.workspace_members wm on wm.workspace_id=p.workspace_id where p.id=project_id and wm.user_id=auth.uid() and wm.role='owner'));
drop policy if exists "workspace members read skills" on public.skills;
create policy "workspace members read skills" on public.skills for select to authenticated using(public.is_workspace_member(workspace_id));
drop policy if exists "owners manage skills" on public.skills;
create policy "owners manage skills" on public.skills for all to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=workspace_id and wm.user_id=auth.uid() and wm.role='owner')) with check(public.is_workspace_member(workspace_id) and created_by=auth.uid());
drop policy if exists "users manage own preferences" on public.user_preferences;
create policy "users manage own preferences" on public.user_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('project-files','project-files',false,52428800,array['text/plain','text/markdown','application/pdf','application/json','application/zip','image/png','image/jpeg','image/webp','image/gif','image/svg+xml','audio/mpeg','audio/wav','video/mp4','text/html','text/css','text/javascript','application/javascript','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
on conflict(id) do update set public=false,file_size_limit=52428800;
drop policy if exists "project members read storage" on storage.objects;
create policy "project members read storage" on storage.objects for select to authenticated using(bucket_id='project-files' and public.can_access_project(((storage.foldername(name))[1])::uuid));
drop policy if exists "project editors upload storage" on storage.objects;
create policy "project editors upload storage" on storage.objects for insert to authenticated with check(bucket_id='project-files' and public.can_edit_project(((storage.foldername(name))[1])::uuid));
drop policy if exists "project editors update storage" on storage.objects;
create policy "project editors update storage" on storage.objects for update to authenticated using(bucket_id='project-files' and public.can_edit_project(((storage.foldername(name))[1])::uuid)) with check(bucket_id='project-files' and public.can_edit_project(((storage.foldername(name))[1])::uuid));
drop policy if exists "project editors delete storage" on storage.objects;
create policy "project editors delete storage" on storage.objects for delete to authenticated using(bucket_id='project-files' and public.can_edit_project(((storage.foldername(name))[1])::uuid));

grant usage on schema public to authenticated;
grant select,insert,update,delete on public.workspaces,public.workspace_members,public.projects,public.chat_turns,public.turn_events,public.project_files,public.project_knowledge,public.project_snapshots,public.github_integrations,public.supabase_connectors,public.ai_provider_connections,public.project_shares,public.skills,public.user_preferences to authenticated;

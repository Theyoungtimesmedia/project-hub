create or replace function public.seed_figurable_skills(target_workspace uuid, target_user uuid)
returns void language plpgsql security definer set search_path = public
as $$
begin
  insert into public.skills(workspace_id,name,command,description,instructions,created_by)
  values
    (target_workspace,'Goal run','/goal','Work iteratively toward a goal and verify checkpoints','Break the goal into small checkpoints. Inspect current project state first. Execute one bounded step at a time, record real results, and continue until the stated acceptance criteria are met or a blocker requires the user.',target_user),
    (target_workspace,'Review changes','/review','Review implementation, regressions, and edge cases','Inspect the relevant files and current implementation before proposing changes. Prioritise correctness, security, accessibility, and regressions. Report findings by severity and verify fixes with available checks.',target_user),
    (target_workspace,'Redesign','/redesign','Improve UI/UX without breaking existing behaviour','Inspect the existing page and design system. Improve hierarchy, spacing, typography, responsiveness, accessibility, and interaction details. Preserve working behaviour and reuse existing components before creating new ones.',target_user),
    (target_workspace,'Accessibility','/accessibility','Audit keyboard, semantics, contrast, and motion','Review semantic structure, keyboard access, focus states, labels, contrast, reduced motion, and responsive zoom. Implement concrete fixes and state which checks were actually performed.',target_user),
    (target_workspace,'Fix bug','/fix','Reproduce and fix a specific issue','Identify the actual failing path and reproduce it where possible. Trace the cause before editing. Make the smallest durable fix, cover the relevant edge case, and run the available validation.',target_user),
    (target_workspace,'Write a strong prompt','/prompt','Turn a rough request into a precise engineering brief','Clarify objective, current behaviour, intended behaviour, scope, constraints, acceptance criteria, and verification. Do not invent project facts. Return a copy-ready prompt unless the user explicitly asks you to execute it.',target_user),
    (target_workspace,'Research','/research','Research a technical decision and ground recommendations','Gather current authoritative evidence when web access is available. Separate verified facts from assumptions, compare realistic alternatives, identify risks and costs, and end with a concrete recommendation.',target_user),
    (target_workspace,'Test changes','/test','Verify changes and report real outcomes','Identify the most relevant build, lint, type, and behavioural checks. Run available checks. Do not claim a test passed unless it actually ran; report blockers and remaining coverage honestly.',target_user),
    (target_workspace,'Security audit','/security','Check secrets, access control, data handling, and dependencies','Inspect authentication, authorisation, RLS, secret exposure, input validation, file handling, logging, and dependency risk. Fix clear vulnerabilities without weakening security controls.',target_user)
  on conflict(workspace_id,command) do nothing;
end;
$$;

create or replace function public.bootstrap_figurable_workspace()
returns trigger language plpgsql security definer set search_path = public, auth
as $$
declare new_workspace uuid; base_slug text; display_name text;
begin
  display_name := coalesce(nullif(new.raw_user_meta_data->>'name',''),split_part(new.email,'@',1),'My');
  base_slug := trim(both '-' from regexp_replace(lower(display_name),'[^a-z0-9]+','-','g'));
  insert into public.workspaces(name,slug,owner_id) values(display_name || '''s Workspace',base_slug || '-' || substr(new.id::text,1,8),new.id) returning id into new_workspace;
  insert into public.workspace_members(workspace_id,user_id,role) values(new_workspace,new.id,'owner');
  insert into public.user_preferences(user_id) values(new.id) on conflict do nothing;
  perform public.seed_figurable_skills(new_workspace,new.id);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_figurable on auth.users;
create trigger on_auth_user_created_figurable after insert on auth.users for each row execute procedure public.bootstrap_figurable_workspace();

create or replace function public.ensure_my_workspace()
returns uuid language plpgsql security definer set search_path = public, auth
as $$
declare workspace_id uuid; display_name text; base_slug text;
begin
  select id into workspace_id from public.workspaces where owner_id=auth.uid() order by created_at asc limit 1;
  if workspace_id is null then
    select coalesce(nullif(raw_user_meta_data->>'name',''),split_part(email,'@',1),'My') into display_name from auth.users where id=auth.uid();
    base_slug := trim(both '-' from regexp_replace(lower(coalesce(display_name,'workspace')),'[^a-z0-9]+','-','g'));
    insert into public.workspaces(name,slug,owner_id) values(coalesce(display_name,'My') || '''s Workspace',base_slug || '-' || substr(auth.uid()::text,1,8),auth.uid()) returning id into workspace_id;
    insert into public.workspace_members(workspace_id,user_id,role) values(workspace_id,auth.uid(),'owner') on conflict do nothing;
    insert into public.user_preferences(user_id) values(auth.uid()) on conflict do nothing;
  end if;
  perform public.seed_figurable_skills(workspace_id,auth.uid());
  return workspace_id;
end;
$$;
do $$ declare w record; begin for w in select id,owner_id from public.workspaces loop perform public.seed_figurable_skills(w.id,w.owner_id); end loop; end $$;

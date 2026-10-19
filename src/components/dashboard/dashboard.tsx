import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUp, ChevronDown, ChevronsLeft, Command, Folder, Grid2X2, Home, Import,
  List, Menu, MoreHorizontal, Paperclip, PlugZap, Search,
  Star, User, Users, X, Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectPreview } from "./project-preview";
import { ImportDialog } from "./import-dialog";
import type { Project } from "@/lib/mock-data";
import { useBackend } from "@/lib/backend";

type Filter = "all" | "starred" | "mine" | "shared";

const nav = [
  ["Dashboard", Home], ["Search", Search],
] as const;

export function Dashboard() {
  const navigate = useNavigate();
  const { session, request, signOut } = useBackend();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("Loading workspace…");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"Build" | "Plan">("Build");
  const [items, setItems] = useState<Project[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(() => items.filter((project) => {
    const matches = `${project.name} ${project.description}`.toLowerCase().includes(query.toLowerCase());
    if (filter === "starred") return matches && project.starred;
    if (filter === "shared") return matches && project.shared;
    if (filter === "mine") return matches && !project.shared;
    return matches;
  }), [filter, items, query]);

  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      setLoadingProjects(true);
      setLoadError(null);
      try {
        let workspaces = await request<Array<{ id: string; name: string }>>("workspaces?select=id,name&order=created_at.asc&limit=1");
        if (!workspaces.length) {
          await request<string>("rpc/ensure_my_workspace", { method: "POST", body: "{}" });
          workspaces = await request<Array<{ id: string; name: string }>>("workspaces?select=id,name&order=created_at.asc&limit=1");
        }
        const workspace = workspaces[0];
        if (!workspace) throw new Error("Supabase did not return a workspace after provisioning.");
        if (!cancelled) setWorkspaceName(workspace.name);
        const rows = await request<Array<{ id: string; name: string; description: string | null; is_starred: boolean; published_url: string | null; created_by: string; updated_at: string }>>(
          `projects?select=id,name,description,is_starred,published_url,created_by,updated_at&workspace_id=eq.${workspace.id}&order=updated_at.desc`
        );
        if (cancelled) return;
        setWorkspaceId(workspace.id);
        setItems(rows.map((row, index) => ({
          id: row.id, name: row.name, description: row.description ?? "",
          updated: new Date(row.updated_at).toLocaleString(), starred: row.is_starred,
          shared: row.created_by !== session?.user.id, live: Boolean(row.published_url),
          tone: (["blue", "mint", "coral", "violet"] as const)[index % 4],
        })));
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Could not load projects.");
      } finally {
        if (!cancelled) setLoadingProjects(false);
      }
    }
    void loadProjects();
    return () => { cancelled = true; };
  }, [request, session?.user.id]);

  const createProject = async () => {
    if (!prompt.trim() || !workspaceId || !session) return;
    const rawName = prompt.trim().split(/[.!?\n]/)[0]?.trim() || "Untitled project";
    const name = rawName.split(/\s+/).slice(0, 6).join(" ").replace(/^./, char => char.toUpperCase()).slice(0, 72);
    const slugBase = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
    setLoadError(null);
    try {
      const rows = await request<Array<{ id: string }>>("projects?select=id", {
        method: "POST", headers: { Prefer: "return=representation" },
        body: JSON.stringify({ workspace_id: workspaceId, name, slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`, description: prompt.trim(), created_by: session.user.id }),
      });
      const created = rows[0];
      if (!created) throw new Error("Supabase did not return the new project.");
      navigate({ to: "/project/$projectId", params: { projectId: created.id }, search: { prompt: prompt.trim(), mode } });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Project creation failed.");
    }
  };

  const toggleStar = async (id: string) => {
    const project = items.find(item => item.id === id);
    if (!project) return;
    const starred = !project.starred;
    setItems(current => current.map(item => item.id === id ? { ...item, starred } : item));
    try {
      await request(`projects?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ is_starred: starred, updated_at: new Date().toISOString() }) });
    } catch (error) {
      setItems(current => current.map(item => item.id === id ? { ...item, starred: project.starred } : item));
      setLoadError(error instanceof Error ? error.message : "Could not update project.");
    }
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-background" aria-hidden="true" />
      <Button variant="outline" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={16}/></Button>
      <aside className={`dashboard-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span/><span/><span/></div>
          {!collapsed && <span className="brand-name">Figurable</span>}
          <Button variant="ghost" size="icon" className="sidebar-toggle" aria-label="Collapse sidebar" onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}><ChevronsLeft size={15}/></Button>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild><Button variant="outline" className="workspace-switcher"><span className="workspace-avatar">JO</span>{!collapsed && <><span className="truncate">{workspaceName}</span><ChevronDown size={13}/></>}</Button></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="menu-content" sideOffset={6}><DropdownMenu.Label className="menu-label">ACTIVE WORKSPACE</DropdownMenu.Label><DropdownMenu.Item className="menu-item" disabled>{workspaceName}<span>✓</span></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
        <nav className="sidebar-scroll">
          <div className="nav-block">
            {nav.map(([label, Icon], i) => <button key={label} className={`nav-item ${i === 0 ? "active" : ""}`} onClick={() => label === "Search" ? setSearchOpen(true) : navigate({ to: "/" })}><Icon size={16}/>{!collapsed && <><span>{label}</span>{label === "Search" && <kbd>⌘K</kbd>}</>}</button>)}
          </div>
          {!collapsed && <div className="nav-label">Projects</div>}
          <div className="nav-block">
            <SideFilter icon={Folder} label="All projects" count={items.length} active={filter === "all"} collapsed={collapsed} onClick={() => setFilter("all")}/>
            <SideFilter icon={Star} label="Starred" count={items.filter(p => p.starred).length} active={filter === "starred"} collapsed={collapsed} onClick={() => setFilter("starred")}/>
            <SideFilter icon={User} label="Created by me" active={filter === "mine"} collapsed={collapsed} onClick={() => setFilter("mine")}/>
            <SideFilter icon={Users} label="Shared with me" active={filter === "shared"} collapsed={collapsed} onClick={() => setFilter("shared")}/>
          </div>
          {!collapsed && <><div className="nav-label">Recents</div><div className="recent-list">{items.slice(0,5).map((project) => <Link key={project.id} to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}><i className={`tone-${project.tone}`}/><span>{project.name}</span></Link>)}</div></>}
        </nav>
        <div className="sidebar-footer">
          {!collapsed && <div className="credit-card"><div><Zap size={14}/><b>Workspace status</b><span>Projects and files sync to Supabase</span></div><Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>Import project</Button></div>}
          <div className="profile-row"><span className="profile-avatar">J</span>{!collapsed && <><span className="profile-copy"><b>{String(session?.user.user_metadata?.name ?? "Joshua Omoniyi")}</b><small>{session?.user.email}</small></span><Button variant="ghost" size="icon" aria-label="Sign out" title="Sign out" onClick={() => void signOut()}><MoreHorizontal size={15}/></Button></>}</div>
        </div>
      </aside>

      <main className={`dashboard-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <section className="launchpad">
          <p className="eyebrow"><span/> Your workspace is ready</p>
          <h1>What do you want to build?</h1>
          <div className="hero-composer">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!loadingProjects && workspaceId && prompt.trim()) void createProject(); } }} placeholder="Describe what you want to build..." aria-label="Project prompt"/>
            <div className="composer-bar">
              <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon" aria-label="Attach"><Paperclip size={17}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="menu-content"><DropdownMenu.Item className="menu-item" onSelect={() => setImportOpen(true)}>Import a GitHub repository</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
              <div className="mode-switch"><button className={mode === "Build" ? "active" : ""} onClick={() => setMode("Build")}>Build</button><button className={mode === "Plan" ? "active" : ""} onClick={() => setMode("Plan")}>Plan</button></div>
              <span className="composer-spacer"/><Button variant={prompt.trim() ? "primary" : "default"} size="icon" aria-label="Send prompt" onClick={createProject} disabled={!prompt.trim() || !workspaceId || loadingProjects} title={!workspaceId ? "Connecting to workspace…" : "Build project"}><ArrowUp size={17}/></Button>
            </div>
          </div>
          <div className="prompt-suggestions"><button onClick={() => setPrompt("Build a refined analytics dashboard")}>Analytics dashboard</button><button onClick={() => setPrompt("Create an editorial ecommerce store")}>Online store</button><button onClick={() => setPrompt("Design a focused portfolio")}>Portfolio</button></div>
        </section>

        <section className="projects-section">
          {loadError && <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{loadError}</div>}
          <header className="projects-heading"><div><p>YOUR WORK</p><h2>Projects</h2></div><span>{filtered.length} projects</span></header>
          <div className="gallery-toolbar">
            <div className="tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All projects</button><button className={filter === "mine" ? "active" : ""} onClick={() => setFilter("mine")}>Created by me</button><button className={filter === "shared" ? "active" : ""} onClick={() => setFilter("shared")}>Shared with me</button></div>
            <div className="toolbar-actions"><label className="search-field"><Search size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter projects"/></label><select aria-label="Sort projects"><option>Last modified</option><option>Alphabetical</option><option>Created date</option></select><Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Import size={14}/> Import</Button><div className="view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={15}/></button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={15}/></button></div></div>
          </div>
          <div className={`project-gallery ${view}`}>
            {loadingProjects ? <p className="col-span-full py-12 text-center text-sm text-zinc-500">Loading projects from Supabase…</p> : filtered.length ? filtered.map((project) => <ProjectCard key={project.id} project={project} list={view === "list"} onStar={() => void toggleStar(project.id)}/>) : <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center"><h3 className="font-semibold text-zinc-900">No projects yet</h3><p className="mt-2 text-sm text-zinc-500">Describe a project above to create the first one in your workspace.</p></div>}
          </div>
        </section>
      </main>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>} 
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} workspaceId={workspaceId}/>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} projects={items} query={query} onQueryChange={setQuery}/>
    </div>
  );
}

function SideFilter({ icon: Icon, label, count, active, collapsed, onClick }: { icon: typeof Home; label: string; count?: number; active: boolean; collapsed: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon size={16}/>{!collapsed && <><span>{label}</span>{count !== undefined && <small>{count}</small>}</>}</button>;
}

function ProjectCard({ project, list, onStar }: { project: Project; list: boolean; onStar: () => void }) {
  return <article className="project-card"><Link className="preview-link" to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}><div className="browser-dots"><span/><span/><span/><i>project</i></div><ProjectPreview name={project.name} description={project.description} live={project.live}/></Link><div className="project-meta"><div className="project-copy"><div className="project-title"><Link to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}>{project.name}</Link>{project.live && <span className="live-pill"><i/>Live</span>}</div><p>{list ? project.description : `Edited ${project.updated}`}</p></div><div className="project-actions"><button aria-label="Star project" className={project.starred ? "starred" : ""} onClick={onStar}><Star size={15} fill={project.starred ? "currentColor" : "none"}/></button><DropdownMenu.Root><DropdownMenu.Trigger asChild><button aria-label="Project menu"><MoreHorizontal size={16}/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="menu-content" align="end"><DropdownMenu.Item className="menu-item" onSelect={() => window.open("/project/" + project.id, "_blank", "noopener,noreferrer")}>Open in new tab</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></div></article>;
}

function SearchDialog({ open, onOpenChange, projects, query, onQueryChange }: { open: boolean; onOpenChange: (open: boolean) => void; projects: Project[]; query: string; onQueryChange: (query: string) => void }) {
  const filtered = projects.filter(project => (project.name + " " + project.description).toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="command-dialog"><div className="command-input"><Search size={17}/><input autoFocus value={query} onChange={event => onQueryChange(event.target.value)} onKeyDown={event => { if (event.key === "Escape") onOpenChange(false); }} placeholder="Search your projects…"/></div><p className="menu-label">PROJECTS</p>{filtered.map(project => <Link key={project.id} onClick={() => onOpenChange(false)} className="command-result" to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}><Folder size={15}/><span>{project.name}</span><Command size={13}/></Link>)}{!filtered.length && <p className="p-5 text-sm text-zinc-500">No matching projects.</p>}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUp, ChevronDown, ChevronsLeft, Command, Folder, Grid2X2, Home, Import,
  List, Menu, Mic, MoreHorizontal, Paperclip, PlugZap, Search, Settings, Share2,
  Star, User, Users, X, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import ambient from "@/assets/ambient-studio.jpg";
import { Button } from "@/components/ui/button";
import { ProjectPreview } from "./project-preview";
import { projects as seedProjects, type Project } from "@/lib/mock-data";

type Filter = "all" | "starred" | "mine" | "shared";

const nav = [
  ["Dashboard", Home], ["Search", Search], ["Connectors", PlugZap],
] as const;

export function Dashboard() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"Build" | "Plan">("Build");
  const [items, setItems] = useState(seedProjects);
  const [importOpen, setImportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const filtered = useMemo(() => items.filter((project) => {
    const matches = `${project.name} ${project.description}`.toLowerCase().includes(query.toLowerCase());
    if (filter === "starred") return matches && project.starred;
    if (filter === "shared") return matches && project.shared;
    if (filter === "mine") return matches && !project.shared;
    return matches;
  }), [filter, items, query]);

  const createProject = () => {
    if (!prompt.trim()) return;
    navigate({ to: "/project/$projectId", params: { projectId: "new-project" }, search: { prompt } });
  };

  const toggleStar = (id: string) => setItems((current) => current.map((item) => item.id === id ? { ...item, starred: !item.starred } : item));

  return (
    <div className="dashboard-shell">
      <img className="ambient-background" src={ambient} alt="" width={1536} height={1024} />
      <Button variant="outline" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={16}/></Button>
      <aside className={`dashboard-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span/><span/><span/></div>
          {!collapsed && <span className="brand-name">Lovable</span>}
          <Button variant="ghost" size="icon" className="sidebar-toggle" aria-label="Collapse sidebar" onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}><ChevronsLeft size={15}/></Button>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild><Button variant="outline" className="workspace-switcher"><span className="workspace-avatar">NH</span>{!collapsed && <><span className="truncate">Nathan's workspace</span><ChevronDown size={13}/></>}</Button></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="menu-content" sideOffset={6}><DropdownMenu.Label className="menu-label">WORKSPACES</DropdownMenu.Label><DropdownMenu.Item className="menu-item">Nathan's workspace <span>✓</span></DropdownMenu.Item><DropdownMenu.Item className="menu-item">Studio workspace</DropdownMenu.Item><DropdownMenu.Separator className="menu-separator"/><DropdownMenu.Item className="menu-item">Create workspace</DropdownMenu.Item><DropdownMenu.Item className="menu-item"><Settings size={14}/> Workspace settings</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
        <nav className="sidebar-scroll">
          <div className="nav-block">
            {nav.map(([label, Icon], i) => <button key={label} className={`nav-item ${i === 0 ? "active" : ""}`} onClick={() => label === "Search" ? setSearchOpen(true) : undefined}><Icon size={16}/>{!collapsed && <><span>{label}</span>{label === "Search" && <kbd>⌘K</kbd>}</>}</button>)}
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
          {!collapsed && <div className="credit-card"><div><Zap size={14}/><b>Daily credits</b><span>5 of 5 remaining</span></div><div className="progress"><span/></div><Button variant="outline" size="sm">Upgrade</Button></div>}
          <div className="profile-row"><span className="profile-avatar">N</span>{!collapsed && <><span className="profile-copy"><b>Nathan Hanry</b><small>Personal plan</small></span><Button variant="ghost" size="icon"><MoreHorizontal size={15}/></Button></>}</div>
        </div>
      </aside>

      <main className={`dashboard-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <section className="launchpad">
          <p className="eyebrow"><span/> Your workspace is ready</p>
          <h1>What do you want to build?</h1>
          <div className="hero-composer">
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); createProject(); } }} placeholder="Ask Lovable to build anything..." aria-label="Project prompt"/>
            <div className="composer-bar">
              <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon" aria-label="Attach"><Paperclip size={17}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="menu-content"><DropdownMenu.Item className="menu-item">Image or mockup</DropdownMenu.Item><DropdownMenu.Item className="menu-item">CSV or data</DropdownMenu.Item><DropdownMenu.Item className="menu-item">Use a template</DropdownMenu.Item><DropdownMenu.Item className="menu-item">Add a connector</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
              <div className="mode-switch"><button className={mode === "Build" ? "active" : ""} onClick={() => setMode("Build")}>Build</button><button className={mode === "Plan" ? "active" : ""} onClick={() => setMode("Plan")}>Plan</button></div>
              <span className="composer-spacer"/><Button variant="ghost" size="icon" aria-label="Voice input"><Mic size={17}/></Button><Button variant={prompt.trim() ? "primary" : "default"} size="icon" aria-label="Send prompt" onClick={createProject}><ArrowUp size={17}/></Button>
            </div>
          </div>
          <div className="prompt-suggestions"><button onClick={() => setPrompt("Build a refined analytics dashboard")}>Analytics dashboard</button><button onClick={() => setPrompt("Create an editorial ecommerce store")}>Online store</button><button onClick={() => setPrompt("Design a focused portfolio")}>Portfolio</button></div>
        </section>

        <section className="projects-section">
          <header className="projects-heading"><div><p>YOUR WORK</p><h2>Projects</h2></div><span>{filtered.length} projects</span></header>
          <div className="gallery-toolbar">
            <div className="tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All projects</button><button className={filter === "mine" ? "active" : ""} onClick={() => setFilter("mine")}>Created by me</button><button className={filter === "shared" ? "active" : ""} onClick={() => setFilter("shared")}>Shared with me</button></div>
            <div className="toolbar-actions"><label className="search-field"><Search size={14}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter projects"/></label><select aria-label="Sort projects"><option>Last modified</option><option>Alphabetical</option><option>Created date</option></select><Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Import size={14}/> Import</Button><div className="view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={15}/></button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={15}/></button></div></div>
          </div>
          <div className={`project-gallery ${view}`}>
            {filtered.map((project) => <ProjectCard key={project.id} project={project} list={view === "list"} onStar={() => toggleStar(project.id)}/>) }
          </div>
        </section>
      </main>
      {mobileOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>} 
      <ImportDialog open={importOpen} onOpenChange={setImportOpen}/>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} projects={items}/>
    </div>
  );
}

function SideFilter({ icon: Icon, label, count, active, collapsed, onClick }: { icon: typeof Home; label: string; count?: number; active: boolean; collapsed: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><Icon size={16}/>{!collapsed && <><span>{label}</span>{count !== undefined && <small>{count}</small>}</>}</button>;
}

function ProjectCard({ project, list, onStar }: { project: Project; list: boolean; onStar: () => void }) {
  return <article className="project-card"><Link className="preview-link" to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}><div className="browser-dots"><span/><span/><span/><i>preview</i></div><ProjectPreview tone={project.tone}/></Link><div className="project-meta"><div className="project-copy"><div className="project-title"><Link to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}>{project.name}</Link>{project.live && <span className="live-pill"><i/>Live</span>}</div><p>{list ? project.description : `Edited ${project.updated}`}</p></div><div className="project-actions"><button aria-label="Star project" className={project.starred ? "starred" : ""} onClick={onStar}><Star size={15} fill={project.starred ? "currentColor" : "none"}/></button><button aria-label="Share project"><Share2 size={15}/></button><DropdownMenu.Root><DropdownMenu.Trigger asChild><button aria-label="Project menu"><MoreHorizontal size={16}/></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="menu-content" align="end"><DropdownMenu.Item className="menu-item">Open in new tab</DropdownMenu.Item><DropdownMenu.Item className="menu-item">Rename</DropdownMenu.Item><DropdownMenu.Item className="menu-item">Duplicate</DropdownMenu.Item><DropdownMenu.Item className="menu-item">Project settings</DropdownMenu.Item><DropdownMenu.Separator className="menu-separator"/><DropdownMenu.Item className="menu-item danger">Delete</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></div></article>;
}

function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [tab, setTab] = useState("GitHub");
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Title>Import a project</Dialog.Title><Dialog.Description>Bring in an existing codebase and continue building.</Dialog.Description><Dialog.Close asChild><Button variant="ghost" size="icon" className="dialog-close"><X size={16}/></Button></Dialog.Close><div className="dialog-tabs">{["GitHub", "ZIP upload", "Local folder"].map(t => <button className={tab === t ? "active" : ""} onClick={() => setTab(t)} key={t}>{t}</button>)}</div><label className="form-label">{tab === "GitHub" ? "Repository URL" : "Project source"}<input placeholder={tab === "GitHub" ? "https://github.com/owner/repository" : "Choose a file to continue"}/></label><div className="dialog-actions"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="primary">Import project</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

function SearchDialog({ open, onOpenChange, projects }: { open: boolean; onOpenChange: (o: boolean) => void; projects: Project[] }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="command-dialog"><div className="command-input"><Search size={17}/><input autoFocus placeholder="Search projects and commands..."/></div><p className="menu-label">RECENT PROJECTS</p>{projects.slice(0,4).map(project => <Link key={project.id} className="command-result" to="/project/$projectId" params={{ projectId: project.id }} search={{ prompt: "" }}><Folder size={15}/><span>{project.name}</span><Command size={13}/></Link>)}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
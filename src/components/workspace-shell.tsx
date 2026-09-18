import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowDownUp,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Command,
  Copy,
  Database,
  ExternalLink,
  FileArchive,
  Folder,
  FolderOpen,
  Github,
  Grid2X2,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  List,
  LogOut,
  Menu,
  Mic,
  MoreHorizontal,
  Paperclip,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  PlugZap,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { createMockProject, type Project, type Workspace, workspaces } from "@/lib/mock-projects";

type ProjectFilter = "all" | "starred" | "owned" | "shared";
type ViewMode = "grid" | "list";
type PromptMode = "Build" | "Plan";
type ImportSource = "github" | "zip" | "folder";

const projectNav = [
  { id: "all" as ProjectFilter, label: "All projects", icon: Folder },
  { id: "starred" as ProjectFilter, label: "Starred", icon: Star },
  { id: "owned" as ProjectFilter, label: "My projects", icon: UserRound },
  { id: "shared" as ProjectFilter, label: "Shared projects", icon: Users },
];

function LogoMark() {
  return <span className="logo-mark" aria-label="Project Hub"><span /><span /><span /></span>;
}

function WorkspaceAvatar({ workspace }: { workspace: Workspace }) {
  return <span className="workspace-avatar workspace-avatar-small">{workspace.initials}</span>;
}

type SidebarProps = {
  collapsed: boolean;
  onCollapse: () => void;
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
  filter: ProjectFilter;
  setFilter: (filter: ProjectFilter) => void;
  projects: Project[];
  onCommand: () => void;
  onConnectors: () => void;
  onImport: () => void;
  onAccount: () => void;
};

function SidebarContent({ collapsed, onCollapse, workspace, setWorkspace, filter, setFilter, projects, onCommand, onConnectors, onImport, onAccount }: SidebarProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const owned = projects.filter((project) => project.access === "Owned by me").length;
  const shared = projects.filter((project) => project.access === "Shared with me").length;
  const countFor = (id: ProjectFilter) => id === "owned" ? owned : id === "shared" ? shared : id === "starred" ? projects.filter((project) => project.starred).length : projects.length;

  return <div className="flex h-full min-h-0 flex-col">
    <div className={cn("sidebar-brand-row", collapsed && "sidebar-brand-row-collapsed")}>
      <LogoMark />
      <Button variant="ghost" size="icon" className="sidebar-icon-button" onClick={onCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <PanelLeft /> : <PanelLeftClose />}
      </Button>
    </div>
    <div className="relative px-2">
      <Button variant="outline" className={cn("workspace-switcher", collapsed && "workspace-switcher-collapsed")} onClick={() => setWorkspaceOpen((value) => !value)} aria-expanded={workspaceOpen}>
        <WorkspaceAvatar workspace={workspace} />
        {!collapsed && <><span className="min-w-0 flex-1 truncate text-left">{workspace.name}</span><ChevronDown /></>}
      </Button>
      {workspaceOpen && !collapsed && <div className="workspace-popover">
        <p className="workspace-popover-heading">Workspaces</p>
        {workspaces.map((option) => <Button key={option.id} variant="ghost" className="workspace-option" onClick={() => { setWorkspace(option); setWorkspaceOpen(false); }}><WorkspaceAvatar workspace={option} /><span className="min-w-0 flex-1 truncate text-left">{option.name}</span>{option.id === workspace.id && <Check />}</Button>)}
        <Button variant="ghost" className="workspace-option"><Plus />Create workspace</Button>
      </div>}
    </div>

    <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
      <TooltipProvider delayDuration={250}>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={cn("sidebar-nav-button sidebar-nav-button-active", collapsed && "sidebar-nav-button-collapsed")}><LayoutDashboard />{!collapsed && "Dashboard"}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Dashboard</TooltipContent>}</Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={cn("sidebar-nav-button", collapsed && "sidebar-nav-button-collapsed")} onClick={onCommand}><Search />{!collapsed && <><span>Search</span><span className="ml-auto shortcut">⌘K</span></>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Search</TooltipContent>}</Tooltip>
        <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={cn("sidebar-nav-button", collapsed && "sidebar-nav-button-collapsed")} onClick={onConnectors}><PlugZap />{!collapsed && "Connectors"}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Connectors</TooltipContent>}</Tooltip>
      </TooltipProvider>

      <div className="sidebar-section-row mt-5">{!collapsed && <span className="sidebar-section-label">Projects</span>}{!collapsed && <Button variant="ghost" size="icon" className="sidebar-mini-button" onClick={() => setProjectsOpen((value) => !value)}>{projectsOpen ? <ChevronDown /> : <ChevronRight />}</Button>}</div>
      {projectsOpen && projectNav.map((item) => {
        const Icon = item.icon;
        return <Tooltip key={item.id}><TooltipTrigger asChild><Button variant="ghost" className={cn("sidebar-nav-button", filter === item.id && "sidebar-nav-button-active", collapsed && "sidebar-nav-button-collapsed")} onClick={() => setFilter(item.id)}><Icon />{!collapsed && <><span>{item.label}</span><span className="ml-auto sidebar-count">{countFor(item.id)}</span></>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}</Tooltip>;
      })}

      {!collapsed && <>
        <div className="sidebar-section-row mt-5"><span className="sidebar-section-label">Recents</span><Clock3 /></div>
        {projects.slice(0, 7).map((project) => <Link key={project.id} to="/project/$projectId" params={{ projectId: project.id }} className="recent-project"><span className={cn("recent-project-dot", `thumb-${project.tone}`)} /><span className="truncate">{project.name}</span></Link>)}
      </>}
    </div>

    {!collapsed ? <div className="sidebar-bottom">
      <Button variant="outline" className="upgrade-card"><span className="upgrade-icon"><Sparkles /></span><span className="min-w-0 flex-1 text-left"><strong>Upgrade to Pro</strong><small>Unlock more features</small></span><ArrowRight /></Button>
      <div className="sidebar-account-row"><Button variant="ghost" size="icon" className="inbox-button" aria-label="Inbox"><Bell /><span className="notification-badge">2</span></Button><Button variant="ghost" className="account-button" onClick={onAccount}><span className="account-avatar">JW</span><span className="min-w-0 flex-1 truncate text-left"><strong>Joshua Wilson</strong><small>Personal account</small></span><MoreHorizontal /></Button></div>
      <Button variant="ghost" className="sidebar-import" onClick={onImport}><Upload />Import project</Button>
    </div> : <div className="sidebar-collapsed-bottom"><Button variant="ghost" size="icon" className="account-avatar account-avatar-button" onClick={onAccount}>JW</Button></div>}
  </div>;
}

function ProjectThumbnail({ project, compact = false }: { project: Project; compact?: boolean }) {
  return <div className={cn("project-thumbnail", `thumb-${project.tone}`, compact && "project-thumbnail-compact")}><div className="thumbnail-window"><span /><span /><span /></div><div className="thumbnail-content"><span className="thumbnail-line thumbnail-line-long" /><span className="thumbnail-line" /><span className="thumbnail-block" /></div><div className="thumbnail-stamp">{project.name.slice(0, 1)}</div></div>;
}

type ProjectEntryProps = { project: Project; selected: boolean; onSelect: (id: string) => void; onStar: (id: string) => void };

function ProjectMenu({ project }: { project: Project }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="card-more" aria-label={`Actions for ${project.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuItem><ExternalLink />Open in new tab</DropdownMenuItem>{project.published && <DropdownMenuItem><ExternalLink />View published site</DropdownMenuItem>}<DropdownMenuItem><Copy />Copy project link</DropdownMenuItem><DropdownMenuItem><FolderOpen />Move to folder</DropdownMenuItem><DropdownMenuItem><Pencil />Rename</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem><Settings />Project settings</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
}

function ProjectCard({ project, selected, onSelect, onStar }: ProjectEntryProps) {
  return <article className={cn("project-card group", selected && "project-card-selected")}>
    <div className="relative"><Link to="/project/$projectId" params={{ projectId: project.id }} aria-label={`Open ${project.name}`}><ProjectThumbnail project={project} /></Link><Button variant="ghost" size="icon" className={cn("card-select", selected && "card-select-active")} onClick={() => onSelect(project.id)} aria-label={`${selected ? "Deselect" : "Select"} ${project.name}`}>{selected ? <Check /> : <span />}</Button><Button variant="ghost" size="icon" className={cn("card-star", project.starred && "card-star-active")} onClick={() => onStar(project.id)} aria-label={`${project.starred ? "Unstar" : "Star"} ${project.name}`}><Star className={cn(project.starred && "fill-current")} /></Button><ProjectMenu project={project} /></div>
    <Link to="/project/$projectId" params={{ projectId: project.id }} className="project-card-copy"><div className="flex min-w-0 items-center justify-between gap-2"><h3 className="truncate">{project.name}</h3>{project.published && <span className="published-badge"><span />Published</span>}</div><p>{project.updatedLabel} · {project.owner === "Joshua Wilson" ? "Free" : "Shared"}</p></Link>
  </article>;
}

function ProjectListRow({ project, selected, onSelect, onStar }: ProjectEntryProps) {
  return <div className={cn("project-list-row", selected && "project-card-selected")}><Button variant="ghost" size="icon" className={cn("list-select", selected && "card-select-active")} onClick={() => onSelect(project.id)}>{selected ? <Check /> : <span />}</Button><Link to="/project/$projectId" params={{ projectId: project.id }} className="flex min-w-0 items-center gap-3"><ProjectThumbnail project={project} compact /><div className="min-w-0"><strong className="truncate">{project.name}</strong><small className="truncate">{project.description}</small></div></Link><span>{project.updatedLabel}</span><span>{project.published ? "Published" : "Draft"}</span><Button variant="ghost" size="icon" className={cn("list-action", project.starred && "card-star-active")} onClick={() => onStar(project.id)}><Star className={cn(project.starred && "fill-current")} /></Button><ProjectMenu project={project} /></div>;
}

function CreateProjectDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (name: string, description: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const submit = () => { if (!name.trim()) return; onCreate(name, description); setName(""); setDescription(""); onOpenChange(false); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="dashboard-dialog"><DialogHeader><div className="dialog-kicker"><Sparkles />New project</div><DialogTitle>Start with a clear idea</DialogTitle><DialogDescription>Name your project and give it a useful first brief.</DialogDescription></DialogHeader><div className="space-y-4 py-3"><div><label className="form-label" htmlFor="project-name">Project name</label><Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Focus OS" autoFocus /></div><div><label className="form-label" htmlFor="project-description">Initial brief</label><Textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A focused workspace for..." /></div><div className="create-option"><LayoutTemplate /><span><strong>Blank project</strong><small>Start with a clean foundation</small></span><Check /></div></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={!name.trim()}>Create project</Button></DialogFooter></DialogContent></Dialog>;
}

function ImportProjectDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [source, setSource] = useState<ImportSource>("github");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const zipRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const sourceData = { github: { icon: Github, title: "GitHub repository", copy: "Paste a public or private repository URL." }, zip: { icon: FileArchive, title: "ZIP archive", copy: "Choose a compressed project from this device." }, folder: { icon: FolderOpen, title: "Local folder", copy: "Select a project directory from this device." } };
  const active = sourceData[source];
  const ActiveIcon = active.icon;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="dashboard-dialog import-dialog"><DialogHeader><DialogTitle>Import a project</DialogTitle><DialogDescription>Choose a source. This preview validates the entry without uploading anything.</DialogDescription></DialogHeader><div className="import-source-grid">{(Object.keys(sourceData) as ImportSource[]).map((item) => { const Icon = sourceData[item].icon; return <Button key={item} variant="outline" className={cn("import-source", source === item && "import-source-active")} onClick={() => { setSource(item); setFileName(""); }}><Icon /><span>{sourceData[item].title}</span>{source === item && <Check />}</Button>; })}</div><div className="import-entry"><ActiveIcon /><div><strong>{active.title}</strong><small>{active.copy}</small></div>{source === "github" ? <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://github.com/owner/repository" /> : <><input ref={source === "zip" ? zipRef : folderRef} type="file" accept={source === "zip" ? ".zip" : undefined} className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /><Button variant="outline" onClick={() => (source === "zip" ? zipRef.current : folderRef.current)?.click()}><Upload />{fileName || (source === "zip" ? "Choose ZIP" : "Choose folder")}</Button></>}</div><p className="import-note">Import analysis and file ingestion will be connected in a later phase.</p><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={source === "github" ? !url.trim() : !fileName} onClick={() => onOpenChange(false)}>Analyze import</Button></DialogFooter></DialogContent></Dialog>;
}

function CommandDialog({ open, onOpenChange, projects }: { open: boolean; onOpenChange: (open: boolean) => void; projects: Project[] }) {
  const [query, setQuery] = useState("");
  const matches = projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="dashboard-dialog command-dialog"><DialogHeader><DialogTitle className="sr-only">Search workspace</DialogTitle><DialogDescription className="sr-only">Search projects and settings.</DialogDescription></DialogHeader><div className="command-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, folders, settings..." autoFocus /><span>ESC</span></div><div className="command-results">{matches.map((project) => <Link key={project.id} to="/project/$projectId" params={{ projectId: project.id }} className="command-result" onClick={() => onOpenChange(false)}><ProjectThumbnail project={project} compact /><span>{project.name}</span><ArrowRight /></Link>)}{!matches.length && <p>No matching projects</p>}</div></DialogContent></Dialog>;
}

function InfoPanel({ type, open, onOpenChange }: { type: "connectors" | "account"; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="dashboard-sheet"><SheetHeader><SheetTitle>{type === "connectors" ? "Connectors" : "Joshua Wilson"}</SheetTitle><SheetDescription>{type === "connectors" ? "Bring your tools into one focused workspace." : "joshua@example.com"}</SheetDescription></SheetHeader>{type === "connectors" ? <div className="connector-list"><div className="connector-item"><Github /><span><strong>GitHub</strong><small>Repositories and issues</small></span><Button variant="outline" size="sm" disabled>Later</Button></div><div className="connector-item"><Database /><span><strong>Database</strong><small>Project data and services</small></span><Button variant="outline" size="sm" disabled>Later</Button></div></div> : <div className="account-panel-actions"><Link to="/settings" className="account-menu-link"><Settings />Account settings</Link><Button variant="ghost" className="account-menu-link"><HelpCircle />Help center</Button><Button variant="ghost" className="account-menu-link"><LogOut />Sign out</Button></div>}</SheetContent></Sheet>;
}

export function WorkspaceShell() {
  const [workspace, setWorkspace] = useState<Workspace>(() => { const first = workspaces[0]; if (!first) throw new Error("At least one workspace is required"); return first; });
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<Record<string, Project[]>>(() => Object.fromEntries(workspaces.map((item) => [item.id, item.projects])));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [mode, setMode] = useState<PromptMode>("Build");
  const [prompt, setPrompt] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [connectorsOpen, setConnectorsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") { event.preventDefault(); setCollapsed((value) => !value); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "a" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); setSelected((projectsByWorkspace[workspace.id] ?? []).map((project) => project.id)); }
      if (event.key === "[" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) setCollapsed((value) => !value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [projectsByWorkspace, workspace.id]);

  const projects = projectsByWorkspace[workspace.id] ?? [];
  const visibleProjects = useMemo(() => projects.filter((project) => {
    const matchesFilter = filter === "all" || (filter === "starred" && project.starred) || (filter === "owned" && project.access === "Owned by me") || (filter === "shared" && project.access === "Shared with me");
    const term = query.trim().toLowerCase();
    return matchesFilter && (!term || `${project.name} ${project.description} ${project.owner}`.toLowerCase().includes(term));
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [filter, projects, query, sort]);

  const addProject = (name: string, description: string) => setProjectsByWorkspace((current) => ({ ...current, [workspace.id]: [createMockProject(name, description, workspace.id), ...(current[workspace.id] ?? [])] }));
  const submitPrompt = () => { if (!prompt.trim()) return; if (mode === "Plan") { setCreateOpen(true); return; } addProject(prompt.slice(0, 36), prompt); setPrompt(""); };
  const toggleStar = (id: string) => setProjectsByWorkspace((current) => ({ ...current, [workspace.id]: (current[workspace.id] ?? []).map((project) => project.id === id ? { ...project, starred: !project.starred } : project) }));
  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const deleteSelected = () => { setProjectsByWorkspace((current) => ({ ...current, [workspace.id]: (current[workspace.id] ?? []).filter((project) => !selected.includes(project.id)) })); setSelected([]); };
  const chooseWorkspace = (next: Workspace) => { setWorkspace(next); setFilter("all"); setQuery(""); setSelected([]); setMobileNavOpen(false); setLoading(true); window.setTimeout(() => setLoading(false), 450); };
  const sidebarProps: SidebarProps = { collapsed, onCollapse: () => setCollapsed((value) => !value), workspace, setWorkspace: chooseWorkspace, filter, setFilter, projects, onCommand: () => setCommandOpen(true), onConnectors: () => setConnectorsOpen(true), onImport: () => setImportOpen(true), onAccount: () => setAccountOpen(true) };

  return <TooltipProvider delayDuration={250}><div className="workspace-app dashboard-theme">
    <aside className={cn("app-sidebar", collapsed && "app-sidebar-collapsed")}><SidebarContent {...sidebarProps} /></aside>
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}><SheetContent side="left" className="mobile-sidebar dashboard-theme"><SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>Workspace navigation</SheetDescription></SheetHeader><SidebarContent {...sidebarProps} collapsed={false} onCollapse={() => setMobileNavOpen(false)} /></SheetContent></Sheet>
    <main className="workspace-main">
      <div className="mobile-dashboard-bar"><Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu /></Button><LogoMark /><span>{workspace.name}</span><Button variant="ghost" size="icon" onClick={() => setCommandOpen(true)}><Search /></Button></div>
      <section className="dashboard-hero">
        <div className="dashboard-aurora" aria-hidden="true"><span /><span /><span /></div>
        <div className="dashboard-hero-content">
          <Button variant="outline" className="connect-tools" onClick={() => setConnectorsOpen(true)}><span className="tool-dots"><i /><i /><i /></span>Connect all your tools<ArrowRight /></Button>
          <h1>What should we build, Joshua?</h1>
          <div className="prompt-composer"><Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask Project Hub to build an internal tool..." onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submitPrompt(); }} /><div className="prompt-composer-bottom"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="prompt-tool" aria-label="Add context"><Plus /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="dashboard-menu"><DropdownMenuItem><Paperclip />Attach files</DropdownMenuItem><DropdownMenuItem><LayoutTemplate />Add context</DropdownMenuItem><DropdownMenuItem onClick={() => setConnectorsOpen(true)}><PlugZap />Connectors</DropdownMenuItem><DropdownMenuItem><Database />Databases</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setImportOpen(true)}><Upload />Import project</DropdownMenuItem></DropdownMenuContent></DropdownMenu><span className="prompt-spacer" /><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="mode-trigger">{mode}<ChevronDown className={mode === "Plan" ? "rotate-180" : ""} /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="mode-menu dashboard-menu"><DropdownMenuItem onClick={() => setMode("Build")}><span><strong>Build</strong><small>Make changes directly</small></span>{mode === "Build" && <Check />}</DropdownMenuItem><DropdownMenuItem onClick={() => setMode("Plan")}><span><strong>Plan</strong><small>Discuss before building</small></span>{mode === "Plan" && <Check />}</DropdownMenuItem><div className="mode-hint">Switch modes with <kbd>Alt</kbd> <kbd>P</kbd></div></DropdownMenuContent></DropdownMenu><Button variant="ghost" size="icon" className="prompt-tool" aria-label="Use voice input"><Mic /></Button><Button size="icon" className="prompt-send" onClick={submitPrompt} disabled={!prompt.trim()} aria-label="Submit prompt"><Send /></Button></div></div>
        </div>
      </section>

      <section className="project-gallery">
        <div className="project-gallery-toolbar"><div className="gallery-tabs"><div className="project-search"><Search /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></div><Button variant="ghost" className={filter === "owned" ? "gallery-tab-active" : ""} onClick={() => setFilter("owned")}>My projects</Button><Button variant="ghost" onClick={() => setSort("recent")}>Recently viewed</Button><Button variant="ghost" className={filter === "shared" ? "gallery-tab-active" : ""} onClick={() => setFilter("shared")}>Shared with me</Button><Button variant="ghost" onClick={() => setFilter("all")}>All projects</Button></div><Button variant="ghost" className="browse-all" onClick={() => setFilter("all")}>Browse all<ArrowRight /></Button></div>
        <div className="gallery-controls"><div><h2>{projectNav.find((item) => item.id === filter)?.label ?? "Projects"}</h2><span>{visibleProjects.length} projects</span></div><div><Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload />Import</Button><Button variant="outline" size="sm"><SlidersHorizontal />Filter</Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm"><ArrowDownUp />{sort === "recent" ? "Recent" : "Name"}<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent className="dashboard-menu"><DropdownMenuItem onClick={() => setSort("recent")}><Clock3 />Recently updated</DropdownMenuItem><DropdownMenuItem onClick={() => setSort("name")}><ArrowDownUp />Name</DropdownMenuItem></DropdownMenuContent></DropdownMenu><div className="view-toggle"><Button variant="ghost" size="icon" className={view === "grid" ? "view-toggle-active" : ""} onClick={() => setView("grid")}><Grid2X2 /></Button><Button variant="ghost" size="icon" className={view === "list" ? "view-toggle-active" : ""} onClick={() => setView("list")}><List /></Button></div></div></div>
        {selected.length > 0 && <div className="bulk-toolbar"><span>{selected.length} selected</span><Button variant="ghost" size="sm"><FolderOpen />Move</Button><Button variant="ghost" size="sm"><Copy />Duplicate</Button><Button variant="ghost" size="sm" onClick={deleteSelected}><Trash2 />Delete</Button><Button variant="ghost" size="icon" onClick={() => setSelected([])}><X /></Button></div>}
        {loading ? <div className="project-loading">{Array.from({ length: 6 }).map((_, index) => <div className="loading-card" key={index}><div className="skeleton skeleton-thumb" /><div className="skeleton skeleton-line" /></div>)}</div> : visibleProjects.length === 0 ? <div className="empty-state"><Search /><h3>No projects found</h3><p>Try another search or return to all projects.</p><Button variant="outline" onClick={() => { setQuery(""); setFilter("all"); }}>View all projects</Button></div> : view === "grid" ? <div className="project-grid">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} selected={selected.includes(project.id)} onSelect={toggleSelected} onStar={toggleStar} />)}</div> : <div className="project-list">{visibleProjects.map((project) => <ProjectListRow key={project.id} project={project} selected={selected.includes(project.id)} onSelect={toggleSelected} onStar={toggleStar} />)}</div>}
      </section>
    </main>
    <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addProject} />
    <ImportProjectDialog open={importOpen} onOpenChange={setImportOpen} />
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} projects={projects} />
    <InfoPanel type="connectors" open={connectorsOpen} onOpenChange={setConnectorsOpen} />
    <InfoPanel type="account" open={accountOpen} onOpenChange={setAccountOpen} />
  </div></TooltipProvider>;
}
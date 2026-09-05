import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  Command,
  Copy,
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
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
  ShieldCheck,
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

const projectNav = [
  { id: "all" as ProjectFilter, label: "All projects", icon: Folder },
  { id: "starred" as ProjectFilter, label: "Starred", icon: Star },
  { id: "owned" as ProjectFilter, label: "Owned by me", icon: UserRound },
  { id: "shared" as ProjectFilter, label: "Shared with me", icon: Users },
];

function LogoMark() {
  return <span className="logo-mark" aria-hidden="true"><span /><span /><span /></span>;
}

function WorkspaceAvatar({ workspace, small = false }: { workspace: Workspace; small?: boolean }) {
  return <span className={cn("workspace-avatar", small && "workspace-avatar-small")}>{workspace.initials}</span>;
}

function SidebarContent({
  collapsed,
  onCollapse,
  workspace,
  setWorkspace,
  filter,
  setFilter,
  projects,
  onNotifications,
  onCommand,
  onCreate,
  onAccount,
}: {
  collapsed: boolean;
  onCollapse: () => void;
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
  filter: ProjectFilter;
  setFilter: (filter: ProjectFilter) => void;
  projects: Project[];
  onNotifications: () => void;
  onCommand: () => void;
  onCreate: () => void;
  onAccount: () => void;
}) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const ownedProjects = projects.filter((project) => project.access === "Owned by me");
  const sharedProjects = projects.filter((project) => project.access === "Shared with me");
  const folders = Array.from(new Set(projects.map((project) => project.folder).filter(Boolean))) as string[];

  const navButton = (active: boolean) => cn(
    "sidebar-nav-button",
    active && "sidebar-nav-button-active",
    collapsed && "sidebar-nav-button-collapsed",
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("sidebar-brand-row", collapsed && "sidebar-brand-row-collapsed")}>
        <div className="flex min-w-0 items-center gap-2">
          <LogoMark />
          {!collapsed && <span className="sidebar-brand">lovable</span>}
        </div>
        <Button variant="ghost" size="icon" className="sidebar-icon-button" onClick={onCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      <div className="relative px-2">
        <Button variant="ghost" className={cn("workspace-switcher", collapsed && "workspace-switcher-collapsed")} onClick={() => setWorkspaceOpen(!workspaceOpen)} aria-expanded={workspaceOpen} aria-label="Switch workspace">
          <WorkspaceAvatar workspace={workspace} small />
          {!collapsed && <><span className="min-w-0 flex-1 truncate text-left">{workspace.name}</span><ChevronDown className="size-3.5 shrink-0 text-muted-foreground" /></>}
        </Button>
        {workspaceOpen && !collapsed && (
          <div className="workspace-popover">
            <div className="workspace-popover-heading">Your workspaces</div>
            {workspaces.map((option) => (
              <Button key={option.id} variant="ghost" className="workspace-option" onClick={() => { setWorkspace(option); setWorkspaceOpen(false); }}>
                <WorkspaceAvatar workspace={option} small />
                <span className="min-w-0 flex-1 truncate text-left">{option.name}</span>
                {option.id === workspace.id && <Check className="size-4 text-primary" />}
              </Button>
            ))}
            <div className="mt-1 border-t border-border pt-1">
              <Button variant="ghost" className="workspace-option"><Plus className="size-4" />Create workspace</Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-3">
        <div className="sidebar-section-label">{!collapsed && "Workspace"}</div>
        <TooltipProvider delayDuration={300}>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={navButton(true)} onClick={() => setFilter("all")}><LayoutDashboard className="size-4 shrink-0" />{!collapsed && <span>Dashboard</span>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Dashboard</TooltipContent>}</Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={navButton(false)} onClick={onCommand}><Search className="size-4 shrink-0" />{!collapsed && <><span>Search</span><span className="ml-auto shortcut">⌘ K</span></>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Search</TooltipContent>}</Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" className={navButton(false)} onClick={onNotifications}><Inbox className="size-4 shrink-0" />{!collapsed && <><span>Inbox</span><span className="notification-dot" /></>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">Inbox</TooltipContent>}</Tooltip>
        </TooltipProvider>

        <div className="sidebar-section-row mt-5">
          {!collapsed && <span className="sidebar-section-label">Projects</span>}
          {!collapsed && <Button variant="ghost" size="icon" className="sidebar-mini-button" onClick={() => setProjectsOpen(!projectsOpen)} aria-label={projectsOpen ? "Collapse projects" : "Expand projects"}>{projectsOpen ? <ChevronDown /> : <ChevronRight />}</Button>}
        </div>
        {projectsOpen && <div className="space-y-0.5">
          {projectNav.map((item) => {
            const count = item.id === "owned" ? ownedProjects.length : item.id === "shared" ? sharedProjects.length : item.id === "starred" ? projects.filter((project) => project.starred).length : projects.length;
            const Icon = item.icon;
            return <Tooltip key={item.id}><TooltipTrigger asChild><Button variant="ghost" className={navButton(filter === item.id)} onClick={() => setFilter(item.id)}><Icon className={cn("size-4 shrink-0", item.id === "starred" && filter !== "starred" && "stroke-[1.7]")} />{!collapsed && <><span>{item.label}</span><span className="ml-auto sidebar-count">{count}</span></>}</Button></TooltipTrigger>{collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}</Tooltip>;
          })}
        </div>}

        {!collapsed && folders.length > 0 && <>
          <div className="sidebar-section-row mt-5">
            <span className="sidebar-section-label">Folders</span>
            <Button variant="ghost" size="icon" className="sidebar-mini-button" onClick={() => setFoldersOpen(!foldersOpen)} aria-label={foldersOpen ? "Collapse folders" : "Expand folders"}>{foldersOpen ? <ChevronDown /> : <ChevronRight />}</Button>
          </div>
          {foldersOpen && <div className="space-y-0.5">
            {folders.slice(0, 3).map((folder) => <Button key={folder} variant="ghost" className="sidebar-nav-button"><Folder className="size-4 shrink-0" /><span className="truncate">{folder}</span><span className="ml-auto sidebar-count">{projects.filter((project) => project.folder === folder).length}</span></Button>)}
          </div>}
        </>}

        {!collapsed && <>
          <div className="sidebar-section-row mt-5"><span className="sidebar-section-label">Recent</span><Clock3 className="size-3.5 text-muted-foreground" /></div>
          <div className="space-y-0.5">{projects.slice(0, 4).map((project) => <Link key={project.id} to="/project/$projectId" params={{ projectId: project.id }} className="recent-project"><span className={cn("recent-project-dot", `thumb-${project.tone}`)} /> <span className="truncate">{project.name}</span></Link>)}</div>
        </>}
      </div>

      {!collapsed && <div className="sidebar-bottom">
        <Button variant="ghost" className="sidebar-nav-button" onClick={onCreate}><Plus className="size-4" /><span>New project</span><span className="ml-auto shortcut">⌘ N</span></Button>
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles className="size-3.5" /></div><div className="min-w-0 flex-1"><p className="upgrade-title">Free plan</p><p className="upgrade-copy">40 credits remaining</p></div><Button variant="ghost" size="icon" className="upgrade-arrow" aria-label="View upgrade options"><ArrowRight className="size-4" /></Button></div>
        <div className="sidebar-account-row">
          <Button variant="ghost" size="icon" className="inbox-button" onClick={onNotifications} aria-label="Open inbox"><Bell className="size-4" /><span className="notification-badge">2</span></Button>
          <Button variant="ghost" className="account-button" onClick={onAccount}><span className="account-avatar">JW</span><span className="min-w-0 flex-1 truncate text-left"><span className="block text-sm font-medium">Joshua Wilson</span><span className="block truncate text-[11px] text-muted-foreground">Personal account</span></span><MoreHorizontal className="size-4 text-muted-foreground" /></Button>
        </div>
      </div>}
      {collapsed && <div className="sidebar-collapsed-bottom"><Button variant="ghost" size="icon" className="sidebar-icon-button" onClick={onNotifications} aria-label="Open inbox" title="Inbox"><Bell className="size-4" /><span className="notification-badge notification-badge-collapsed">2</span></Button><Button variant="ghost" size="icon" className="account-avatar account-avatar-button" onClick={onAccount} aria-label="Open account menu" title="Joshua Wilson">JW</Button></div>}
    </div>
  );
}

function ProjectThumbnail({ project, compact = false }: { project: Project; compact?: boolean }) {
  return <div className={cn("project-thumbnail", `thumb-${project.tone}`, compact && "project-thumbnail-compact")}>
    <div className="thumbnail-window"><span /><span /><span /></div>
    <div className="thumbnail-content"><span className="thumbnail-line thumbnail-line-long" /><span className="thumbnail-line" /><span className="thumbnail-block" /></div>
    <div className="thumbnail-stamp">{project.name.slice(0, 1)}</div>
  </div>;
}

function ProjectCard({ project, onStar }: { project: Project; onStar: (id: string) => void }) {
  return <article className="project-card group">
    <div className="relative">
      <Link to="/project/$projectId" params={{ projectId: project.id }} className="block" aria-label={`Open ${project.name}`}><ProjectThumbnail project={project} /></Link>
      <Button variant="ghost" size="icon" className={cn("card-star", project.starred && "card-star-active")} onClick={() => onStar(project.id)} aria-label={project.starred ? `Unstar ${project.name}` : `Star ${project.name}`}><Star className={cn("size-4", project.starred && "fill-current")} /></Button>
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="card-more" aria-label={`Actions for ${project.name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem><ExternalLink />Open in new tab</DropdownMenuItem><DropdownMenuItem><Copy />Copy project link</DropdownMenuItem><DropdownMenuItem><FolderOpen />Move to folder</DropdownMenuItem><DropdownMenuItem><Pencil />Rename project</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem><Settings />Project settings</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 />Delete project</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
    </div>
    <Link to="/project/$projectId" params={{ projectId: project.id }} className="project-card-copy"><div className="flex min-w-0 items-start justify-between gap-2"><h3 className="truncate text-sm font-semibold text-foreground">{project.name}</h3>{project.published && <span className="published-badge"><span />Live</span>}</div><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p><div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground"><span>{project.updatedLabel}</span><span className="text-border">•</span><span className="truncate">{project.owner === "Joshua Wilson" ? "You" : project.owner}</span></div></Link>
  </article>;
}

function ProjectListRow({ project, onStar }: { project: Project; onStar: (id: string) => void }) {
  return <div className="project-list-row"><Link to="/project/$projectId" params={{ projectId: project.id }} className="flex min-w-0 items-center gap-3"><ProjectThumbnail project={project} compact /><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{project.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{project.description}</p></div></Link><span className="hidden text-xs text-muted-foreground md:block">{project.updatedLabel}</span><span className="hidden text-xs text-muted-foreground lg:block">{project.owner === "Joshua Wilson" ? "You" : project.owner}</span><div className="flex items-center gap-1"><Button variant="ghost" size="icon" className={cn("list-action", project.starred && "card-star-active")} onClick={() => onStar(project.id)} aria-label={project.starred ? `Unstar ${project.name}` : `Star ${project.name}`}><Star className={cn("size-4", project.starred && "fill-current")} /></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="list-action" aria-label={`Actions for ${project.name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Pencil />Rename</DropdownMenuItem><DropdownMenuItem><FolderOpen />Move to folder</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>;
}

function EmptyState({ query, filter, onReset }: { query: string; filter: ProjectFilter; onReset: () => void }) {
  const title = query ? "No projects found" : filter === "starred" ? "No starred projects" : filter === "shared" ? "Nothing shared with you yet" : "This space is empty";
  const copy = query ? `No projects match “${query}”. Try a different search.` : "Projects you create or collaborate on will appear here.";
  return <div className="empty-state"><div className="empty-state-icon"><Search className="size-5" /></div><h3>{title}</h3><p>{copy}</p><Button variant="outline" size="sm" onClick={onReset}>{query ? "Clear search" : "View all projects"}</Button></div>;
}

function CreateProjectDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (name: string, description: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const submit = () => { onCreate(name, description); setName(""); setDescription(""); onOpenChange(false); };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="create-dialog"><DialogHeader><div className="dialog-kicker"><Sparkles className="size-3.5" /> New project</div><DialogTitle>What should we build?</DialogTitle><DialogDescription>Start with a clear idea. You can shape the details as you go.</DialogDescription></DialogHeader><div className="space-y-4 py-3"><div><label htmlFor="project-name" className="form-label">Project name</label><Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Focus OS" autoFocus /></div><div><label htmlFor="project-description" className="form-label">Describe the project</label><Textarea id="project-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="A private workspace for..." className="min-h-28 resize-none" /></div><div className="create-option"><LayoutTemplate className="size-4 text-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">Start from a blank canvas</p><p className="text-xs text-muted-foreground">A clean foundation with the essentials ready.</p></div><Check className="size-4 text-primary" /></div></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} disabled={!name.trim()}><Sparkles />Create project</Button></DialogFooter></DialogContent></Dialog>;
}

function CommandDialog({ open, onOpenChange, projects }: { open: boolean; onOpenChange: (open: boolean) => void; projects: Project[] }) {
  const [query, setQuery] = useState("");
  const matches = projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="command-dialog"><DialogHeader><DialogTitle className="sr-only">Search workspace</DialogTitle><DialogDescription className="sr-only">Search projects, folders, and settings.</DialogDescription></DialogHeader><div className="command-search"><Search className="size-4" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, folders, settings..." autoFocus /><span className="command-key">ESC</span></div><div className="command-results"><p className="command-heading">{query ? "Projects" : "Quick actions"}</p>{!query && <><Button variant="ghost" className="command-result"><Plus /><span>New project</span><span className="command-result-key">⌘ N</span></Button><Button variant="ghost" className="command-result"><Settings /><span>Open settings</span><span className="command-result-key">⌘ .</span></Button><Button variant="ghost" className="command-result"><HelpCircle /><span>Help center</span></Button></>}{query && (matches.length ? matches.map((project) => <Link key={project.id} to="/project/$projectId" params={{ projectId: project.id }} className="command-result" onClick={() => onOpenChange(false)}><ProjectThumbnail project={project} compact /><span className="min-w-0 flex-1 truncate">{project.name}</span><ArrowRight className="size-4" /></Link>) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching projects</p>)}</div><div className="command-footer"><span><Command className="size-3" /> Navigate</span><span><ArrowRight className="size-3" /> Open</span></div></DialogContent></Dialog>;
}

function NotificationPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="notification-panel"><SheetHeader><SheetTitle>Inbox</SheetTitle><SheetDescription>Updates from your workspaces and projects.</SheetDescription></SheetHeader><div className="notification-tabs"><Button variant="ghost" className="notification-tab notification-tab-active">All <span>2</span></Button><Button variant="ghost" className="notification-tab">Mentions</Button></div><div className="notification-list"><div className="notification-item"><div className="notification-icon notification-icon-blue"><Users className="size-4" /></div><div className="min-w-0 flex-1"><p><strong>Maya shared</strong> Accountability Room with you</p><span>2 hours ago</span></div><span className="notification-unread" /></div><div className="notification-item"><div className="notification-icon notification-icon-amber"><Sparkles className="size-4" /></div><div className="min-w-0 flex-1"><p>Your free plan has <strong>40 credits</strong> remaining</p><span>Yesterday</span></div></div><div className="notification-item"><div className="notification-icon notification-icon-muted"><ShieldCheck className="size-4" /></div><div className="min-w-0 flex-1"><p>Your workspace security settings are up to date</p><span>Aug 28</span></div></div></div><div className="notification-empty"><Check className="size-4" /> You’re all caught up</div></SheetContent></Sheet>;
}

function AccountMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="left" className="account-panel"><SheetHeader><div className="account-panel-avatar">JW</div><SheetTitle>Joshua Wilson</SheetTitle><SheetDescription>joshua@example.com</SheetDescription></SheetHeader><div className="account-panel-actions"><Link to="/settings" className="account-menu-link" onClick={() => onOpenChange(false)}><Settings />Account settings</Link><Button variant="ghost" className="account-menu-link"><Sparkles />Appearance</Button><Button variant="ghost" className="account-menu-link"><HelpCircle />Help center</Button><div className="my-2 border-t border-border" /><Button variant="ghost" className="account-menu-link text-destructive"><LogOut />Sign out</Button></div></SheetContent></Sheet>;
}

export function WorkspaceShell() {
  const [workspace, setWorkspace] = useState(workspaces[0]);
  const [projectsByWorkspace, setProjectsByWorkspace] = useState<Record<string, Project[]>>(() => Object.fromEntries(workspaces.map((item) => [item.id, item.projects])));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const projects = projectsByWorkspace[workspace.id] ?? [];
  const visibleProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesFilter = filter === "all" || (filter === "starred" && project.starred) || (filter === "owned" && project.access === "Owned by me") || (filter === "shared" && project.access === "Shared with me");
      const matchesQuery = !normalized || `${project.name} ${project.description}`.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [filter, projects, query, sort]);

  const selectWorkspace = (nextWorkspace: Workspace) => {
    setWorkspace(nextWorkspace); setFilter("all"); setQuery(""); setLoading(true); setMobileNavOpen(false); window.setTimeout(() => setLoading(false), 420);
  };
  const addProject = (name: string, description: string) => {
    const project = createMockProject(name, description, workspace.id);
    setProjectsByWorkspace((current) => ({ ...current, [workspace.id]: [project, ...(current[workspace.id] ?? [])] }));
  };
  const submitPrompt = () => { if (!prompt.trim()) return; addProject(prompt.trim().slice(0, 36), prompt.trim()); setPrompt(""); };
  const toggleStar = (id: string) => setProjectsByWorkspace((current) => ({ ...current, [workspace.id]: (current[workspace.id] ?? []).map((project) => project.id === id ? { ...project, starred: !project.starred } : project) }));

  return <TooltipProvider delayDuration={300}><div className="workspace-app">
    <aside className={cn("app-sidebar", collapsed && "app-sidebar-collapsed")}><SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} workspace={workspace} setWorkspace={selectWorkspace} filter={filter} setFilter={setFilter} projects={projects} onNotifications={() => setNotificationsOpen(true)} onCommand={() => setCommandOpen(true)} onCreate={() => setCreateOpen(true)} onAccount={() => setAccountOpen(true)} /></aside>
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}><SheetContent side="left" className="mobile-sidebar"><SheetHeader className="sr-only"><SheetTitle>Workspace navigation</SheetTitle><SheetDescription>Navigate between your dashboard, projects, and workspace tools.</SheetDescription></SheetHeader><SidebarContent collapsed={false} onCollapse={() => setMobileNavOpen(false)} workspace={workspace} setWorkspace={selectWorkspace} filter={filter} setFilter={setFilter} projects={projects} onNotifications={() => { setMobileNavOpen(false); setNotificationsOpen(true); }} onCommand={() => { setMobileNavOpen(false); setCommandOpen(true); }} onCreate={() => { setMobileNavOpen(false); setCreateOpen(true); }} onAccount={() => { setMobileNavOpen(false); setAccountOpen(true); }} /></SheetContent></Sheet>
    <main className="workspace-main">
      <header className="workspace-topbar"><div className="flex min-w-0 items-center gap-2"><Button variant="ghost" size="icon" className="mobile-menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></Button><div className="mobile-topbar-logo"><LogoMark /></div><Button variant="ghost" className="topbar-search" onClick={() => setCommandOpen(true)}><Search className="size-4" /><span className="hidden sm:inline">Search projects, folders, settings</span><span className="topbar-search-key">⌘ K</span></Button></div><div className="topbar-actions"><Button variant="ghost" size="icon" className="topbar-icon-button hidden sm:inline-flex" onClick={() => setNotificationsOpen(true)} aria-label="Open inbox"><Inbox className="size-4" /><span className="topbar-unread" /></Button><Button variant="ghost" size="icon" className="topbar-icon-button hidden sm:inline-flex" aria-label="What's new"><Sparkles className="size-4" /></Button><Button className="topbar-create" onClick={() => setCreateOpen(true)}><Plus /> <span className="hidden sm:inline">New project</span></Button><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="topbar-avatar" aria-label="Open account menu"><span>JW</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuItem><UserRound />Joshua Wilson</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/settings"><Settings />Account settings</Link></DropdownMenuItem><DropdownMenuItem><Sparkles />Appearance</DropdownMenuItem><DropdownMenuItem><HelpCircle />Help center</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive"><LogOut />Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>

      <div className="dashboard-scroll"><section className="dashboard-content">
        <div className="dashboard-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> {workspace.name}</p><h1>What should we build, Joshua?</h1><p className="dashboard-subtitle">Turn a clear thought into a useful place to work.</p></div><Button variant="outline" size="sm" className="desktop-shortcut-button" onClick={() => setCommandOpen(true)}><Command />Quick open<span className="shortcut">⌘ K</span></Button></div>
        <section className="prompt-composer"><div className="prompt-composer-top"><Sparkles className="size-4 text-primary" /><span>Build mode</span><span className="prompt-status">Local preview</span></div><Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") submitPrompt(); }} placeholder="Describe what you want to create..." className="prompt-textarea" /><div className="prompt-composer-bottom"><div className="flex items-center gap-1"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="prompt-tool" aria-label="Add context"><Plus /></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-52"><DropdownMenuItem><Paperclip />Attach file</DropdownMenuItem><DropdownMenuItem><Upload />Add screenshot</DropdownMenuItem><DropdownMenuItem><LayoutTemplate />Choose a template</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Button variant="ghost" size="icon" className="prompt-tool hidden sm:inline-flex" aria-label="Use voice input"><Mic /></Button><span className="prompt-hint hidden md:inline">⌘ Enter to build</span></div><Button size="icon" className="prompt-send" onClick={submitPrompt} disabled={!prompt.trim()} aria-label="Create project"><Send /></Button></div></section>

        <section className="projects-section"><div className="projects-section-header"><div className="min-w-0"><div className="flex items-center gap-3"><h2>{filter === "all" ? "Your projects" : projectNav.find((item) => item.id === filter)?.label}</h2><span className="project-total">{visibleProjects.length}</span></div><p>Everything you’re building in {workspace.name}.</p></div><div className="project-header-actions"><Button variant="outline" size="sm" className="filter-button" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal /> <span className="hidden sm:inline">Filter</span>{filter !== "all" && <span className="filter-active-dot" />}</Button><div className="view-toggle"><Button variant="ghost" size="icon" className={cn(view === "grid" && "view-toggle-active")} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 /></Button><Button variant="ghost" size="icon" className={cn(view === "list" && "view-toggle-active")} onClick={() => setView("list")} aria-label="List view"><List /></Button></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="sort-button"><ArrowDownUp /><span className="hidden sm:inline">{sort === "recent" ? "Recently updated" : "Name"}</span><ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setSort("recent")}><Clock3 />Recently updated{sort === "recent" && <Check className="ml-auto" />}</DropdownMenuItem><DropdownMenuItem onClick={() => setSort("name")}><ArrowDownUp />Name{sort === "name" && <Check className="ml-auto" />}</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></div>
          {filtersOpen && <div className="filter-bar"><div className="filter-search"><Search className="size-4" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." autoFocus /><Button variant="ghost" size="icon" className="filter-clear" onClick={() => { setQuery(""); setFiltersOpen(false); }} aria-label="Close filters"><X /></Button></div><div className="filter-pills">{projectNav.map((item) => <Button key={item.id} variant="ghost" size="sm" className={cn("filter-pill", filter === item.id && "filter-pill-active")} onClick={() => setFilter(item.id)}>{item.label}</Button>)}</div></div>}
          {!filtersOpen && <div className="project-search-row"><div className="project-search"><Search className="size-4" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your projects..." /></div><span className="project-search-hint hidden lg:inline">{visibleProjects.length} of {projects.length} projects</span></div>}
          {loading ? <div className={cn("project-loading", view === "list" && "project-loading-list")}>{Array.from({ length: 6 }).map((_, index) => <div className="loading-card" key={index}><div className="skeleton skeleton-thumb" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line-short" /></div>)}</div> : visibleProjects.length === 0 ? <EmptyState query={query} filter={filter} onReset={() => { setQuery(""); setFilter("all"); }} /> : view === "grid" ? <div className="project-grid">{visibleProjects.map((project) => <ProjectCard key={project.id} project={project} onStar={toggleStar} />)}</div> : <div className="project-list">{visibleProjects.map((project) => <ProjectListRow key={project.id} project={project} onStar={toggleStar} />)}</div>}
        </section>
        <div className="dashboard-footer"><CircleAlert className="size-3.5" /> Mock workspace data · No connections enabled <span>•</span><a href="https://docs.lovable.dev/" target="_blank" rel="noreferrer">Documentation <ExternalLink className="size-3" /></a></div>
      </section></div>
    </main>
    <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={addProject} /><CommandDialog open={commandOpen} onOpenChange={setCommandOpen} projects={projects} /><NotificationPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} /><AccountMenu open={accountOpen} onOpenChange={setAccountOpen} />
  </div></TooltipProvider>;
}
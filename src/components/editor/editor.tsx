import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleUserRound, Clock3, Code2, Copy, ExternalLink, Eye, EyeOff, FileCode2, FileText, GitBranch, History, ImagePlus,
  KeyRound, ListChecks, LockKeyhole, Menu, MessageCircle, Mic, Monitor, MoreHorizontal, MousePointer2,
  Paintbrush, PanelLeftClose, PanelLeftOpen, Paperclip, Plus, RefreshCw, RotateCcw,
  Search, Settings, Share2, ShieldCheck, Smartphone, Sparkles, Tablet, Terminal, ThumbsDown, ThumbsUp, Type,
  WandSparkles, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { skills, type Surface } from "@/lib/mock-data";
import { SurfacePanel } from "./surfaces";

type MessageKind = "build" | "plan" | "secret" | "question";
type Message = { id: number; text: string; summary: string; kind: MessageKind };
type Device = "desktop" | "tablet" | "mobile";
type Mode = "Build" | "Chat" | "Plan";
type PreviewTool = "select" | "text" | "draw" | "comment";

const pages = [
  { name: "Homepage", path: "/", title: "Orbit — Money made clear", description: "A calm place for spending, saving, and everything ahead." },
  { name: "Dashboard", path: "/dashboard", title: "Your weekly overview", description: "Balances, budgets, and goals in one view." },
  { name: "Settings", path: "/settings", title: "Account settings", description: "Manage your profile and preferences." },
];
const defaultPage = pages[0] ?? { name: "Homepage", path: "/", title: "Orbit — Money made clear", description: "A calm place for spending, saving, and everything ahead." };

export function Editor({ projectId, initialPrompt }: { projectId: string; initialPrompt?: string }) {
  const projectName = projectId === "new-project" ? "Untitled project" : projectId.split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  const [chatOpen, setChatOpen] = useState(true);
  const [mobileChat, setMobileChat] = useState(false);
  const [surface, setSurface] = useState<Surface>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<Mode>("Build");
  const [draft, setDraft] = useState(initialPrompt ?? "");
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "Create a polished finance dashboard with clear weekly insights.", summary: "Built the core dashboard, responsive navigation, and analytics overview.", kind: "build" }]);
  const [building, setBuilding] = useState(false);
  const [activeTool, setActiveTool] = useState<PreviewTool | null>(null);
  const [previewToolsVisible, setPreviewToolsVisible] = useState(true);
  const [selectedPage, setSelectedPage] = useState(defaultPage);
  const [pageSearch, setPageSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [promptHelperOpen, setPromptHelperOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [planPreview, setPlanPreview] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const slashQuery = useMemo(() => draft.match(/(?:^|\s)\/(\S*)$/)?.[1] ?? null, [draft]);
  const filteredSkills = skills.filter((skill) => slashQuery !== null && `${skill.command} ${skill.title}`.toLowerCase().includes(slashQuery.toLowerCase()));
  const filteredPages = pages.filter((page) => `${page.name} ${page.path}`.toLowerCase().includes(pageSearch.toLowerCase()));

  const submit = () => {
    if (!draft.trim() || building) return;
    const text = draft.trim();
    setDraft("");
    setBuilding(true);
    window.setTimeout(() => {
      const lowered = text.toLowerCase();
      const isGoal = lowered.startsWith("/goal");
      const kind: MessageKind = mode === "Plan" ? "plan" : lowered.includes("api key") || lowered.includes("service key") ? "secret" : lowered.includes("authentication") || lowered.includes("auth option") ? "question" : "build";
      const summary = mode === "Plan"
        ? "Prepared a reviewable plan without changing project files."
        : isGoal
          ? "Goal started. The workspace will keep the task visible until its checkpoints are complete."
          : "Updated the preview and checked the requested changes.";
      setMessages((current) => [...current, { id: Date.now(), text, summary, kind }]);
      if (kind === "plan") setPlanPreview(true);
      setBuilding(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }, 700);
  };

  const toggleSurface = (next: Surface) => {
    if (surface === next && next !== "preview") setSurface("preview");
    else setSurface(next);
  };

  useEffect(() => { if (initialPrompt) setDraft(initialPrompt); }, [initialPrompt]);
  useEffect(() => { inputRef.current?.focus(); }, [surface]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") { event.preventDefault(); setChatOpen((value) => !value); }
      if (event.key === "[" && !event.metaKey && !event.ctrlKey) setMobileChat((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <main className={`editor-shell editor-light ${chatOpen ? "chat-is-open" : "chat-is-closed"}`}>
    <header className="editor-topbar">
      <div className="editor-top-left">
        <Button variant={workspaceMenuOpen ? "editorActive" : "ghost"} size="icon-sm" aria-label="Open workspace menu" onClick={() => setWorkspaceMenuOpen((value) => !value)}><Menu size={15}/></Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="project-name-button"><span className="brand-dot"/><span>{projectName}</span><ChevronDown size={12}/></Button></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start"><DropdownMenu.Label>Main project</DropdownMenu.Label><DropdownMenu.Item className="editor-menu-item"><Check size={13}/> Main version <span className="menu-meta">Live</span></DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><GitBranch size={13}/> Draft · editor-polish</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item className="editor-menu-item"><Plus size={13}/> Create a draft</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><Settings size={13}/> Project settings</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><Copy size={13}/> Copy project link</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
        <Button variant={surface === "history" ? "editorActive" : "ghost"} size="icon-sm" aria-label="Toggle history" title="History" onClick={() => toggleSurface("history")}><History size={15}/></Button>
        <Button variant={!chatOpen ? "editorActive" : "ghost"} size="icon-sm" aria-label={chatOpen ? "Hide chat panel" : "Show chat panel"} title={chatOpen ? "Hide chat panel" : "Show chat panel"} onClick={() => setChatOpen((value) => !value)}>{chatOpen ? <PanelLeftClose size={15}/> : <PanelLeftOpen size={15}/>}</Button>
      </div>

      <nav className="project-toolbar" aria-label="Project tools">
        <SurfaceTab label="Preview" icon={Monitor} active={surface === "preview"} onClick={() => setSurface("preview")}/>
        <SurfaceTab label="Files" icon={FileText} active={surface === "files"} onClick={() => toggleSurface("files")}/>
        <SurfaceTab label="Code" icon={Code2} active={surface === "code"} onClick={() => toggleSurface("code")}/>
        <SurfaceTab label="More" icon={Sparkles} active={["cloud","ai","agents","connectors","analytics","seo","security","payments","settings","logs"].includes(surface)} onClick={() => setSurface(["cloud","ai","agents","connectors","analytics","seo","security","payments","settings","logs"].includes(surface) ? "preview" : "settings")}/>
      </nav>

      <div className="editor-top-right">
        {surface === "preview" && <>
          {!previewToolsVisible && <Button variant="ghost" size="icon-sm" title="Show preview toolbar from top bar" onClick={() => setPreviewToolsVisible(true)}><MousePointer2 size={15}/></Button>}
          <Button variant="ghost" size="icon-sm" title="Comments"><MessageCircle size={15}/></Button>
          <span className="collaborator-avatar" title="Nathan Hanry">N</span>
        </>}
        <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}><Share2 size={13}/> Share</Button>
        <Button variant="publish" size="sm" onClick={() => setPublishOpen(true)}>Publish</Button>
        <Button variant="ghost" size="icon-sm" aria-label="Account"><CircleUserRound size={17}/></Button>
      </div>
    </header>

    {workspaceMenuOpen && <>
      <button className="workspace-drawer-backdrop" aria-label="Close workspace menu" onClick={() => setWorkspaceMenuOpen(false)}/>
      <aside className="workspace-drawer">
        <div className="workspace-drawer-head"><div className="workspace-brand"><span className="brand-dot"/><b>Lovable</b></div><Button variant="ghost" size="icon-sm" aria-label="Close workspace menu" onClick={() => setWorkspaceMenuOpen(false)}><X size={15}/></Button></div>
        <div className="workspace-account"><span className="workspace-avatar">NH</span><div><b>Nathan's workspace</b><small>Personal workspace</small></div><ChevronDown size={13}/></div>
        <nav className="workspace-drawer-nav"><Link to="/dashboard" onClick={() => setWorkspaceMenuOpen(false)}><Monitor size={15}/> Dashboard</Link><button onClick={() => setSurface("history")}><History size={15}/> History <span>⌘H</span></button><button onClick={() => setSurface("settings")}><Settings size={15}/> Project settings</button></nav>
        <div className="workspace-drawer-label">Recent projects</div>
        <div className="workspace-recent"><Link to="/project/$projectId" params={{ projectId: "orbit-finance" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-coral"/><span>Orbit Finance</span><ChevronRight size={13}/></Link><Link to="/project/$projectId" params={{ projectId: "atelier-store" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-blue"/><span>Atelier Store</span><ChevronRight size={13}/></Link><Link to="/project/$projectId" params={{ projectId: "signal-notes" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-mint"/><span>Signal Notes</span><ChevronRight size={13}/></Link></div>
        <div className="workspace-drawer-foot"><BookOpen size={14}/><span>Workspace shortcuts</span><kbd>⌘K</kbd></div>
      </aside>
    </>}

    <section className="editor-workspace">
      <aside className={`chat-panel ${mobileChat ? "mobile-open" : ""}`} aria-hidden={!chatOpen}>
        <div className="chat-feed">
          {messages.map((message) => <MessageTurn key={message.id} message={message} onDetails={() => setDetailsOpen(true)} onPreview={() => { setPreviewVersion("Today, 2:14 PM · Draft: editor-polish"); setSurface("preview"); setPlanPreview(false); }} onOpenPlan={() => { setPlanPreview(true); setSurface("preview"); }} onApprovePlan={() => { setPlanPreview(false); setMode("Build"); }}/>) }
          {building && <div className="thinking-live"><Sparkles size={13}/><span>Working</span><i/><i/><i/></div>}
        </div>
        <div className="chat-composer-wrap">
          {slashQuery !== null && filteredSkills.length > 0 && <div className="skills-menu"><p>Skills</p>{filteredSkills.map((skill) => <button key={skill.command} onClick={() => { setDraft(draft.replace(/\/\S*$/, `${skill.command} `)); inputRef.current?.focus(); }}><span>{skill.command}</span><div><b>{skill.title}</b><small>{skill.detail}</small></div></button>)}</div>}
          <div className="chat-composer">
            <textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Ask Lovable..." rows={3}/>
            <div className="chat-actions">
              <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="outline" size="icon-sm" className="composer-plus" aria-label="Add context"><Plus size={16}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu chat-actions-menu" align="start" side="top"><DropdownMenu.Label>Prompt actions</DropdownMenu.Label><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><Settings size={13}/> Project settings</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><BookOpen size={13}/> Project knowledge</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><GitBranch size={13}/> GitHub sync</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSelectedContext("Screenshot attached") }><ImagePlus size={13}/> Take a screenshot</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSelectedContext("@ Code · @ Files · @ Connectors") }><MousePointer2 size={13}/> Add reference <span>@</span></DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setPromptHelperOpen(true)}><WandSparkles size={13}/> Improve this prompt</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><Paperclip size={13}/> Attach files</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item className="editor-menu-item"><MessageCircle size={13}/> Help center <ExternalLink size={12}/></DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
              <div className="composer-right">
                <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="sm">{mode}<ChevronDown size={11}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu mode-menu" align="end" side="top">{(["Build","Chat","Plan"] as Mode[]).map((item) => <DropdownMenu.Item className="mode-option" key={item} onSelect={() => { setMode(item); if (item === "Plan") { setPlanPreview(true); setSurface("preview"); } }}><span><b>{item}</b><small>{item === "Build" ? "Make changes directly" : item === "Chat" ? "Ask anything, explore ideas" : "Detailed spec for complex builds"}</small></span>{mode === item && <Check size={14}/>}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
                <Button variant="ghost" size="icon-sm" aria-label="Use microphone"><Mic size={15}/></Button>
                <Button variant={draft.trim() ? "send" : "mutedRound"} size="icon-sm" aria-label="Send message" onClick={submit}>{building ? <span className="stop-icon"/> : <ArrowUp size={15}/>}</Button>
              </div>
            </div>
            {selectedContext && <div className="composer-context"><span>{selectedContext}</span><Button variant="ghost" size="icon-sm" aria-label="Remove context" onClick={() => setSelectedContext(null)}><X size={12}/></Button></div>}
          </div>
        </div>
      </aside>

      <section className="workspace-area">
        {surface === "preview" && <PreviewNavigation device={device} setDevice={setDevice} selectedPage={selectedPage} setSelectedPage={setSelectedPage} pageSearch={pageSearch} setPageSearch={setPageSearch} filteredPages={filteredPages} onRefresh={() => setRefreshKey((value) => value + 1)}/>} 
        <div className="surface-viewport">
          {surface === "preview" ? planPreview ? <PlanPreview onApprove={() => { setPlanPreview(false); setMode("Build"); }} onClose={() => setPlanPreview(false)}/> : <PreviewCanvas key={refreshKey} device={device} activeTool={activeTool} setActiveTool={setActiveTool} toolsVisible={previewToolsVisible} setToolsVisible={setPreviewToolsVisible} onAttach={(context) => { setSelectedContext(context); setChatOpen(true); inputRef.current?.focus(); }} previewVersion={previewVersion} onBackToLatest={() => setPreviewVersion(null)} onRestore={() => setPreviewVersion(null)}/> : <SurfacePanel surface={surface} onBack={() => setSurface("preview")} onSelectSurface={setSurface}/>} 
        </div>
      </section>
    </section>

    {mobileChat && <button className="mobile-backdrop" onClick={() => setMobileChat(false)} aria-label="Close chat"/>}
    {!chatOpen && <Button variant="editorActive" size="icon-sm" className="chat-restore" onClick={() => setChatOpen(true)} aria-label="Show chat panel"><ChevronRight size={15}/></Button>}
    <SimpleDialog open={shareOpen} onOpenChange={setShareOpen} title="Share project" description="Invite collaborators or create a view-only preview link." action="Copy preview link"/>
    <SimpleDialog open={publishOpen} onOpenChange={setPublishOpen} title="Publish your project" description="Put the latest version of Orbit Finance on the web." action="Publish"/>
    <PromptHelperDialog open={promptHelperOpen} onOpenChange={setPromptHelperOpen} draft={draft} onUse={(value) => { setDraft(value); setPromptHelperOpen(false); inputRef.current?.focus(); }}/>
    <BuildDetailsDrawer open={detailsOpen} onOpenChange={setDetailsOpen}/>
  </main>;
}

function SurfaceTab({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: typeof Monitor; onClick: () => void }) {
  return <Button variant={active ? "editorActive" : "ghost"} size="sm" onClick={onClick}><Icon size={14}/><span>{label}</span></Button>;
}

function PreviewNavigation({ device, setDevice, selectedPage, setSelectedPage, pageSearch, setPageSearch, filteredPages, onRefresh }: { device: Device; setDevice: (device: Device) => void; selectedPage: typeof pages[number]; setSelectedPage: (page: typeof pages[number]) => void; pageSearch: string; setPageSearch: (value: string) => void; filteredPages: typeof pages; onRefresh: () => void }) {
  const DeviceIcon = device === "desktop" ? Monitor : device === "tablet" ? Tablet : Smartphone;
  const nextDevice: Device = device === "desktop" ? "mobile" : device === "mobile" ? "tablet" : "desktop";
  return <div className="preview-navigation">
    <div className="preview-history-controls"><Button variant="ghost" size="icon-sm" title="Back"><ArrowLeft size={14}/></Button><Button variant="ghost" size="icon-sm" title="Forward"><ArrowRight size={14}/></Button></div>
    <div className="preview-address-controls">
      <Button variant="ghost" size="icon-sm" aria-label={`Switch preview from ${device} to ${nextDevice}`} title={`Switch to ${nextDevice} view`} onClick={() => setDevice(nextDevice)}><DeviceIcon size={15}/></Button>
      <Button variant="ghost" size="icon-sm" title="Refresh preview" onClick={onRefresh}><RefreshCw size={14}/></Button>
      <DropdownMenu.Root onOpenChange={(open) => { if (!open) setPageSearch(""); }}><DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="route-pill"><span>{selectedPage.path}</span><ChevronDown size={12}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu page-menu" align="center"><div className="page-search"><Search size={13}/><input value={pageSearch} onChange={(event) => setPageSearch(event.target.value)} placeholder="Find page or enter path" autoFocus/></div>{filteredPages.map((page) => <DropdownMenu.Item className="page-option" key={page.path} onSelect={() => setSelectedPage(page)}><div><b>{page.name}</b><small>{page.path}</small></div><div className="page-preview-cards"><span><b>Social</b>{page.title}</span><span><b>Search</b>{page.description}</span></div>{selectedPage.path === page.path && <Check size={13}/>}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
      <Button variant="ghost" size="icon-sm" title="Open preview in new tab" onClick={() => window.open("/project/orbit-finance", "_blank", "noopener,noreferrer")}><ExternalLink size={14}/></Button>
    </div>
    <span className="preview-status"><i/> Live</span>
  </div>;
}

function MessageTurn({ message, onDetails, onPreview, onOpenPlan, onApprovePlan }: { message: Message; onDetails: () => void; onPreview: () => void; onOpenPlan: () => void; onApprovePlan: () => void }) {
  const [thinking, setThinking] = useState(false);
  const [liked, setLiked] = useState<"up"|"down"|null>(null);
  return <article className="message-turn"><p className="user-message">{message.text}</p>{message.kind === "plan" ? <PlanCard onOpen={onOpenPlan} onApprove={onApprovePlan}/> : message.kind === "secret" ? <SecretRequestCard/> : message.kind === "question" ? <ChoiceCard/> : <><Button variant="ghost" size="sm" className="thinking-row" onClick={() => setThinking(!thinking)}><Check size={13}/><span>Finished thinking</span><ChevronDown size={12}/></Button>{thinking && <p className="thinking-detail">Reviewed the current layout, mapped the requested behavior, and applied focused changes.</p>}<div className="tool-list"><button onClick={onDetails}><Search size={12}/> Read <code>editor.tsx</code></button><button onClick={onDetails}><Code2 size={12}/> Updated <code>styles.css</code></button></div><p className="turn-summary">{message.summary}</p><div className="turn-primary-actions"><Button variant="outline" size="sm" onClick={onDetails}><ListChecks size={13}/> Details</Button><Button variant="outline" size="sm" onClick={onPreview}><Eye size={13}/> Preview</Button></div></>}<div className="message-actions"><Button variant="ghost" size="icon-sm" title="Revert"><RotateCcw size={13}/></Button><Button variant="ghost" size="icon-sm" title="Copy" onClick={() => navigator.clipboard?.writeText(message.summary)}><Copy size={13}/></Button><Button variant={liked === "up" ? "editorActive" : "ghost"} size="icon-sm" title="Helpful" onClick={() => setLiked(liked === "up" ? null : "up")}><ThumbsUp size={13}/></Button><Button variant={liked === "down" ? "editorActive" : "ghost"} size="icon-sm" title="Not helpful" onClick={() => setLiked(liked === "down" ? null : "down")}><ThumbsDown size={13}/></Button><DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" title="More"><MoreHorizontal size={14}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start">{["View Git diff","View raw prompt","View build logs","Retry turn","Share turn"].map((item) => item.includes("diff") || item.includes("logs") ? <DropdownMenu.Item className="editor-menu-item" key={item} onSelect={onDetails}>{item}</DropdownMenu.Item> : <DropdownMenu.Item className="editor-menu-item" key={item}>{item}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></article>;
}

function PlanCard({ onOpen, onApprove }: { onOpen: () => void; onApprove: () => void }) { const [discarded, setDiscarded] = useState(false); if (discarded) return <p className="turn-summary muted-turn">Plan discarded. No project files were changed.</p>; return <section className="plan-card"><div className="context-card-title"><span><ListChecks size={14}/></span><div><b>Implementation plan</b><small>3 steps · 5 files</small></div><Button variant="ghost" size="icon-sm" onClick={onOpen} aria-label="Open plan preview"><ExternalLink size={13}/></Button></div><ol><li><i>1</i><span><b>Architecture & schema</b><small>Define typed state and data boundaries</small></span></li><li><i>2</i><span><b>UI components</b><small>Build responsive contextual surfaces</small></span></li><li><i>3</i><span><b>State integration</b><small>Wire transitions and verify interactions</small></span></li></ol><div className="context-actions"><Button variant="editorActive" size="sm" onClick={onApprove}><Check size={13}/> Approve and build</Button><Button variant="outline" size="sm" onClick={onOpen}>Edit plan</Button><Button variant="ghost" size="sm" onClick={() => setDiscarded(true)}>Discard</Button></div></section>; }

function SecretRequestCard() { const [visible, setVisible] = useState(false); const [secret, setSecret] = useState(""); const [saved, setSaved] = useState(false); return <section className="secret-card"><div className="context-card-title"><span><LockKeyhole size={14}/></span><div><b>Add SUPABASE_SERVICE_ROLE_KEY to continue</b><small>Required for secure server operations</small></div></div>{saved ? <div className="secret-saved"><Check size={14}/> Saved to project secrets</div> : <><label>Secret key<div><input type={visible ? "text" : "password"} value={secret} onChange={(event) => setSecret(event.target.value)} placeholder="Paste key securely"/><Button variant="ghost" size="icon-sm" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide secret" : "Show secret"}>{visible ? <EyeOff size={13}/> : <Eye size={13}/>}</Button></div></label><Button variant="editorActive" size="sm" disabled={!secret.trim()} onClick={() => setSaved(true)}><KeyRound size={13}/> Save to project secrets</Button></>}<p><ShieldCheck size={12}/> Stored securely in project settings, never exposed in client code.</p></section>; }

function ChoiceCard() { const [choice, setChoice] = useState<string | null>(null); const choices = ["Email + Password", "Magic Link", "Google OAuth"]; return <section className="choice-card"><div className="context-card-title"><span><MessageCircle size={14}/></span><div><b>How should authentication work?</b><small>Select one option to continue</small></div></div><div className="choice-options">{choices.map((item) => <Button key={item} variant={choice === item ? "editorActive" : "outline"} size="sm" onClick={() => setChoice(item)}>{choice === item && <Check size={12}/>} {item}</Button>)}</div>{choice && <p>Selected: <b>{choice}</b></p>}</section>; }

function PreviewCanvas({ device, activeTool, setActiveTool, toolsVisible, setToolsVisible, onAttach, previewVersion, onBackToLatest, onRestore }: { device: Device; activeTool: PreviewTool | null; setActiveTool: (tool: PreviewTool | null) => void; toolsVisible: boolean; setToolsVisible: (value: boolean) => void; onAttach: (context: string) => void; previewVersion: string | null; onBackToLatest: () => void; onRestore: () => void }) {
  const [headline, setHeadline] = useState("Money, made clear.");
  const selectTool = (tool: PreviewTool) => setActiveTool(activeTool === tool ? null : tool);
  return <div className="preview-stage">
    {previewVersion && <div className="version-banner"><Clock3 size={15}/><span><b>Previewing previous version</b><small>{previewVersion}</small></span><Button variant="outline" size="sm" onClick={onBackToLatest}>Back to latest</Button><Button variant="editorActive" size="sm" onClick={onRestore}>Restore this version</Button></div>}
    {toolsVisible ? <div className="visual-tools"><Button variant={activeTool === "select" ? "editorActive" : "ghost"} size="icon-sm" onClick={() => selectTool("select")} title="Select elements"><MousePointer2 size={14}/></Button><Button variant={activeTool === "text" ? "editorActive" : "ghost"} size="icon-sm" onClick={() => selectTool("text")} title="Edit text inline"><Type size={14}/></Button><Button variant={activeTool === "draw" ? "editorActive" : "ghost"} size="icon-sm" onClick={() => selectTool("draw")} title="Draw annotation"><Paintbrush size={14}/></Button><Button variant={activeTool === "comment" ? "editorActive" : "ghost"} size="icon-sm" onClick={() => selectTool("comment")} title="Add comment"><MessageCircle size={14}/></Button><span/><Button variant="ghost" size="icon-sm" onClick={() => setToolsVisible(false)} title="Hide preview toolbar"><ChevronLeft size={14}/></Button></div> : <Button variant="editorActive" size="icon-sm" className="visual-tools-restore" onClick={() => setToolsVisible(true)} title="Show preview toolbar"><ChevronRight size={15}/></Button>}
    <div className={`device-frame ${device}`}><div className={`mock-app ${activeTool === "select" ? "inspecting" : ""}`} onClick={() => activeTool === "select" && onAttach("Selected <section.dashboard> · src/components/FinanceOverview.tsx")}><header><div className="mock-logo"><i/> ORBIT</div><nav><span>Overview</span><span>Activity</span><span>Goals</span></nav><div className="mock-avatar">NH</div></header><main><div className="mock-kicker">WEEKLY OVERVIEW</div>{activeTool === "text" ? <input className="inline-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} autoFocus/> : <h1>{headline}</h1>}<p>One calm place for spending, saving, and everything ahead.</p><div className="mock-cards"><article><small>NET WORTH</small><b>$128,460</b><em>↑ 8.4% this month</em><div className="chart-lines"><i/><i/><i/><i/><i/><i/><i/></div></article><article><small>MONTHLY SPEND</small><b>$4,280</b><em>68% of budget</em><div className="donut"/></article><article><small>SAVINGS GOAL</small><b>$18,750</b><em>Summer house fund</em><div className="goal-bar"><i/></div></article></div><div className="activity-block"><div><small>RECENT ACTIVITY</small><b>Everything in motion</b></div><button>View all</button></div></main>{previewVersion && <div className="snapshot-watermark"><LockKeyhole size={12}/> READ-ONLY SNAPSHOT</div>}{activeTool === "select" && <div className="inspect-box"><span>&lt;section.dashboard&gt;</span><i/><i/><i/><i/><Button variant="editorActive" size="sm" onClick={(event) => { event.stopPropagation(); onAttach("Selected <section.dashboard> · src/components/FinanceOverview.tsx"); }}>Attach to chat</Button></div>}{activeTool === "draw" && <div className="draw-mark">Refine spacing</div>}{activeTool === "comment" && <div className="comment-pin">1</div>}</div></div>
  </div>;
}

function PlanPreview({ onApprove, onClose }: { onApprove: () => void; onClose: () => void }) { const [checked, setChecked] = useState([true, false, false]); const steps = ["Architecture & schema", "UI components", "State integration"]; return <section className="plan-preview"><header><div><span><FileText size={13}/> .lovable/plan.md</span><small>Review and edit before building</small></div><Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close plan preview"><X size={14}/></Button></header><div className="plan-document"><div className="plan-markdown"><span className="plan-kicker">IMPLEMENTATION PLAN</span><h1>Contextual editor states</h1><p>Build the plan review, secure prompts, version preview, execution details, and connector setup as one coherent editor workflow.</p><h2>Implementation steps</h2>{steps.map((step, index) => <button key={step} onClick={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))}><span className={checked[index] ? "checked" : ""}>{checked[index] && <Check size={11}/>}</span><div><b>{index + 1}. {step}</b><small>{index === 0 ? "Typed state, mock repositories, and transition rules" : index === 1 ? "Compact glass cards, drawer, banners, and forms" : "Wire actions and test the complete flow"}</small></div></button>)}</div><aside><h3>Affected files</h3>{["editor.tsx","surfaces.tsx","styles.css","mock-data.ts","roadmap.md"].map((file) => <p key={file}><FileCode2 size={13}/><span>{file}</span><em>Modify</em></p>)}<div className="plan-impact"><b>Expected impact</b><span>5 files</span><span>Frontend only</span><span>No data migration</span></div></aside></div><footer><span><Check size={13}/> Plan is ready for review</span><Button variant="outline" size="sm">Save plan</Button><Button variant="editorActive" size="sm" onClick={onApprove}>Approve plan</Button></footer></section>; }

function BuildDetailsDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) { const [tab, setTab] = useState<"Timeline"|"Changes"|"Output">("Timeline"); return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="details-overlay"/><Dialog.Content className="details-drawer"><header><div><Dialog.Title>Build details</Dialog.Title><Dialog.Description>Completed in 4.8s</Dialog.Description></div><span>2 files changed (+48, −12)</span><Dialog.Close asChild><Button variant="ghost" size="icon-sm"><X size={14}/></Button></Dialog.Close></header><nav>{(["Timeline","Changes","Output"] as const).map((item) => <Button key={item} variant={tab === item ? "editorActive" : "ghost"} size="sm" onClick={() => setTab(item)}>{item === "Timeline" ? <Clock3 size={13}/> : item === "Changes" ? <Code2 size={13}/> : <Terminal size={13}/>} {item}</Button>)}</nav><div className="details-body">{tab === "Timeline" && <div className="execution-timeline">{[["Analyzed request","0.2s"],["Read editor.tsx","0.8s"],["Updated styles.css","2.7s"],["Verified preview","4.8s"]].map(([label,time], index) => <div key={label}><i className={index === 3 ? "complete" : ""}/><span><b>{label}</b><small>{index === 3 ? "Build and interaction checks passed" : "Completed without warnings"}</small></span><time>{time}</time></div>)}</div>}{tab === "Changes" && <div className="diff-view"><header><FileCode2 size={13}/> src/components/editor/editor.tsx</header><code><span className="removed">− const panel = "static";</span><span className="added">+ const [panel, setPanel] = useState("preview");</span><span className="added">+ const showDetails = () =&gt; setPanel("details");</span><span>  return &lt;Editor panel=&#123;panel&#125; /&gt;;</span></code></div>}{tab === "Output" && <pre className="terminal-output"><span>$ bun run check</span>{"\n"}✓ TypeScript checks passed{"\n"}✓ 24 modules transformed{"\n"}✓ build OK{"\n"}{"\n"}<b>Completed in 4.8s</b></pre>}</div><footer><Button variant="outline" size="sm"><Copy size={13}/> Copy details</Button><Dialog.Close asChild><Button variant="editorActive" size="sm">Done</Button></Dialog.Close></footer></Dialog.Content></Dialog.Portal></Dialog.Root>; }

function SimpleDialog({ open, onOpenChange, title, description, action }: { open:boolean; onOpenChange:(value:boolean)=>void; title:string; description:string; action:string }) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content editor-dialog"><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description><Dialog.Close asChild><Button variant="ghost" size="icon-sm" className="dialog-close"><X size={15}/></Button></Dialog.Close><label className="form-label">Preview link<input value="https://orbit-finance.lovable.app" readOnly/></label><div className="dialog-actions"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="publish">{action}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

function PromptHelperDialog({ open, onOpenChange, draft, onUse }: { open: boolean; onOpenChange: (value: boolean) => void; draft: string; onUse: (value: string) => void }) {
  const improved = draft.trim() ? `Objective\n${draft.trim()}\n\nScope\nFocus only on the requested interface and preserve existing behavior.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.` : "Objective\nDescribe the change you want to make.\n\nScope\nName the screen and behavior that should change.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.";
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="editor-dialog prompt-helper-dialog"><Dialog.Title>Shape this request</Dialog.Title><Dialog.Description>Turn a rough note into a clearer brief before sending it.</Dialog.Description><div className="prompt-helper-preview"><div><span>OBJECTIVE</span><b>Clear goal and current state</b></div><div><span>SCOPE</span><b>Focused files and things to preserve</b></div><div><span>VERIFY</span><b>Practical checks before calling it done</b></div></div><textarea value={improved} readOnly/><div className="dialog-actions"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="editorActive" onClick={() => onUse(improved)}>Use brief</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

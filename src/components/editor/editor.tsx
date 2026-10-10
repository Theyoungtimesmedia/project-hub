import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleUserRound, Clock3, Code2, Copy, ExternalLink, Eye, EyeOff, FileCode2, FileText, GitBranch, History, ImagePlus,
  KeyRound, ListChecks, LockKeyhole, Menu, MessageCircle, Mic, Monitor, MoreHorizontal, MousePointer2,
  Paintbrush, PanelLeftClose, PanelLeftOpen, Paperclip, Plus, RefreshCw, RotateCcw,
  Search, Settings, Share2, ShieldCheck, Smartphone, Sparkles, Tablet, Terminal, ThumbsDown, ThumbsUp, Type,
  WandSparkles, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getAvailableSkills, getDefaultSkillCommands, type Surface } from "@/lib/mock-data";
import { SurfacePanel } from "./surfaces";
import { PlanCard, PlanPreview, SecretRequestCard, ChoiceCard, BuildDetailsDrawer, ProjectDialog, initialPlan, type PlanState } from "./contextual";

type MessageKind = "build" | "plan" | "secret" | "question";
type Message = { id: number; text: string; summary: string; kind: MessageKind; headline: string };
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
  const [chatWidth, setChatWidth] = useState(380);
  const [resizing, setResizing] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [surface, setSurface] = useState<Surface>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<Mode>("Build");
  const [draft, setDraft] = useState(initialPrompt ?? "");
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: "Create a polished finance dashboard with clear weekly insights.", summary: "Built the core dashboard, responsive navigation, and analytics overview.", kind: "build", headline: "Money, made clear." }]);
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
  const [detailsTurn, setDetailsTurn] = useState<Message | null>(null);
  const [plan, setPlan] = useState<PlanState>(initialPlan);
  const [headline, setHeadline] = useState("Money, made clear.");
  const [versionId, setVersionId] = useState<number | null>(null);
  const [skillIndex, setSkillIndex] = useState(0);
  const [enabledSkills, setEnabledSkills] = useState(getDefaultSkillCommands);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const slashQuery = useMemo(() => draft.match(/(?:^|\s)\/(\S*)$/)?.[1] ?? null, [draft]);
  const filteredSkills = slashQuery === null ? [] : getAvailableSkills(enabledSkills, slashQuery);
  const filteredPages = pages.filter((page) => `${page.name} ${page.path}`.toLowerCase().includes(pageSearch.toLowerCase()));

  const previewTurn = (message: Message) => { setVersionId(message.id); setPreviewVersion(`Turn ${message.id} · ${message.text}`); setSurface("preview"); setPlanPreview(false); setActiveTool(null); };
  const restoreVersion = () => { const version = messages.find(message => message.id === versionId); if (version) { setHeadline(version.headline); setMessages(current => [...current, { ...version, id: Date.now(), text: `Restore turn ${version.id}`, summary: "Restored this local preview snapshot. Conversation history is preserved." }]); } setVersionId(null); setPreviewVersion(null); };
  const approvePlan = () => { if (plan.status !== "review") return; setPlan({ ...plan, status: "approved" }); setPlanPreview(false); setMode("Build"); setMessages(current => [...current, { id: Date.now(), text: `Build approved plan: ${plan.title}`, summary: "Completed the approved plan in this frontend simulation.", kind: "build", headline }]); inputRef.current?.focus(); };
  const discardPlan = () => { setPlan({ ...plan, status: "discarded" }); setPlanPreview(false); };
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
      setMessages((current) => [...current, { id: Date.now(), text, summary, kind, headline: kind === "build" ? text.match(/headline[: ]+(.+)/i)?.[1] ?? headline : headline }]);
      if (kind === "build") setHeadline(text.match(/headline[: ]+(.+)/i)?.[1] ?? headline);
      if (kind === "plan") { setPlan({ ...initialPlan, title: text, text: `Objective: ${text}\n\nPreserve the editor and implement focused frontend changes with local state.` }); setPlanPreview(true); setSurface("preview"); }
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

  return <main className={`editor-shell editor-light ${chatOpen ? "chat-is-open" : "chat-is-closed"} ${resizing ? "is-resizing" : ""}`} style={{ "--chat-width": `${chatWidth}px` } as React.CSSProperties}>
    <header className="editor-topbar">
      <div className="editor-top-left">
        <Button variant={workspaceMenuOpen ? "editorActive" : "ghost"} size="icon-sm" aria-label="Open workspace menu" onClick={() => setWorkspaceMenuOpen((value) => !value)}><Menu size={15}/></Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="project-name-button"><span className="brand-dot"/><span>{projectName}</span><ChevronDown size={12}/></Button></DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start"><DropdownMenu.Label>Main project</DropdownMenu.Label><DropdownMenu.Item className="editor-menu-item"><Check size={13}/> Main version <span className="menu-meta">Live</span></DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => { const first = messages[0]; if (first) previewTurn(first); }}><GitBranch size={13}/> Draft · editor-polish</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item className="editor-menu-item"><Plus size={13}/> Create a draft</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><Settings size={13}/> Project settings</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item"><Copy size={13}/> Copy project link</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
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
        <Button className="share-trigger rounded-full" variant="outline" size="sm" onClick={() => setShareOpen(true)}><Share2 size={13}/> Share</Button>
        <Button className="publish-trigger rounded-full" variant="send" size="sm" onClick={() => setPublishOpen(true)}>Publish</Button>
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
          {messages.map((message) => <MessageTurn key={message.id} message={message} plan={plan} onDiscardPlan={discardPlan} onAnswer={answer => setMessages(current => [...current, { id: Date.now(), text: answer, summary: `Selected ${answer} for the prototype. No authentication service was enabled.`, kind: "build", headline }])} previewing={versionId === message.id} detailsOpen={detailsTurn?.id === message.id} onDetails={() => setDetailsTurn(current => current?.id === message.id ? null : message)} onPreview={() => previewTurn(message)} onOpenPlan={() => { setPlanPreview(true); setSurface("preview"); }} onApprovePlan={approvePlan}/>) }
          {building && <div className="thinking-live"><Sparkles size={13}/><span>Working</span><i/><i/><i/></div>}
        </div>
        <div className="chat-composer-wrap">
          {slashQuery !== null && filteredSkills.length > 0 && <div className="skills-menu"><p>Skills</p>{filteredSkills.map((skill, index) => <button className={index === skillIndex ? "skill-highlight" : ""} key={skill.command} onClick={() => { setDraft(draft.replace(/\/\S*$/, `${skill.command} `)); inputRef.current?.focus(); }}><span>{skill.command}</span><div><b>{skill.title}</b><small>{skill.detail}</small></div></button>)}</div>}
          <div className="chat-composer">
            <textarea ref={inputRef} value={draft} onChange={(event) => { setDraft(event.target.value); setSkillIndex(0); }} onKeyDown={(event) => { if (slashQuery !== null && filteredSkills.length) { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setSkillIndex(current => (current + (event.key === "ArrowDown" ? 1 : -1) + filteredSkills.length) % filteredSkills.length); return; } if (event.key === "Enter") { event.preventDefault(); const skill = filteredSkills[skillIndex]; if (skill) setDraft(draft.replace(/\/\S*$/, `${skill.command} `)); return; } if (event.key === "Escape") { setDraft(draft.replace(/\/\S*$/, "")); return; } } if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Ask Lovable..." rows={3}/>
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

      {chatOpen && <Button variant="ghost" size="icon-sm" role="separator" aria-orientation="vertical" aria-label="Resize chat and preview panels" aria-valuemin={280} aria-valuemax={720} aria-valuenow={Math.round(chatWidth)} tabIndex={0} className="panel-splitter" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setResizing(true); }} onPointerMove={(event) => { if (!resizing) return; const bounds = event.currentTarget.parentElement?.getBoundingClientRect(); if (!bounds) return; const max = Math.min(bounds.width - 320, bounds.width * .58); setChatWidth(Math.max(280, Math.min(max, event.clientX - bounds.left))); }} onPointerUp={() => setResizing(false)} onPointerCancel={() => setResizing(false)} onKeyDown={(event) => { if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return; event.preventDefault(); const bounds = event.currentTarget.parentElement?.getBoundingClientRect(); const max = bounds ? Math.min(bounds.width - 320, bounds.width * .58) : 720; setChatWidth(event.key === "Home" ? 280 : event.key === "End" ? max : Math.max(280, Math.min(max, chatWidth + (event.key === "ArrowRight" ? 20 : -20)))); }}><span/></Button>}
      <section className="workspace-area">
        {detailsTurn ? <BuildDetailsDrawer turn={detailsTurn} onClose={() => setDetailsTurn(null)} onPreview={() => { previewTurn(detailsTurn); setDetailsTurn(null); }}/> : <>
        {surface === "preview" && <PreviewNavigation device={device} setDevice={setDevice} selectedPage={selectedPage} setSelectedPage={setSelectedPage} pageSearch={pageSearch} setPageSearch={setPageSearch} filteredPages={filteredPages} onRefresh={() => setRefreshKey((value) => value + 1)}/>} 
        <div className="surface-viewport">
          {surface === "preview" ? planPreview ? <PlanPreview plan={plan} onChange={setPlan} onApprove={approvePlan} onDiscard={discardPlan} onClose={() => setPlanPreview(false)}/> : <PreviewCanvas headline={messages.find(message => message.id === versionId)?.headline ?? headline} setHeadline={setHeadline} key={refreshKey} device={device} activeTool={activeTool} setActiveTool={setActiveTool} toolsVisible={previewToolsVisible} setToolsVisible={setPreviewToolsVisible} onAttach={(context) => { setSelectedContext(context); setChatOpen(true); inputRef.current?.focus(); }} previewVersion={previewVersion} onBackToLatest={() => { setVersionId(null); setPreviewVersion(null); }} onRestore={restoreVersion}/> : <SurfacePanel enabledSkills={enabledSkills} setEnabledSkills={setEnabledSkills} versions={messages} onPreviewVersion={id => { const version = messages.find(message => message.id === id); if (version) previewTurn(version); }} surface={surface} onBack={() => setSurface("preview")} onSelectSurface={setSurface}/>} 
        </div>
        </>}
      </section>
    </section>

    {mobileChat && <button className="mobile-backdrop" onClick={() => setMobileChat(false)} aria-label="Close chat"/>}
    {!chatOpen && <Button variant="editorActive" size="icon-sm" className="chat-restore" onClick={() => setChatOpen(true)} aria-label="Show chat panel"><ChevronRight size={15}/></Button>}
    <ProjectDialog kind="share" open={shareOpen} onClose={() => setShareOpen(false)} projectName={projectName}/>
    <ProjectDialog kind="publish" open={publishOpen} onClose={() => setPublishOpen(false)} projectName={projectName}/>
    <PromptHelperDialog open={promptHelperOpen} onOpenChange={setPromptHelperOpen} draft={draft} onUse={(value) => { setDraft(value); setPromptHelperOpen(false); inputRef.current?.focus(); }}/>
  </main>;
}

function SurfaceTab({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: typeof Monitor; onClick: () => void }) {
  return <Button variant={active ? "editorActive" : "ghost"} size="sm" className={`surface-tab ${active ? "is-active" : ""}`} aria-label={label} title={label} onClick={onClick}><Icon size={14}/><span>{label}</span></Button>;
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

function MessageTurn({ message, plan, onDiscardPlan, onAnswer, previewing, detailsOpen, onDetails, onPreview, onOpenPlan, onApprovePlan }: { message: Message; plan: PlanState; onDiscardPlan: () => void; onAnswer: (answer: string) => void; previewing: boolean; detailsOpen: boolean; onDetails: () => void; onPreview: () => void; onOpenPlan: () => void; onApprovePlan: () => void }) {
  const [thinking, setThinking] = useState(false);
  const [liked, setLiked] = useState<"up"|"down"|null>(null);
  return <article className="message-turn"><p className="user-message">{message.text}</p>{message.kind === "plan" ? <PlanCard plan={plan} onOpen={onOpenPlan} onApprove={onApprovePlan} onDiscard={onDiscardPlan}/> : message.kind === "secret" ? <SecretRequestCard/> : message.kind === "question" ? <ChoiceCard onAnswer={onAnswer}/> : <><Button variant="ghost" size="sm" className="thinking-row" onClick={() => setThinking(!thinking)}><Check size={13}/><span>Finished thinking</span><ChevronDown size={12}/></Button>{thinking && <p className="thinking-detail">Reviewed the current layout, mapped the requested behavior, and applied focused changes.</p>}<div className="tool-list"><button onClick={onDetails}><Search size={12}/> Read <code>editor.tsx</code></button><button onClick={onDetails}><Code2 size={12}/> Updated <code>styles.css</code></button></div><section className={`turn-result ${detailsOpen ? "is-selected" : ""}`}><p className="turn-summary">{message.summary}</p><div className="turn-primary-actions"><Button variant={detailsOpen ? "editorActive" : "outline"} size="sm" onClick={onDetails}><ListChecks size={13}/> {detailsOpen ? "Hide details" : "Details"}</Button><Button variant={previewing ? "editorActive" : "outline"} size="sm" onClick={onPreview}><Eye size={13}/> {previewing ? "Previewing" : "Preview"}</Button></div></section></>}<div className="message-actions"><Button variant="ghost" size="icon-sm" title="Preview version to restore" onClick={onPreview}><RotateCcw size={13}/></Button><Button variant="ghost" size="icon-sm" title="Copy" onClick={() => navigator.clipboard?.writeText(message.summary)}><Copy size={13}/></Button><Button variant={liked === "up" ? "editorActive" : "ghost"} size="icon-sm" title="Helpful" onClick={() => setLiked(liked === "up" ? null : "up")}><ThumbsUp size={13}/></Button><Button variant={liked === "down" ? "editorActive" : "ghost"} size="icon-sm" title="Not helpful" onClick={() => setLiked(liked === "down" ? null : "down")}><ThumbsDown size={13}/></Button><DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" title="More"><MoreHorizontal size={14}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start">{["View Git diff","View raw prompt","View build logs","Retry turn","Share turn"].map((item) => item.includes("diff") || item.includes("logs") ? <DropdownMenu.Item className="editor-menu-item" key={item} onSelect={onDetails}>{item}</DropdownMenu.Item> : <DropdownMenu.Item className="editor-menu-item" key={item} onSelect={() => { if (item === "Share turn") navigator.clipboard?.writeText(`${window.location.href}#turn-${message.id}`); else onDetails(); }}>{item === "View raw prompt" ? "View request" : item === "Retry turn" ? "Preview turn" : item}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div></article>;
}

function PreviewCanvas({ headline, setHeadline, device, activeTool, setActiveTool, toolsVisible, setToolsVisible, onAttach, previewVersion, onBackToLatest, onRestore }: { headline: string; setHeadline: (value: string) => void; device: Device; activeTool: PreviewTool | null; setActiveTool: (tool: PreviewTool | null) => void; toolsVisible: boolean; setToolsVisible: (value: boolean) => void; onAttach: (context: string) => void; previewVersion: string | null; onBackToLatest: () => void; onRestore: () => void }) {
  const selectTool = (tool: PreviewTool) => setActiveTool(activeTool === tool ? null : tool);
  return <div className="preview-stage">
    {previewVersion && <div className="version-banner"><Clock3 size={15}/><span><b>Previewing previous version</b><small>{previewVersion}</small></span><Button variant="outline" size="sm" onClick={onBackToLatest}>Back to latest</Button><Button variant="editorActive" size="sm" onClick={onRestore}>Restore this version</Button></div>}
    {toolsVisible ? <div className="visual-tools"><Button variant={activeTool === "select" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion} onClick={() => selectTool("select")} title="Select elements"><MousePointer2 size={14}/></Button><Button variant={activeTool === "text" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion} onClick={() => selectTool("text")} title="Edit text inline"><Type size={14}/></Button><Button variant={activeTool === "draw" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion} onClick={() => selectTool("draw")} title="Draw annotation"><Paintbrush size={14}/></Button><Button variant={activeTool === "comment" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion} onClick={() => selectTool("comment")} title="Add comment"><MessageCircle size={14}/></Button><span/><Button variant="ghost" size="icon-sm" onClick={() => setToolsVisible(false)} title="Hide preview toolbar"><ChevronLeft size={14}/></Button></div> : <Button variant="editorActive" size="icon-sm" className="visual-tools-restore" onClick={() => setToolsVisible(true)} title="Show preview toolbar"><ChevronRight size={15}/></Button>}
    <div className={`device-frame ${device}`}><div className={`mock-app ${activeTool === "select" ? "inspecting" : ""}`} onClick={() => !previewVersion && activeTool === "select" && onAttach("Selected <section.dashboard> · src/components/FinanceOverview.tsx")}><header><div className="mock-logo"><i/> ORBIT</div><nav><span>Overview</span><span>Activity</span><span>Goals</span></nav><div className="mock-avatar">NH</div></header><main><div className="mock-kicker">WEEKLY OVERVIEW</div>{!previewVersion && activeTool === "text" ? <input className="inline-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} autoFocus/> : <h1>{headline}</h1>}<p>One calm place for spending, saving, and everything ahead.</p><div className="mock-cards"><article><small>NET WORTH</small><b>$128,460</b><em>↑ 8.4% this month</em><div className="chart-lines"><i/><i/><i/><i/><i/><i/><i/></div></article><article><small>MONTHLY SPEND</small><b>$4,280</b><em>68% of budget</em><div className="donut"/></article><article><small>SAVINGS GOAL</small><b>$18,750</b><em>Summer house fund</em><div className="goal-bar"><i/></div></article></div><div className="activity-block"><div><small>RECENT ACTIVITY</small><b>Everything in motion</b></div><button>View all</button></div></main>{previewVersion && <div className="snapshot-watermark"><LockKeyhole size={12}/> READ-ONLY SNAPSHOT</div>}{activeTool === "select" && <div className="inspect-box"><span>&lt;section.dashboard&gt;</span><i/><i/><i/><i/><Button variant="editorActive" size="sm" onClick={(event) => { event.stopPropagation(); onAttach("Selected <section.dashboard> · src/components/FinanceOverview.tsx"); }}>Attach to chat</Button></div>}{activeTool === "draw" && <div className="draw-mark">Refine spacing</div>}{activeTool === "comment" && <div className="comment-pin">1</div>}</div></div>
  </div>;
}

function PromptHelperDialog({ open, onOpenChange, draft, onUse }: { open: boolean; onOpenChange: (value: boolean) => void; draft: string; onUse: (value: string) => void }) {
  const improved = draft.trim() ? `Objective\n${draft.trim()}\n\nScope\nFocus only on the requested interface and preserve existing behavior.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.` : "Objective\nDescribe the change you want to make.\n\nScope\nName the screen and behavior that should change.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.";
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="editor-dialog prompt-helper-dialog"><Dialog.Title>Shape this request</Dialog.Title><Dialog.Description>Turn a rough note into a clearer brief before sending it.</Dialog.Description><div className="prompt-helper-preview"><div><span>OBJECTIVE</span><b>Clear goal and current state</b></div><div><span>SCOPE</span><b>Focused files and things to preserve</b></div><div><span>VERIFY</span><b>Practical checks before calling it done</b></div></div><textarea value={improved} readOnly/><div className="dialog-actions"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="editorActive" onClick={() => onUse(improved)}>Use brief</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

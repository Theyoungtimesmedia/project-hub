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
import { useBackend } from "@/lib/backend";
import type { Surface } from "@/lib/mock-data";
import { SurfacePanel } from "./surfaces";
import { PlanCard, PlanPreview, BuildDetailsDrawer, ProjectDialog, type PlanState } from "./contextual";

type MessageKind = "build" | "plan" | "secret" | "question";
type Message = { id: number; dbId?: string; text: string; summary: string; kind: MessageKind; headline: string; previewHtml?: string | null; planPayload?: { title?: string; text?: string; steps?: Array<{ title?: string; detail?: string; completed?: boolean; path?: string; action?: string }>; files?: Array<{ path: string; action: string }>; status?: string } | null; status?: string };
type Device = "desktop" | "tablet" | "mobile";
type Mode = "Build" | "Chat" | "Plan";
type PreviewTool = "select" | "text" | "draw" | "comment";

const pages = [
  { name: "Preview", path: "/", title: "Project preview", description: "The latest generated project output." },
];
const defaultPage = pages[0]!;

export function Editor({ projectId, initialPrompt }: { projectId: string; initialPrompt?: string }) {
  const { session, request, invoke, upload, download } = useBackend();
  const [projectName, setProjectName] = useState("Loading project…");
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ file_path: string; file_name: string; size_bytes: number }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(380);
  const [resizing, setResizing] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const [surface, setSurface] = useState<Surface>("preview");
  const [device, setDevice] = useState<Device>("desktop");
  const [mode, setMode] = useState<Mode>("Build");
  const [draft, setDraft] = useState(initialPrompt ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [activeTool, setActiveTool] = useState<PreviewTool | null>(null);
  const [previewToolsVisible, setPreviewToolsVisible] = useState(true);
  const [selectedPage, setSelectedPage] = useState(defaultPage);
  const [pageSearch, setPageSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [promptHelperOpen, setPromptHelperOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [planPreview, setPlanPreview] = useState(false);
  const [detailsTurn, setDetailsTurn] = useState<Message | null>(null);
  const [plan, setPlan] = useState<PlanState>({ title: "", text: "", steps: [], status: "discarded" });
  const headline = projectName;
  const [versionId, setVersionId] = useState<number | null>(null);
  const [skillIndex, setSkillIndex] = useState(0);
  const [enabledSkills, setEnabledSkills] = useState<string[]>([]);
  const [skillCommands, setSkillCommands] = useState<Array<{ command: string; title: string; detail: string; instructions?: string }>>([]);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const slashQuery = useMemo(() => draft.match(/(?:^|\s)\/(\S*)$/)?.[1] ?? null, [draft]);
  const filteredSkills = slashQuery === null ? [] : skillCommands.filter(skill => enabledSkills.includes(skill.command) && (skill.command + " " + skill.title).toLowerCase().includes(slashQuery.toLowerCase()));
  const filteredPages = pages.filter((page) => `${page.name} ${page.path}`.toLowerCase().includes(pageSearch.toLowerCase()));

  const previewTurn = (message: Message) => { setVersionId(message.id); setPreviewVersion(`Turn ${message.id} · ${message.text}`); setSurface("preview"); setPlanPreview(false); setActiveTool(null); };
  const restoreVersion = async () => {
    const version = messages.find(message => message.id === versionId);
    if (!version?.dbId) { setProjectError("This item has no saved checkpoint to restore."); return; }
    setBuilding(true);
    setProjectError(null);
    try {
      const result = await invoke<{ success: boolean; turnId: string | null; preview_html: string | null; summary: string }>("figurable-restore", { projectId, turnId: version.dbId });
      setPreviewHtml(result.preview_html);
      setMessages(current => [...current, { id: Date.now(), dbId: result.turnId ?? undefined, text: "Restore checkpoint: " + version.text, summary: result.summary, kind: "build", headline, previewHtml: result.preview_html, status: "completed" }]);
      setVersionId(null);
      setPreviewVersion(null);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "Could not restore checkpoint.");
    } finally { setBuilding(false); }
  };

  const runAgent = async (text: string, requestedMode: Mode) => {
    if (!text.trim() || building) return;
    const tempId = Date.now();
    const optimistic: Message = { id: tempId, text, summary: requestedMode === "Build" ? "Sending build request…" : requestedMode === "Plan" ? "Preparing plan…" : "Waiting for response…", kind: requestedMode === "Plan" ? "plan" : requestedMode === "Chat" ? "question" : "build", headline, status: "running" };
    setMessages(current => [...current, optimistic]);
    setBuilding(true);
    setProjectError(null);
    try {
      const result = await invoke<{ turnId: string; mode: Mode; status: string; summary: string; result?: { preview_html?: string | null }; plan?: Message["planPayload"] }>("figurable-agent", {
        projectId, mode: requestedMode, prompt: text, selectedContext,
      });
      const rows = await request<Array<{ id: string; mode: Mode; prompt: string; summary: string | null; status: string; created_at: string; result_payload: { preview_html?: string | null } | null; plan_payload: Message["planPayload"] }>(
        "chat_turns?select=id,mode,prompt,summary,status,created_at,result_payload,plan_payload&id=eq." + result.turnId
      );
      const row = rows[0];
      const mapped: Message = row ? {
        id: (Date.parse(row.created_at) || tempId) + messages.length, dbId: row.id, text: row.prompt, summary: row.summary ?? result.summary,
        kind: row.mode === "Plan" ? "plan" : row.mode === "Chat" ? "question" : "build", headline, previewHtml: row.result_payload?.preview_html ?? null,
        planPayload: row.plan_payload, status: row.status,
      } : { ...optimistic, summary: result.summary, status: "completed", previewHtml: result.result?.preview_html ?? null, planPayload: result.plan };
      setMessages(current => current.map(message => message.id === tempId ? mapped : message));
      if (mapped.previewHtml) setPreviewHtml(mapped.previewHtml);
      if (requestedMode === "Plan" && mapped.planPayload) {
        setPlan({ title: mapped.planPayload.title ?? text.slice(0, 120), text: mapped.planPayload.text ?? "", steps: (mapped.planPayload.steps ?? []).map(step => Boolean(step.completed)), stepDetails: (mapped.planPayload.steps ?? []).map(step => ({ title: step.title ?? "Implementation step", detail: step.detail ?? "" })), files: mapped.planPayload.files ?? [], status: (mapped.planPayload.status === "approved" || mapped.planPayload.status === "discarded" ? mapped.planPayload.status : "review") });
        setPlanPreview(true);
        setSurface("preview");
      }
      if (requestedMode === "Build") { setPlanPreview(false); setSurface("preview"); setSelectedContext(null); }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent execution failed.";
      setMessages(current => current.map(item => item.id === tempId ? { ...item, summary: message, status: "failed" } : item));
      setProjectError(message);
    } finally {
      setBuilding(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const updatePlan = (value: PlanState) => {
    setPlan(value);
    const latestPlan = [...messages].reverse().find(message => message.kind === "plan" && message.dbId);
    if (!latestPlan?.dbId) return;
    const payload = {
      title: value.title, text: value.text,
      steps: (value.stepDetails ?? []).map((step, index) => ({ ...step, completed: Boolean(value.steps[index]) })),
      files: value.files ?? [], status: value.status,
    };
    void request("chat_turns?id=eq." + latestPlan.dbId, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ plan_payload: payload }) })
      .catch(error => setProjectError(error instanceof Error ? error.message : "Could not save plan changes."));
  };
  const approvePlan = () => {
    if (plan.status !== "review") return;
    const approvedText = "Implement this approved plan. Follow it in order, preserve existing behaviour, and verify the resulting files.\n\n" + plan.text;
    updatePlan({ ...plan, status: "approved" });
    setPlanPreview(false);
    setMode("Build");
    void runAgent(approvedText, "Build");
  };
  const discardPlan = () => {
    updatePlan({ ...plan, status: "discarded" });
    setPlanPreview(false);
  };
  const attachFiles = async (selected: FileList | null) => {
    if (!selected?.length || uploadingFiles) return;
    setUploadingFiles(true);
    setProjectError(null);
    const uploaded: Array<{ file_path: string; file_name: string; size_bytes: number }> = [];
    try {
      for (const file of Array.from(selected)) {
        if (file.size > 50 * 1024 * 1024) throw new Error(file.name + " exceeds the 50 MB file limit.");
        const safeName = file.name.replace(/[\\/\0]+/g, "-").replace(/\.\.+/g, "-").slice(0, 180) || "attachment";
        const path = projectId + "/uploads/" + Date.now() + "-" + safeName;
        await upload(path, file);
        const textLike = file.size <= 100000 && (file.type.startsWith("text/") || /json|javascript|xml|svg/.test(file.type) || /\.(md|txt|ts|tsx|js|jsx|css|html|sql|yaml|yml|toml|env)$/i.test(file.name));
        const textContent = textLike ? await file.text() : null;
        const filePath = "uploads/" + path.split("/").at(-1);
        await request("project_files?on_conflict=project_id,file_path", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({
            project_id: projectId, file_path: filePath, file_name: file.name,
            mime_type: file.type || "application/octet-stream", size_bytes: file.size,
            storage_path: path, text_content: textContent, source: "upload",
            uploaded_by: session?.user.id, updated_at: new Date().toISOString(),
          }),
        });
        uploaded.push({ file_path: filePath, file_name: file.name, size_bytes: file.size });
      }
      setAttachedFiles(current => [...current, ...uploaded]);
      setSelectedContext(current => [current, ...uploaded.map(file => "Attached project file: " + file.file_path)].filter(Boolean).join("\n"));
    } catch (cause) {
      setProjectError(cause instanceof Error ? cause.message : "Could not attach files.");
    } finally {
      setUploadingFiles(false);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    }
  };

  const submit = () => {
    if (!draft.trim() || building) return;
    const text = draft.trim();
    const attachmentContext = attachedFiles.length ? "\n\nUse these attached project files where relevant: " + attachedFiles.map(file => file.file_path).join(", ") : "";
    setDraft("");
    setAttachedFiles([]);
    void runAgent(text + attachmentContext, mode);
  };

  const updateEnabledSkills = (items: string[]) => {
    setEnabledSkills(items);
    if (!workspaceId) return;
    void Promise.all(skillCommands.map(skill => request(
      "skills?workspace_id=eq." + workspaceId + "&command=eq." + encodeURIComponent(skill.command),
      { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ is_enabled: items.includes(skill.command), updated_at: new Date().toISOString() }) }
    ))).catch(error => setProjectError(error instanceof Error ? error.message : "Could not save skill settings."));
  };

  const toggleSurface = (next: Surface) => {
    if (surface === next && next !== "preview") setSurface("preview");
    else setSurface(next);
  };

  useEffect(() => { if (initialPrompt) setDraft(initialPrompt); }, [initialPrompt]);

  useEffect(() => {
    let cancelled = false;
    async function loadProject() {
      try {
        const projects = await request<Array<{ id: string; name: string; workspace_id: string }>>("projects?select=id,name,workspace_id&id=eq." + projectId);
        if (!projects[0]) throw new Error("Project not found or access was removed. Return to the workspace and open a project you own or can access.");
        if (!cancelled) { setProjectName(projects[0].name); setWorkspaceId(projects[0].workspace_id); }
        const skillRows = await request<Array<{ command: string; name: string; description: string; instructions: string; is_enabled: boolean }>>(
          "skills?select=command,name,description,instructions,is_enabled&workspace_id=eq." + projects[0].workspace_id + "&order=name.asc"
        );
        if (!cancelled) {
          setSkillCommands(skillRows.map(skill => ({ command: skill.command, title: skill.name, detail: skill.description, instructions: skill.instructions })));
          setEnabledSkills(skillRows.filter(skill => skill.is_enabled).map(skill => skill.command));
        }
        const turns = await request<Array<{ id: string; mode: Mode; prompt: string; summary: string | null; status: string; created_at: string; result_payload: { preview_html?: string | null } | null; plan_payload: Message["planPayload"] }>>(
          "chat_turns?select=id,mode,prompt,summary,status,created_at,result_payload,plan_payload&project_id=eq." + projectId + "&order=created_at.asc"
        );
        if (cancelled) return;
        const mapped = turns.map((row, index): Message => ({
          id: (Date.parse(row.created_at) || index + 1) + index, dbId: row.id, text: row.prompt,
          summary: row.summary ?? (row.status === "failed" ? "This execution failed." : "Execution is still running."),
          kind: row.mode === "Plan" ? "plan" : "build", headline, previewHtml: row.result_payload?.preview_html ?? null,
          planPayload: row.plan_payload, status: row.status,
        }));
        setMessages(mapped);
        const latestBuild = [...turns].reverse().find(row => row.mode === "Build" && row.status === "completed" && row.result_payload?.preview_html);
        if (latestBuild?.result_payload?.preview_html) setPreviewHtml(latestBuild.result_payload.preview_html);
        // Inline visual edits are saved as project_files/index.html; prefer that current file over an older build result.
        const previewFiles = await request<Array<{ text_content: string | null; storage_path: string | null }>>(
          "project_files?select=text_content,storage_path&project_id=eq." + projectId + "&file_path=eq.index.html"
        );
        if (!cancelled && previewFiles[0]?.text_content) setPreviewHtml(previewFiles[0].text_content);
        else if (!cancelled && previewFiles[0]?.storage_path) {
          try {
            const blob = await download(previewFiles[0].storage_path);
            if (blob.size <= 700000) setPreviewHtml(await blob.text());
          } catch (cause) {
            if (!cancelled) setProjectError(cause instanceof Error ? cause.message : "Could not restore the saved preview file.");
          }
        }
        const latestPlan = [...turns].reverse().find(row => row.mode === "Plan" && row.plan_payload?.status === "review");
        if (latestPlan?.plan_payload) {
          setPlan({ title: latestPlan.plan_payload.title ?? latestPlan.prompt, text: latestPlan.plan_payload.text ?? "", steps: (latestPlan.plan_payload.steps ?? []).map(step => Boolean(step.completed)), stepDetails: (latestPlan.plan_payload.steps ?? []).map(step => ({ title: step.title ?? "Implementation step", detail: step.detail ?? "" })), files: latestPlan.plan_payload.files ?? [], status: "review" });
        }
      } catch (error) {
        if (!cancelled) setProjectError(error instanceof Error ? error.message : "Could not load project.");
      }
    }
    void loadProject();
    return () => { cancelled = true; };
  }, [projectId, request, download, session?.user.id]);
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
          <DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start"><DropdownMenu.Label>{projectName}</DropdownMenu.Label><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><Settings size={13}/> Project settings</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => { void navigator.clipboard.writeText(window.location.href).catch(() => setProjectError("Clipboard access is unavailable in this browser.")); }}><Copy size={13}/> Copy editor link</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal>
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
          <span className="collaborator-avatar" title="Joshua Omoniyi">J</span>
        </>}
        <Button className="share-trigger rounded-full" variant="outline" size="sm" onClick={() => setShareOpen(true)}><Share2 size={13}/> Share</Button>
        
        <Button variant="ghost" size="icon-sm" aria-label="Account"><CircleUserRound size={17}/></Button>
      </div>
    </header>

    {workspaceMenuOpen && <>
      <button className="workspace-drawer-backdrop" aria-label="Close workspace menu" onClick={() => setWorkspaceMenuOpen(false)}/>
      <aside className="workspace-drawer">
        <div className="workspace-drawer-head"><div className="workspace-brand"><span className="brand-dot"/><b>Figurable</b></div><Button variant="ghost" size="icon-sm" aria-label="Close workspace menu" onClick={() => setWorkspaceMenuOpen(false)}><X size={15}/></Button></div>
        <div className="workspace-account"><span className="workspace-avatar">JO</span><div><b>Joshua's workspace</b><small>Personal workspace</small></div><ChevronDown size={13}/></div>
        <nav className="workspace-drawer-nav"><Link to="/dashboard" onClick={() => setWorkspaceMenuOpen(false)}><Monitor size={15}/> Dashboard</Link><button onClick={() => setSurface("history")}><History size={15}/> History <span>⌘H</span></button><button onClick={() => setSurface("settings")}><Settings size={15}/> Project settings</button></nav>
        <div className="workspace-drawer-label">Recent projects</div>
        <div className="workspace-recent"><Link to="/project/$projectId" params={{ projectId: "orbit-finance" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-coral"/><span>Orbit Finance</span><ChevronRight size={13}/></Link><Link to="/project/$projectId" params={{ projectId: "atelier-store" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-blue"/><span>Atelier Store</span><ChevronRight size={13}/></Link><Link to="/project/$projectId" params={{ projectId: "signal-notes" }} search={{ prompt: "" }} onClick={() => setWorkspaceMenuOpen(false)}><i className="tone-mint"/><span>Signal Notes</span><ChevronRight size={13}/></Link></div>
        <div className="workspace-drawer-foot"><BookOpen size={14}/><span>Project workspace</span></div>
      </aside>
    </>}

    <section className="editor-workspace">
      <aside className={`chat-panel ${mobileChat ? "mobile-open" : ""}`} aria-hidden={!chatOpen}>
        <div className="chat-feed">
          {projectError && <div role="alert" className="mx-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{projectError}</div>}
          {messages.length === 0 && !building && <div className="mx-4 my-5 rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">This project has no conversation history yet. Describe the first change below.</div>}
          {messages.map((message) => <MessageTurn key={message.id} message={message} plan={plan} onDiscardPlan={discardPlan} previewing={versionId === message.id} detailsOpen={detailsTurn?.id === message.id} onDetails={() => setDetailsTurn(current => current?.id === message.id ? null : message)} onPreview={() => { previewTurn(message); setDetailsTurn(null); }} onOpenPlan={() => { setPlanPreview(true); setSurface("preview"); }} onApprovePlan={approvePlan}/>) }
          {building && <div className="thinking-live"><Sparkles size={13}/><span>Working</span><i/><i/><i/></div>}
        </div>
        <div className="chat-composer-wrap">
          {slashQuery !== null && filteredSkills.length > 0 && <div className="skills-menu"><p>Skills</p>{filteredSkills.map((skill, index) => <button className={index === skillIndex ? "skill-highlight" : ""} key={skill.command} onClick={() => { setDraft(draft.replace(/\/\S*$/, `${skill.command} `)); inputRef.current?.focus(); }}><span>{skill.command}</span><div><b>{skill.title}</b><small>{skill.detail}</small></div></button>)}</div>}
          <div className="chat-composer">
            <input ref={attachmentInputRef} className="sr-only" type="file" multiple onChange={event => { void attachFiles(event.target.files); }} />
            {attachedFiles.length > 0 && <div className="composer-context"><span>{attachedFiles.length} file(s) attached: {attachedFiles.map(file => file.file_name).join(", ")}</span><Button variant="ghost" size="icon-sm" aria-label="Clear attached files" onClick={() => setAttachedFiles([])}><X size={12}/></Button></div>}
            {uploadingFiles && <div className="composer-context"><span>Uploading files to private project storage…</span></div>}
            <textarea ref={inputRef} value={draft} onChange={(event) => { setDraft(event.target.value); setSkillIndex(0); }} onKeyDown={(event) => { if (slashQuery !== null && filteredSkills.length) { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setSkillIndex(current => (current + (event.key === "ArrowDown" ? 1 : -1) + filteredSkills.length) % filteredSkills.length); return; } if (event.key === "Enter") { event.preventDefault(); const skill = filteredSkills[skillIndex]; if (skill) setDraft(draft.replace(/\/\S*$/, `${skill.command} `)); return; } if (event.key === "Escape") { setDraft(draft.replace(/\/\S*$/, "")); return; } } if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} placeholder="Describe a change or ask a question..." rows={3}/>
            <div className="chat-actions">
              <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="outline" size="icon-sm" className="composer-plus" aria-label="Add context"><Plus size={16}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu chat-actions-menu" align="start" side="top"><DropdownMenu.Label>Prompt actions</DropdownMenu.Label><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><Settings size={13}/> Project settings</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("settings")}><BookOpen size={13}/> Project context</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => setSurface("connectors")}><GitBranch size={13}/> GitHub and connectors</DropdownMenu.Item><DropdownMenu.Separator/><DropdownMenu.Item className="editor-menu-item" onSelect={() => setPromptHelperOpen(true)}><WandSparkles size={13}/> Improve this prompt</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => attachmentInputRef.current?.click()}><Paperclip size={13}/> Attach files</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
              <div className="composer-right">
                <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="sm">{mode}<ChevronDown size={11}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu mode-menu" align="end" side="top">{(["Build","Chat","Plan"] as Mode[]).map((item) => <DropdownMenu.Item className="mode-option" key={item} onSelect={() => setMode(item)}><span><b>{item}</b><small>{item === "Build" ? "Make changes directly" : item === "Chat" ? "Ask anything, explore ideas" : "Detailed spec for complex builds"}</small></span>{mode === item && <Check size={14}/>}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
                
                <Button variant={draft.trim() ? "send" : "mutedRound"} size="icon-sm" aria-label="Send message" onClick={submit} disabled={building || !draft.trim()}>{building ? <span className="thinking-dot"/> : <ArrowUp size={15}/>}</Button>
              </div>
            </div>
            {selectedContext && <div className="composer-context"><span>{selectedContext}</span><Button variant="ghost" size="icon-sm" aria-label="Remove context" onClick={() => setSelectedContext(null)}><X size={12}/></Button></div>}
          </div>
        </div>
      </aside>

      {chatOpen && <Button variant="ghost" size="icon-sm" role="separator" aria-orientation="vertical" aria-label="Resize chat and preview panels" aria-valuemin={280} aria-valuemax={720} aria-valuenow={Math.round(chatWidth)} tabIndex={0} className="panel-splitter" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setResizing(true); }} onPointerMove={(event) => { if (!resizing) return; const bounds = event.currentTarget.parentElement?.getBoundingClientRect(); if (!bounds) return; const max = Math.min(bounds.width - 320, bounds.width * .58); setChatWidth(Math.max(280, Math.min(max, event.clientX - bounds.left))); }} onPointerUp={() => setResizing(false)} onPointerCancel={() => setResizing(false)} onKeyDown={(event) => { if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return; event.preventDefault(); const bounds = event.currentTarget.parentElement?.getBoundingClientRect(); const max = bounds ? Math.min(bounds.width - 320, bounds.width * .58) : 720; setChatWidth(event.key === "Home" ? 280 : event.key === "End" ? max : Math.max(280, Math.min(max, chatWidth + (event.key === "ArrowRight" ? 20 : -20)))); }}><span/></Button>}
      <section className="workspace-area">
        {detailsTurn ? <BuildDetailsDrawer turn={detailsTurn} onClose={() => setDetailsTurn(null)} onPreview={() => { previewTurn(detailsTurn); setDetailsTurn(null); }}/> : <>
        {surface === "preview" && <PreviewNavigation device={device} setDevice={setDevice} selectedPage={selectedPage} setSelectedPage={setSelectedPage} pageSearch={pageSearch} setPageSearch={setPageSearch} filteredPages={filteredPages} hasPreview={Boolean(previewHtml)} onOpenPreview={() => { if (!previewHtml) return; const url = URL.createObjectURL(new Blob([previewHtml], { type: "text/html" })); window.open(url, "_blank", "noopener,noreferrer"); window.setTimeout(() => URL.revokeObjectURL(url), 60000); }} onRefresh={() => setRefreshKey((value) => value + 1)}/>} 
        <div className="surface-viewport">
          {surface === "preview" ? planPreview ? <PlanPreview plan={plan} onChange={updatePlan} onApprove={approvePlan} onDiscard={discardPlan} onClose={() => setPlanPreview(false)}/> : <PreviewCanvas previewHtml={messages.find(message => message.id === versionId)?.previewHtml ?? previewHtml} onPreviewHtmlChange={async (html) => { setPreviewHtml(html); try { const file = new File([html], "index.html", { type: "text/html" }); await uploadPreviewFile(file, projectId, request, upload); } catch (error) { setProjectError(error instanceof Error ? error.message : "Could not save inline text edits."); } }} key={refreshKey} device={device} activeTool={activeTool} setActiveTool={setActiveTool} toolsVisible={previewToolsVisible} setToolsVisible={setPreviewToolsVisible} onAttach={(context) => { setSelectedContext(context); setChatOpen(true); inputRef.current?.focus(); }} previewVersion={previewVersion} onBackToLatest={() => { setVersionId(null); setPreviewVersion(null); }} onRestore={restoreVersion}/> : <SurfacePanel projectId={projectId} enabledSkills={enabledSkills} setEnabledSkills={updateEnabledSkills} versions={messages.filter(message => Boolean(message.previewHtml))} onPreviewVersion={id => { const version = messages.find(message => message.id === id); if (version) previewTurn(version); }} surface={surface} onBack={() => setSurface("preview")} onSelectSurface={setSurface}/>} 
        </div>
        </>}
      </section>
    </section>

    {mobileChat && <button className="mobile-backdrop" onClick={() => setMobileChat(false)} aria-label="Close chat"/>}
    {!chatOpen && <Button variant="editorActive" size="icon-sm" className="chat-restore" onClick={() => setChatOpen(true)} aria-label="Show chat panel"><ChevronRight size={15}/></Button>}
    <ProjectDialog open={shareOpen} onClose={() => setShareOpen(false)} projectName={projectName} projectId={projectId}/>
    <PromptHelperDialog open={promptHelperOpen} onOpenChange={setPromptHelperOpen} draft={draft} onUse={(value) => { setDraft(value); setPromptHelperOpen(false); inputRef.current?.focus(); }}/>
  </main>;
}

function SurfaceTab({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: typeof Monitor; onClick: () => void }) {
  return <Button variant={active ? "editorActive" : "ghost"} size="sm" className={`surface-tab ${active ? "is-active" : ""}`} aria-label={label} title={label} onClick={onClick}><Icon size={14}/><span>{label}</span></Button>;
}

function PreviewNavigation({ device, setDevice, selectedPage, setSelectedPage, pageSearch, setPageSearch, filteredPages, hasPreview, onOpenPreview, onRefresh }: { device: Device; setDevice: (device: Device) => void; selectedPage: typeof pages[number]; setSelectedPage: (page: typeof pages[number]) => void; pageSearch: string; setPageSearch: (value: string) => void; filteredPages: typeof pages; hasPreview: boolean; onOpenPreview: () => void; onRefresh: () => void }) {
  const DeviceIcon = device === "desktop" ? Monitor : device === "tablet" ? Tablet : Smartphone;
  const nextDevice: Device = device === "desktop" ? "mobile" : device === "mobile" ? "tablet" : "desktop";
  return <div className="preview-navigation">
    <div className="preview-history-controls"><span className="text-xs text-zinc-500">Preview</span></div>
    <div className="preview-address-controls">
      <Button variant="ghost" size="icon-sm" aria-label={`Switch preview from ${device} to ${nextDevice}`} title={`Switch to ${nextDevice} view`} onClick={() => setDevice(nextDevice)}><DeviceIcon size={15}/></Button>
      <Button variant="ghost" size="icon-sm" title="Refresh preview" onClick={onRefresh}><RefreshCw size={14}/></Button><Button variant="ghost" size="icon-sm" title="Open preview in a new tab" aria-label="Open preview in a new tab" disabled={!hasPreview} onClick={onOpenPreview}><ExternalLink size={14}/></Button>
      <DropdownMenu.Root onOpenChange={(open) => { if (!open) setPageSearch(""); }}><DropdownMenu.Trigger asChild><Button variant="ghost" size="sm" className="route-pill"><span>{selectedPage.path}</span><ChevronDown size={12}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu page-menu" align="center"><div className="page-search"><Search size={13}/><input value={pageSearch} onChange={(event) => setPageSearch(event.target.value)} placeholder="Find page" autoFocus/></div>{filteredPages.map((page) => <DropdownMenu.Item className="page-option" key={page.path} onSelect={() => setSelectedPage(page)}><div><b>{page.name}</b><small>{page.path}</small></div>{selectedPage.path === page.path && <Check size={13}/>}</DropdownMenu.Item>)}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
      
    </div>
    <span className="preview-status"><i/> {hasPreview ? "Preview ready" : "No preview yet"}</span>
  </div>;
}

function MessageTurn({ message, plan, onDiscardPlan, previewing, detailsOpen, onDetails, onPreview, onOpenPlan, onApprovePlan }: { message: Message; plan: PlanState; onDiscardPlan: () => void; previewing: boolean; detailsOpen: boolean; onDetails: () => void; onPreview: () => void; onOpenPlan: () => void; onApprovePlan: () => void }) {
  const hasSavedPreview = Boolean(message.previewHtml);
  return <article className="message-turn" id={"turn-" + message.id}>
    <p className="user-message">{message.text}</p>
    {message.kind === "plan" ? <PlanCard plan={plan} onOpen={onOpenPlan} onApprove={onApprovePlan} onDiscard={onDiscardPlan}/> : <section className={"turn-result " + (detailsOpen ? "is-selected" : "")}>
      <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500"><span className={"h-1.5 w-1.5 rounded-full " + (message.status === "failed" ? "bg-red-500" : message.status === "running" ? "animate-pulse bg-amber-500" : "bg-emerald-500")}/><span>{message.status === "failed" ? "Failed" : message.status === "running" ? "Running" : message.status === "completed" ? "Completed" : "Saved execution"}</span></div>
      <p className="turn-summary whitespace-pre-wrap">{message.summary}</p>
      <div className="turn-primary-actions"><Button variant={detailsOpen ? "editorActive" : "outline"} size="sm" disabled={!message.dbId} onClick={onDetails}><ListChecks size={13}/>{detailsOpen ? "Hide details" : "Execution details"}</Button><Button variant={previewing ? "editorActive" : "outline"} size="sm" disabled={!hasSavedPreview} onClick={onPreview}><Eye size={13}/>{previewing ? "Previewing" : "Preview saved output"}</Button></div>
    </section>}
    <div className="message-actions">{hasSavedPreview && <Button variant="ghost" size="icon-sm" title="Preview saved version" onClick={onPreview}><RotateCcw size={13}/></Button>}<Button variant="ghost" size="icon-sm" title="Copy response" onClick={() => { void navigator.clipboard?.writeText(message.summary); }}><Copy size={13}/></Button><DropdownMenu.Root><DropdownMenu.Trigger asChild><Button variant="ghost" size="icon-sm" title="More actions"><MoreHorizontal size={14}/></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="editor-menu" align="start"><DropdownMenu.Item className="editor-menu-item" disabled={!message.dbId} onSelect={onDetails}>View execution details</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => { void navigator.clipboard?.writeText(message.text); }}>Copy request</DropdownMenu.Item><DropdownMenu.Item className="editor-menu-item" onSelect={() => { void navigator.clipboard?.writeText(message.summary); }}>Copy result</DropdownMenu.Item></DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root></div>
  </article>;
}

async function uploadPreviewFile(file: File, projectId: string, request: <T,>(path: string, init?: RequestInit) => Promise<T>, upload: (path: string, file: File) => Promise<void>) {
  const storagePath = projectId + "/index.html";
  await upload(storagePath, file);
  const body = {
    project_id: projectId, file_path: "index.html", file_name: "index.html", mime_type: "text/html",
    size_bytes: file.size, storage_path: storagePath, text_content: await file.text(), source: "generated", updated_at: new Date().toISOString(),
  };
  await request("project_files?on_conflict=project_id,file_path", {
    method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(body),
  });
}

function PreviewCanvas({ previewHtml, onPreviewHtmlChange, device, activeTool, setActiveTool, toolsVisible, setToolsVisible, onAttach, previewVersion, onBackToLatest, onRestore }: { previewHtml: string | null; onPreviewHtmlChange: (html: string) => void; device: Device; activeTool: PreviewTool | null; setActiveTool: (tool: PreviewTool | null) => void; toolsVisible: boolean; setToolsVisible: (value: boolean) => void; onAttach: (context: string) => void; previewVersion: string | null; onBackToLatest: () => void; onRestore: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectTool = (tool: PreviewTool) => setActiveTool(activeTool === tool ? null : tool);
  const inspectorScript = "<script id=\"figurable-inspector\">(function(){let tool=\"\";let hovered=null;function selectorFor(el){if(el.id)return \"#\"+CSS.escape(el.id);const parts=[];while(el&&el.nodeType===1&&el.tagName.toLowerCase()!==\"html\"){let part=el.tagName.toLowerCase();if(el.parentElement){const siblings=Array.from(el.parentElement.children).filter(x=>x.tagName===el.tagName);if(siblings.length>1)part+=\":nth-of-type(\"+(siblings.indexOf(el)+1)+\")\";}parts.unshift(part);el=el.parentElement;}return parts.join(\" > \");}function mark(el){if(hovered&&hovered!==el)hovered.style.outline=\"\";hovered=el;if(el)el.style.outline=\"2px solid #0070f3\";}document.addEventListener(\"mouseover\",function(e){if(tool===\"select\"||tool===\"text\")mark(e.target.closest(\"body *\"));});document.addEventListener(\"mouseout\",function(e){if(hovered&&e.target===hovered){hovered.style.outline=\"\";hovered=null;}});document.addEventListener(\"click\",function(e){if(tool!==\"select\"&&tool!==\"text\")return;const el=e.target.closest(\"body *\");if(!el||el.id===\"figurable-inspector\")return;e.preventDefault();e.stopPropagation();const selector=selectorFor(el);parent.postMessage({type:\"figurable:selected\",selector:selector,tag:el.tagName.toLowerCase(),text:(el.innerText||el.textContent||\"\").trim().slice(0,500),width:Math.round(el.getBoundingClientRect().width),height:Math.round(el.getBoundingClientRect().height)},\"*\");if(tool===\"text\"){el.contentEditable=\"true\";el.focus();el.addEventListener(\"blur\",function(){el.contentEditable=\"false\";const clone=document.documentElement.cloneNode(true);const injected=clone.querySelector(\"#figurable-inspector\");if(injected)injected.remove();parent.postMessage({type:\"figurable:html\",html:\"<!doctype html>\"+clone.outerHTML},\"*\");},{once:true});}},true);window.addEventListener(\"message\",function(e){if(e.data&&e.data.type===\"figurable:set-tool\")tool=e.data.tool||\"\";});})();</script>";
  const instrumentedHtml = previewHtml ? (/<\/body>/i.test(previewHtml) ? previewHtml.replace(/<\/body>/i, inspectorScript + "</body>") : previewHtml + inspectorScript) : "";
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || !event.data || typeof event.data !== "object") return;
      if (event.data.type === "figurable:selected") {
        const item = event.data as { selector: string; tag: string; text: string; width: number; height: number };
        onAttach("Selected element <" + item.tag + "> using selector " + item.selector + "; dimensions " + item.width + " × " + item.height + "; current text: " + item.text);
      }
      if (event.data.type === "figurable:html" && typeof event.data.html === "string") onPreviewHtmlChange(event.data.html);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onAttach, onPreviewHtmlChange]);
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "figurable:set-tool", tool: activeTool === "select" || activeTool === "text" ? activeTool : "" }, "*");
  }, [activeTool, instrumentedHtml]);
  return <div className="preview-stage">
    {previewVersion && <div className="version-banner"><Clock3 size={15}/><span><b>Previewing previous build</b><small>{previewVersion}</small></span><Button variant="outline" size="sm" onClick={onBackToLatest}>Back to latest</Button><Button variant="editorActive" size="sm" onClick={onRestore} disabled={!previewHtml}>Restore checkpoint</Button></div>}
    {toolsVisible ? <div className="visual-tools"><Button variant={activeTool === "select" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion || !previewHtml} onClick={() => selectTool("select")} title="Select elements"><MousePointer2 size={14}/></Button><Button variant={activeTool === "text" ? "editorActive" : "ghost"} size="icon-sm" disabled={!!previewVersion || !previewHtml} onClick={() => selectTool("text")} title="Edit text inline"><Type size={14}/></Button><span/><Button variant="ghost" size="icon-sm" onClick={() => setToolsVisible(false)} title="Hide preview toolbar"><ChevronLeft size={14}/></Button></div> : <Button variant="editorActive" size="icon-sm" className="visual-tools-restore" onClick={() => setToolsVisible(true)} title="Show preview toolbar"><ChevronRight size={15}/></Button>}
    <div className={"device-frame " + device} style={{ position: "relative", overflow: "hidden" }}>
      {previewHtml ? <iframe ref={iframeRef} title="Generated project preview" srcDoc={instrumentedHtml} sandbox="allow-scripts" onLoad={() => iframeRef.current?.contentWindow?.postMessage({ type: "figurable:set-tool", tool: activeTool === "select" || activeTool === "text" ? activeTool : "" }, "*")} style={{ display: "block", width: "100%", height: "100%", minHeight: "70vh", border: 0, background: "white" }} /> : <div className="grid min-h-[65vh] place-items-center bg-white p-8 text-center"><div className="max-w-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Monitor size={20}/></div><h2 className="mt-4 text-lg font-semibold text-zinc-900">No preview output yet</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Use Build mode to generate the first project files. The preview appears here after the agent saves a valid index.html.</p></div></div>}
      {previewVersion && <div className="snapshot-watermark"><LockKeyhole size={12}/> READ-ONLY SNAPSHOT</div>}
    </div>
  </div>;
}

function PromptHelperDialog({ open, onOpenChange, draft, onUse }: { open: boolean; onOpenChange: (value: boolean) => void; draft: string; onUse: (value: string) => void }) {
  const improved = draft.trim() ? `Objective\n${draft.trim()}\n\nScope\nFocus only on the requested interface and preserve existing behavior.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.` : "Objective\nDescribe the change you want to make.\n\nScope\nName the screen and behavior that should change.\n\nVerification\nCheck the affected view at desktop, tablet, and mobile widths.";
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="editor-dialog prompt-helper-dialog"><Dialog.Title>Shape this request</Dialog.Title><Dialog.Description>Turn a rough note into a clearer brief before sending it.</Dialog.Description><div className="prompt-helper-preview"><div><span>OBJECTIVE</span><b>Clear goal and current state</b></div><div><span>SCOPE</span><b>Focused files and things to preserve</b></div><div><span>VERIFY</span><b>Practical checks before calling it done</b></div></div><textarea value={improved} readOnly/><div className="dialog-actions"><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="editorActive" onClick={() => onUse(improved)}>Use brief</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

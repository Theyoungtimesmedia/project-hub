import {
  Activity, ArrowLeft, BarChart3, Check, CheckCircle2, ChevronDown, ChevronRight, Cloud, Code2, Copy,
  CreditCard, Database, Download, ExternalLink, File, FileText, Flame, Folder, Globe2, GitBranch, KeyRound, Lock,
  MoreHorizontal, Plus, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Terminal,
  Users, History as HistoryIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBackend } from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { SupabaseSetup, SkillsManager, SeoSurface, AiSurface, SecurityAudit, AnalyticsExpanded, CloudResources, PaymentsSurface, AgentIntegrationsSurface } from "./more-pages";
import type { Surface } from "@/lib/mock-data";

const moreNav: { label: string; value: Surface; icon: typeof Cloud }[] = [
  { label: "AI", value: "ai", icon: Sparkles },
  { label: "Connectors", value: "connectors", icon: GitBranch },
  { label: "Settings & context", value: "settings", icon: Settings },
];

export function SurfacePanel({ projectId, surface, onBack, onSelectSurface, versions, onPreviewVersion, enabledSkills, setEnabledSkills }: { projectId: string; surface: Surface; onBack: () => void; onSelectSurface: (surface: Surface) => void; versions: { id: number; text: string }[]; onPreviewVersion: (id: number) => void; enabledSkills: string[]; setEnabledSkills: (items: string[]) => void }) {
  if (surface === "code") return <CodeSurface projectId={projectId}/>;
  if (surface === "files") return <FilesSurface projectId={projectId}/>;
  if (surface === "history") return <HistorySurface onBack={onBack} versions={versions} onPreviewVersion={onPreviewVersion}/>;
  return <MoreSurface projectId={projectId} enabledSkills={enabledSkills} setEnabledSkills={setEnabledSkills} surface={surface} onBack={onBack} onSelectSurface={onSelectSurface}/>;
}

function SurfaceTitle({ title, detail, onBack }: { title: string; detail?: string; onBack?: () => void }) {
  return <header className="surface-title">{onBack && <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to preview"><ArrowLeft size={14}/></Button>}<div><h2>{title}</h2>{detail && <p>{detail}</p>}</div></header>;
}

type StoredProjectFile = { id: string; project_id: string; file_path: string; file_name: string; mime_type: string; size_bytes: number; storage_path: string | null; text_content: string | null; source: string; updated_at: string };

function CodeSurface({ projectId }: { projectId: string }) {
  const { request, download, upload } = useBackend();
  const [files, setFiles] = useState<StoredProjectFile[]>([]);
  const [selected, setSelected] = useState<StoredProjectFile | null>(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFiles(chooseFirst = false) {
    setLoading(true);
    setError(null);
    try {
      const rows = await request<StoredProjectFile[]>("project_files?select=id,project_id,file_path,file_name,mime_type,size_bytes,storage_path,text_content,source,updated_at&project_id=eq." + projectId + "&order=file_path.asc");
      setFiles(rows);
      if (chooseFirst && rows.length) await openFile(rows[0]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load project files.");
    } finally { setLoading(false); }
  }

  async function openFile(file: StoredProjectFile) {
    setSelected(file);
    setError(null);
    try {
      let text = file.text_content;
      if (text === null && file.storage_path) text = await (await download(file.storage_path)).text();
      setContent(text ?? "");
      setOriginal(text ?? "");
    } catch (cause) {
      setContent("");
      setOriginal("");
      setError(cause instanceof Error ? cause.message : "Could not open file.");
    }
  }

  useEffect(() => { void loadFiles(true); }, [projectId]);

  async function saveFile() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const path = selected.storage_path ?? projectId + "/" + selected.file_path;
      await upload(path, new File([content], selected.file_name, { type: selected.mime_type || "text/plain" }));
      await request("project_files?id=eq." + selected.id, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ storage_path: path, text_content: content.length <= 100000 ? content : null, size_bytes: new TextEncoder().encode(content).length, updated_at: new Date().toISOString() }) });
      setOriginal(content);
      await loadFiles(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save file.");
    } finally { setSaving(false); }
  }

  function downloadCurrent() {
    if (!selected) return;
    const url = URL.createObjectURL(new Blob([content], { type: selected.mime_type || "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = selected.file_name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const visible = files.filter(file => file.file_path.toLowerCase().includes(query.toLowerCase()));
  return <div className="code-surface"><aside className="code-tree"><div className="code-search"><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project files"/><ChevronDown size={13}/></div><div className="tree-root"><ChevronDown size={13}/><Folder size={14}/><b>Project files</b></div>{loading && <p className="px-3 py-4 text-xs text-zinc-500">Loading files…</p>}{!loading && visible.length === 0 && <p className="px-3 py-4 text-xs text-zinc-500">No files uploaded or generated yet.</p>}{visible.map(file => <Button variant={selected?.id === file.id ? "editorActive" : "ghost"} size="sm" className="tree-file" key={file.id} onClick={() => void openFile(file)}><File size={13}/><span>{file.file_path}</span></Button>)}<Button variant="outline" size="sm" className="download-code" disabled={!selected} onClick={downloadCurrent}><Download size={13}/> Download file</Button></aside><main className="code-editor"><div className="code-editor-head"><span>{selected?.file_path ?? "No file selected"} <small>{selected?.mime_type ?? ""}</small></span><div><Button variant="ghost" size="icon-sm" title="Download file" disabled={!selected} onClick={downloadCurrent}><Download size={13}/></Button><Button variant="editorActive" size="sm" disabled={!selected || content === original || saving} onClick={() => void saveFile()}>{saving ? "Saving…" : "Save file"}</Button></div></div>{error && <p role="alert" className="m-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}{selected ? <textarea aria-label={"Edit " + selected.file_path} spellCheck={false} value={content} onChange={event => setContent(event.target.value)} className="min-h-[65vh] w-full resize-none bg-white p-4 font-mono text-xs leading-6 text-zinc-800 outline-none" /> : <div className="grid min-h-[65vh] place-items-center p-8 text-center text-sm text-zinc-500">Select a file to inspect or edit its saved contents.</div>}<div className="read-only-note"><Lock size={12}/> {selected ? (content === original ? "Saved version" : "Unsaved changes") : "Private project storage"}</div></main></div>;
}

function FilesSurface({ projectId }: { projectId: string }) {
  const { session, request, upload, download } = useBackend();
  const [files, setFiles] = useState<StoredProjectFile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFiles() {
    setLoading(true);
    try {
      const rows = await request<StoredProjectFile[]>("project_files?select=id,project_id,file_path,file_name,mime_type,size_bytes,storage_path,text_content,source,updated_at&project_id=eq." + projectId + "&order=created_at.desc");
      setFiles(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load files.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadFiles(); }, [projectId]);

  async function handleUpload(file?: File) {
    if (!file || !session) return;
    const safeName = file.name.replace(/[\\\\/]+/g, "-").replace(/\\.\\.+/g, "-").slice(0, 180);
    const path = projectId + "/" + safeName;
    setUploading(true);
    setError(null);
    try {
      await upload(path, file);
      const text = file.size <= 100000 && (file.type.startsWith("text/") || /json|javascript|xml|svg/.test(file.type)) ? await file.text() : null;
      await request("project_files?on_conflict=project_id,file_path", {
        method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ project_id: projectId, file_path: safeName, file_name: file.name, mime_type: file.type || "application/octet-stream", size_bytes: file.size, storage_path: path, text_content: text, source: "upload", uploaded_by: session.user.id, updated_at: new Date().toISOString() }),
      });
      await loadFiles();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally { setUploading(false); }
  }

  async function downloadFile(file: StoredProjectFile) {
    if (!file.storage_path) return;
    try {
      const blob = await download(file.storage_path);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = file.file_name; anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Download failed."); }
  }

  const visible = files.filter(file => (file.file_name + " " + file.file_path).toLowerCase().includes(query.toLowerCase()));
  return <div className="full-surface"><SurfaceTitle title="Files" detail="Files stored privately for this project"/><div className="files-toolbar"><label><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files"/></label><label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-medium text-white">{uploading ? "Uploading…" : <><Plus size={13}/> Upload file</>}<input className="sr-only" type="file" disabled={uploading} onChange={event => { void handleUpload(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label></div>{error && <p role="alert" className="m-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}{loading ? <p className="p-8 text-center text-sm text-zinc-500">Loading files…</p> : <div className="files-grid">{visible.map(file => <article key={file.id}><span><FileText size={19}/></span><div><b>{file.file_name}</b><small>{file.mime_type} · {(file.size_bytes / 1024).toFixed(1)} KB · {file.source}</small></div><Button variant="ghost" size="icon-sm" aria-label={"Download " + file.file_name} onClick={() => void downloadFile(file)}><Download size={14}/></Button></article>)}{visible.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">No project files yet. Upload a file or run Build mode.</p>}</div>}</div>;
}

function HistorySurface({ onBack, versions, onPreviewVersion }: { onBack: () => void; versions: { id: number; text: string }[]; onPreviewVersion: (id: number) => void }) {
  const [tab, setTab] = useState("History"); const [bookmarks, setBookmarks] = useState<number[]>([]);
  return <div className="history-surface"><SurfaceTitle title="History" detail="Local project snapshots" onBack={onBack}/><div className="history-tabs">{["History", "Bookmarks"].map(item => <Button key={item} variant={tab === item ? "editorActive" : "ghost"} size="sm" onClick={() => setTab(item)}>{item}</Button>)}</div><div className="history-list">{[...versions].reverse().filter(version => tab === "History" || bookmarks.includes(version.id)).map((version, index) => <div className="history-entry" key={version.id}><Button variant="ghost" onClick={() => onPreviewVersion(version.id)}><span><b>{version.text}</b><small>{index === 0 ? "Latest snapshot" : "Previous snapshot"}</small></span><ChevronRight size={13}/></Button><Button variant={bookmarks.includes(version.id) ? "editorActive" : "outline"} size="icon-sm" aria-label={`Bookmark turn ${version.id}`} onClick={() => setBookmarks(bookmarks.includes(version.id) ? bookmarks.filter(id => id !== version.id) : [...bookmarks, version.id])}><Check size={13}/></Button></div>)}{tab === "Bookmarks" && !bookmarks.length && <div className="empty-state"><HistoryIcon size={22}/><b>No bookmarks yet</b></div>}</div></div>;
}

function MoreSurface({ projectId, surface, onBack, onSelectSurface, enabledSkills, setEnabledSkills }: { projectId: string; surface: Surface; onBack: () => void; onSelectSurface: (surface: Surface) => void; enabledSkills: string[]; setEnabledSkills: (items: string[]) => void }) {
  const safeSurface = moreNav.some((item) => item.value === surface) ? surface : "settings";
  return <div className="more-surface"><aside className="more-sidebar">{moreNav.map(({ label, value, icon: Icon }) => <Button key={value} aria-label={label} title={label} variant={safeSurface === value ? "editorActive" : "ghost"} size="sm" onClick={() => onSelectSurface(value)}><Icon size={14}/><span>{label}</span></Button>)}</aside><section className="more-content"><SurfaceTitle title={safeSurface === "settings" ? "Project settings" : moreNav.find((item) => item.value === safeSurface)?.label ?? "More"} onBack={onBack}/>{safeSurface === "settings" ? <SettingsSurface projectId={projectId} onSelectSurface={onSelectSurface} enabledSkills={enabledSkills} setEnabledSkills={setEnabledSkills}/> : safeSurface === "cloud" ? <CloudResources/> : safeSurface === "analytics" ? <AnalyticsExpanded/> : safeSurface === "security" ? <SecurityAudit/> : safeSurface === "payments" ? <PaymentsSurface/> : safeSurface === "agents" ? <AgentIntegrationsSurface/> : <FeatureSurface surface={safeSurface} projectId={projectId}/>}</section></div>;
}

function SettingsSurface({ projectId, onSelectSurface, enabledSkills, setEnabledSkills }: { projectId: string; onSelectSurface: (surface: Surface) => void; enabledSkills: string[]; setEnabledSkills: (items: string[]) => void }) {
  const { session, request } = useBackend();
  const [tab, setTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [knowledge, setKnowledge] = useState<Array<{ id: string; title: string; content: string; created_at: string }>>([]);
  const [knowledgeTitle, setKnowledgeTitle] = useState("");
  const [knowledgeContent, setKnowledgeContent] = useState("");
  const [github, setGithub] = useState<{ repository_owner: string; repository_name: string; default_branch: string; auto_push_enabled: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProject() {
      try {
        const rows = await request<Array<{ name: string; description: string; instructions: string }>>("projects?select=name,description,instructions&id=eq." + projectId);
        if (!rows[0]) throw new Error("Project not found or access was removed.");
        if (!cancelled) {
          setName(rows[0].name); setDescription(rows[0].description ?? ""); setInstructions(rows[0].instructions ?? "");
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load project settings.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void loadProject();
    return () => { cancelled = true; };
  }, [projectId, request]);

  useEffect(() => {
    if (tab !== "Knowledge" && tab !== "Git") return;
    let cancelled = false;
    async function loadTab() {
      try {
        if (tab === "Knowledge") {
          const rows = await request<Array<{ id: string; title: string; content: string; created_at: string }>>("project_knowledge?select=id,title,content,created_at&project_id=eq." + projectId + "&order=created_at.desc");
          if (!cancelled) setKnowledge(rows);
        } else {
          const rows = await request<Array<{ repository_owner: string; repository_name: string; default_branch: string; auto_push_enabled: boolean }>>("github_integrations?select=repository_owner,repository_name,default_branch,auto_push_enabled&project_id=eq." + projectId);
          if (!cancelled) setGithub(rows[0] ?? null);
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load this settings section.");
      }
    }
    void loadTab();
    return () => { cancelled = true; };
  }, [tab, projectId, request]);

  async function saveProject() {
    setSaving(true); setError(null); setNotice("");
    try {
      await request("projects?id=eq." + projectId, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ name: name.trim(), description, instructions, updated_at: new Date().toISOString() }) });
      setNotice("Project details and instructions saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project settings.");
    } finally { setSaving(false); }
  }

  async function addKnowledge() {
    if (!knowledgeTitle.trim() || !knowledgeContent.trim() || !session) return;
    setSaving(true); setError(null); setNotice("");
    try {
      await request("project_knowledge", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ project_id: projectId, title: knowledgeTitle.trim(), content: knowledgeContent.trim(), created_by: session.user.id }) });
      setKnowledgeTitle(""); setKnowledgeContent("");
      const rows = await request<Array<{ id: string; title: string; content: string; created_at: string }>>("project_knowledge?select=id,title,content,created_at&project_id=eq." + projectId + "&order=created_at.desc");
      setKnowledge(rows); setNotice("Knowledge saved to this project.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project knowledge.");
    } finally { setSaving(false); }
  }

  return <div className="settings-layout"><nav>{["General","Knowledge","Git","Skills"].map(item => <Button key={item} variant={tab === item ? "editorActive" : "ghost"} size="sm" onClick={() => setTab(item)}>{item}</Button>)}</nav><div className="settings-scroll">{loading ? <p className="p-5 text-sm text-zinc-500">Loading saved project settings…</p> : tab === "General" ? <><SettingsSection title="Project details"><label className="settings-field">Project name<input value={name} onChange={event => setName(event.target.value)} maxLength={120}/></label><label className="settings-field">Description<textarea value={description} onChange={event => setDescription(event.target.value)}/></label><Button variant="editorActive" size="sm" disabled={saving || !name.trim()} onClick={() => void saveProject()}>{saving ? "Saving…" : "Save project details"}</Button></SettingsSection><SettingsSection title="Persistent project instructions"><p className="section-description">These instructions are sent with every Build, Plan and Chat request for this project.</p><label className="settings-field">Project context<textarea value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Architecture, conventions, constraints, acceptance criteria, and things that must not change."/></label><Button variant="editorActive" size="sm" disabled={saving} onClick={() => void saveProject()}>{saving ? "Saving…" : "Save instructions"}</Button></SettingsSection></> : tab === "Knowledge" ? <><SettingsSection title="Project knowledge"><p className="section-description">Saved notes and scraped sources are retrieved as context by the agent.</p><label className="settings-field">Title<input value={knowledgeTitle} onChange={event => setKnowledgeTitle(event.target.value)} placeholder="Requirement, decision, or source title"/></label><label className="settings-field">Content<textarea value={knowledgeContent} onChange={event => setKnowledgeContent(event.target.value)} placeholder="Write the facts or constraints the agent should retain."/></label><Button variant="editorActive" size="sm" disabled={saving || !knowledgeTitle.trim() || !knowledgeContent.trim()} onClick={() => void addKnowledge()}>{saving ? "Saving…" : "Save knowledge"}</Button></SettingsSection><div className="mt-4 space-y-2">{knowledge.map(item => <article key={item.id} className="rounded-xl border border-zinc-200 bg-white p-3"><b className="text-sm">{item.title}</b><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-zinc-600">{item.content}</p><small className="mt-2 block text-[11px] text-zinc-400">{new Date(item.created_at).toLocaleString()}</small></article>)}{knowledge.length === 0 && <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500">No project knowledge saved yet.</p>}</div></> : tab === "Git" ? <SettingsSection title="GitHub connection">{github ? <><div className="git-card"><div><GitBranch size={17}/><span><b>{github.repository_owner}/{github.repository_name}</b><small>Branch: {github.default_branch}</small></span></div><span className={github.auto_push_enabled ? "status-good" : "status-muted"}>{github.auto_push_enabled ? "Auto-push enabled" : "Auto-push disabled"}</span></div><Button variant="editorActive" size="sm" onClick={() => onSelectSurface("connectors")}>Manage GitHub connection</Button></> : <><p className="section-description">No repository is connected to this project.</p><Button variant="editorActive" size="sm" onClick={() => onSelectSurface("connectors")}>Connect GitHub</Button></>}</SettingsSection> : <SkillsManager enabled={enabledSkills} onChange={setEnabledSkills}/>}</div>{error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}{notice && <p role="status" className="mt-3 text-xs text-emerald-700">{notice}</p>}</div>;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="settings-section"><h3>{title}</h3><div>{children}</div></section>; }

function FeatureSurface({ surface, projectId }: { surface: Surface; projectId: string }) { const data = useMemo(() => ({ ai: ["AI usage", "Monitor models, request volume, and spend.", Sparkles], agents: ["Agent integrations", "Connect tools that extend your project agent.", Sparkles], payments: ["Payments", "Set up products, subscriptions, and checkout.", CreditCard], seo: ["SEO & AI search", "Review metadata, indexing, and accessibility.", Globe2], logs: ["Logs", "Inspect recent project activity.", Terminal] } as const), []); const item = data[surface as keyof typeof data] ?? ["Project tool", "Configure this project feature.", Settings] as const; const Icon = item[2]; if (surface === "seo") return <SeoSurface/>; if (surface === "ai") return <AiSurface projectId={projectId}/>; if (surface === "connectors") return <ConnectorsSurface projectId={projectId}/>; return <div className="feature-page"><div className="feature-empty"><span><Icon size={21}/></span><h3>{item[0]}</h3><p>{item[1]}</p><Button variant="editorActive" size="sm">Open setup</Button></div></div>; }

function FirecrawlSurface({ projectId }: { projectId: string }) {
  const { request, invoke } = useBackend();
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ id: string; title: string; content: string; created_at: string }>>([]);

  async function loadSources() {
    try {
      const [rows, secrets] = await Promise.all([
        request<Array<{ id: string; title: string; content: string; created_at: string }>>(
          "project_knowledge?select=id,title,content,created_at&project_id=eq." + projectId + "&order=created_at.desc&limit=8"
        ),
        request<Array<{ secret_key: string }>>("project_secrets?select=secret_key&project_id=eq." + projectId + "&secret_key=eq.FIRECRAWL_API_KEY"),
      ]);
      setSources(rows);
      setKeySaved(secrets.length > 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load saved project knowledge.");
    }
  }

  useEffect(() => { void loadSources(); }, [projectId]);

  async function saveKey() {
    if (!apiKey.trim()) return;
    setBusy(true); setError(null);
    try {
      await request("rpc/store_project_secret", { method: "POST", body: JSON.stringify({ p_project_id: projectId, p_secret_key: "FIRECRAWL_API_KEY", p_secret_value: apiKey.trim() }) });
      setApiKey(""); setKeySaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save Firecrawl credential.");
    } finally { setBusy(false); }
  }

  async function scrape() {
    if (!url.trim() || busy) return;
    setBusy(true); setError(null); setLastResult("");
    try {
      const result = await invoke<{ success: boolean; title: string; sourceUrl: string; characters: number; savedAt: string }>("figurable-scrape", { projectId, url: url.trim() });
      setLastResult("Saved " + result.title + " · " + result.characters.toLocaleString() + " characters");
      await loadSources();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Scrape failed.");
    } finally { setBusy(false); }
  }

  return <div className="feature-page connector-page"><div className="connector-hero"><div className="connector-icon firecrawl-icon"><Flame size={20}/></div><div><div className="feature-kicker">CONNECTOR <span className="connector-live">Server-side</span></div><h3>Firecrawl</h3><p>Extract readable website content into this project's persistent knowledge.</p></div></div><div className="connector-grid"><section className="connector-card"><div className="connector-card-head"><span><KeyRound size={15}/><b>Encrypted API credential</b></span><span className={keySaved ? "status-good" : "status-muted"}>{keySaved ? "Saved" : "Not configured"}</span></div><p>The key is encrypted in Supabase Vault. It is never bundled into the browser app.</p><label className="settings-field">Firecrawl API key<input type="password" autoComplete="off" value={apiKey} onChange={event => setApiKey(event.target.value)} placeholder={keySaved ? "Enter a replacement key to rotate it" : "Paste API key"}/></label><Button variant="outline" size="sm" disabled={busy || !apiKey.trim()} onClick={() => void saveKey()}>{busy ? "Saving…" : keySaved ? "Replace encrypted key" : "Save encrypted key"}</Button></section><section className="connector-card"><div className="connector-card-head"><span><Globe2 size={15}/><b>Scrape a source</b></span></div><p>Fetch a public HTTPS page and save its Markdown so Build, Plan and Chat can use it as project context.</p><label className="settings-field">Website URL<input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://example.com/article"/></label><div className="crawl-row"><Button variant="editorActive" size="sm" disabled={busy || !url.trim() || !keySaved} onClick={() => void scrape()}>{busy ? "Working…" : "Scrape and save"}</Button></div>{lastResult && <p role="status" className="mt-3 text-xs text-emerald-700">{lastResult}</p>}</section></div>{error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}<section className="mt-5"><h3 className="mb-3 text-sm font-semibold text-zinc-900">Saved project sources</h3>{sources.length ? <div className="space-y-2">{sources.map(source => <article className="rounded-xl border border-zinc-200 bg-white p-3" key={source.id}><b className="text-sm">{source.title}</b><p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-500">{source.content}</p><small className="mt-2 block text-[11px] text-zinc-400">{new Date(source.created_at).toLocaleString()}</small></article>)}</div> : <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500">No sources saved to this project yet.</p>}</section></div>;
}

function GitHubConnectorSurface({ projectId }: { projectId: string }) {
  const { session, request, invoke } = useBackend();
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [autoPush, setAutoPush] = useState(true);
  const [account, setAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [connections, secrets] = await Promise.all([
          request<Array<{ repository_owner: string; repository_name: string; default_branch: string; account_label: string; auto_push_enabled: boolean }>>("github_integrations?select=repository_owner,repository_name,default_branch,account_label,auto_push_enabled&project_id=eq." + projectId),
          request<Array<{ vault_secret_id: string }>>("project_secrets?select=vault_secret_id&project_id=eq." + projectId + "&secret_key=eq.GITHUB_TOKEN"),
        ]);
        if (cancelled) return;
        if (connections[0]) {
          setOwner(connections[0].repository_owner); setRepo(connections[0].repository_name);
          setBranch(connections[0].default_branch); setAccount(connections[0].account_label);
          setAutoPush(connections[0].auto_push_enabled); setStatus("Repository connected");
        }
        setKeySaved(secrets.length > 0);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load GitHub settings.");
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [projectId, request]);

  async function saveConnection() {
    if (!owner.trim() || !repo.trim() || busy || !session) return;
    setBusy(true); setError(null); setStatus("");
    try {
      if (token.trim()) {
        await request("rpc/store_project_secret", { method: "POST", body: JSON.stringify({ p_project_id: projectId, p_secret_key: "GITHUB_TOKEN", p_secret_value: token.trim() }) });
        setToken(""); setKeySaved(true);
      }
      if (!keySaved && !token.trim()) throw new Error("Paste a GitHub token with repository Contents read/write access.");
      const verified = await invoke<{ success: boolean; account: string; repository: string; defaultBranch: string }>("figurable-github", { projectId, owner: owner.trim(), repo: repo.trim(), branch: branch.trim() });
      const secrets = await request<Array<{ vault_secret_id: string }>>("project_secrets?select=vault_secret_id&project_id=eq." + projectId + "&secret_key=eq.GITHUB_TOKEN");
      if (!secrets[0]) throw new Error("The encrypted GitHub token reference could not be found.");
      await request("github_integrations?on_conflict=project_id", {
        method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ project_id: projectId, account_label: verified.account, repository_owner: owner.trim(), repository_name: repo.trim(), default_branch: verified.defaultBranch || branch.trim() || "main", token_secret_id: secrets[0].vault_secret_id, auto_push_enabled: autoPush, created_by: session.user.id, updated_at: new Date().toISOString(), last_tested_at: new Date().toISOString(), last_sync_status: "Connection verified" }),
      });
      await request("projects?id=eq." + projectId, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ github_repo: owner.trim() + "/" + repo.trim(), github_branch: verified.defaultBranch || branch.trim() || "main", updated_at: new Date().toISOString() }) });
      setAccount(verified.account); setBranch(verified.defaultBranch || branch); setStatus("Connected to " + verified.repository);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "GitHub connection failed.");
    } finally { setBusy(false); }
  }

  async function disconnect() {
    setBusy(true); setError(null);
    try {
      await request("github_integrations?project_id=eq." + projectId, { method: "DELETE", headers: { Prefer: "return=minimal" } });
      await request("project_secrets?project_id=eq." + projectId + "&secret_key=eq.GITHUB_TOKEN", { method: "DELETE", headers: { Prefer: "return=minimal" } });
      await request("projects?id=eq." + projectId, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ github_repo: null, updated_at: new Date().toISOString() }) });
      setKeySaved(false); setStatus("GitHub disconnected"); setAccount("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not disconnect GitHub."); }
    finally { setBusy(false); }
  }

  async function saveAutoPush(value: boolean) {
    setAutoPush(value);
    try {
      await request("github_integrations?project_id=eq." + projectId, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ auto_push_enabled: value, updated_at: new Date().toISOString() }) });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update auto-push."); }
  }

  return <div className="expanded-page"><div className="connector-hero"><span className="connector-icon"><GitBranch size={22}/></span><div><h3>GitHub</h3><p>Connect this project to a repository and optionally push each successful Build.</p></div><Button variant="outline" size="sm" disabled={busy || !status.startsWith("Connected")} onClick={() => void disconnect()}>Disconnect</Button></div><div className="setup-form"><label className="settings-field">Repository owner<input value={owner} onChange={event => setOwner(event.target.value)} placeholder="username or organisation"/></label><label className="settings-field">Repository name<input value={repo} onChange={event => setRepo(event.target.value)} placeholder="repository-name"/></label><label className="settings-field">Branch<input value={branch} onChange={event => setBranch(event.target.value)} placeholder="main"/></label><label className="settings-field">Personal access token<input type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} placeholder={keySaved ? "Saved in encrypted Vault · enter to rotate" : "Paste token with Contents read/write permission"}/></label></div><div className="local-notice">The token is encrypted in Supabase Vault. It is never returned to the browser after saving.</div><label className="mt-4 flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm"><input type="checkbox" checked={autoPush} onChange={event => void saveAutoPush(event.target.checked)} disabled={!status.startsWith("Connected")}/><span><b>Push successful Build changes automatically</b><small className="mt-1 block text-xs leading-5 text-zinc-500">Figurable commits generated files to the selected branch. Review repository permissions before enabling this.</small></span></label><div className="context-actions"><Button variant="editorActive" size="sm" disabled={busy || !owner.trim() || !repo.trim()} onClick={() => void saveConnection()}>{busy ? "Connecting…" : "Save and test connection"}</Button><span role="status" className={status.startsWith("Connected") ? "status-good" : "status-muted"}>{status || (keySaved ? "Token saved · repository not verified" : "Not connected")}</span></div>{account && <p className="mt-3 text-xs text-zinc-500">Authenticated GitHub account: {account}</p>}{error && <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}</div>;
}

function ConnectorsSurface({ projectId }: { projectId: string }) {
  const [tab, setTab] = useState("GitHub");
  return <div className="connectors-layout"><div className="feature-tabs">{["GitHub", "Firecrawl", "Supabase"].map(item => <Button variant={tab === item ? "editorActive" : "ghost"} size="sm" key={item} onClick={() => setTab(item)}>{item}</Button>)}</div>{tab === "GitHub" ? <GitHubConnectorSurface projectId={projectId}/> : tab === "Firecrawl" ? <FirecrawlSurface projectId={projectId}/> : <SupabaseSetup projectId={projectId}/>}</div>;
}

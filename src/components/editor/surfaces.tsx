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
  { label: "Analytics", value: "analytics", icon: BarChart3 }, { label: "Cloud", value: "cloud", icon: Cloud },
  { label: "AI", value: "ai", icon: Sparkles }, { label: "Agent integrations", value: "agents", icon: Sparkles },
  { label: "Payments", value: "payments", icon: CreditCard }, { label: "Connectors", value: "connectors", icon: GitBranch },
  { label: "Security", value: "security", icon: ShieldCheck }, { label: "SEO & AI search", value: "seo", icon: Search },
  { label: "Settings", value: "settings", icon: Settings },
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
  return <div className="more-surface"><aside className="more-sidebar">{moreNav.map(({ label, value, icon: Icon }) => <Button key={value} aria-label={label} title={label} variant={safeSurface === value ? "editorActive" : "ghost"} size="sm" onClick={() => onSelectSurface(value)}><Icon size={14}/><span>{label}</span></Button>)}</aside><section className="more-content"><SurfaceTitle title={safeSurface === "settings" ? "Project settings" : moreNav.find((item) => item.value === safeSurface)?.label ?? "More"} onBack={onBack}/>{safeSurface === "settings" ? <SettingsSurface enabledSkills={enabledSkills} setEnabledSkills={setEnabledSkills}/> : safeSurface === "cloud" ? <CloudResources/> : safeSurface === "analytics" ? <AnalyticsExpanded/> : safeSurface === "security" ? <SecurityAudit/> : safeSurface === "payments" ? <PaymentsSurface/> : safeSurface === "agents" ? <AgentIntegrationsSurface/> : <FeatureSurface surface={safeSurface} projectId={projectId}/>}</section></div>;
}

function SettingsSurface({ enabledSkills, setEnabledSkills }: { enabledSkills: string[]; setEnabledSkills: (items: string[]) => void }) {
  const [tab, setTab] = useState("General");
  const [monitoring, setMonitoring] = useState(true);
  const [livePreview, setLivePreview] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState("Synced 4 minutes ago");
  const syncGit = () => { setSyncing(true); window.setTimeout(() => { setSyncing(false); setLastSync("Synced just now"); }, 650); };
  return <div className="settings-layout"><nav>{["General","Knowledge","Domains","Git","Skills"].map((item) => <Button key={item} variant={tab === item ? "editorActive" : "ghost"} size="sm" onClick={() => setTab(item)}>{item}</Button>)}</nav><div className="settings-scroll">{tab === "Skills" && <SkillsManager enabled={enabledSkills} onChange={setEnabledSkills}/>} {tab === "General" && <><div className="project-identity"><span className="project-symbol">O</span><div><h3>Orbit Finance</h3><p>Owned by Joshua's workspace · Created Sep 5, 2026</p></div></div><SettingsSection title="Project details"><DataRow label="Project name" value="Orbit Finance" action="Edit"/><DataRow label="URL subdomain" value="orbit-finance"/><DataRow label="Owner" value="Joshua Omoniyi"/><DataRow label="Messages count" value="10"/><DataRow label="AI edits count" value="6"/></SettingsSection><SettingsSection title="Project monitoring"><ToggleRow label="Project monitoring" detail="Regularly checks your project for issues and improvements." value={monitoring} setValue={setMonitoring}/></SettingsSection><SettingsSection title="Preview"><ToggleRow label="Live preview" detail="Show changes while Figurable is building." value={livePreview} setValue={setLivePreview}/></SettingsSection><SettingsSection title="Publishing"><DataRow label="Project category" value="Finance" action="Change"/><ToggleRow label="Visitor analytics" detail="Measure visits to the published app." value={true} setValue={() => undefined}/></SettingsSection></>}{tab === "Knowledge" && <SettingsSection title="Project knowledge"><label className="settings-field">Instructions<textarea defaultValue="Keep the interface calm, clear, and accessible."/></label><Button variant="editorActive" size="sm"><Plus size={13}/> Add knowledge</Button></SettingsSection>}{tab === "Domains" && <SettingsSection title="Domains"><p className="section-description">Connect a custom domain to your published project.</p><label className="settings-field">Domain<input placeholder="app.example.com"/></label><Button variant="editorActive" size="sm">Connect domain</Button></SettingsSection>}{tab === "Git" && <><SettingsSection title="Git"><div className="git-card"><div><Code2 size={17}/><span><b>GitHub repository</b><small>Theyoungtimesmedia/project-hub · main</small></span></div><span className="connection-state"><CheckCircle2 size={13}/> Connected</span></div><div className="git-details"><div><GitBranch size={14}/><span><b>main</b><small>Default branch · Protected</small></span><Button variant="outline" size="sm">Change</Button></div><div><Activity size={14}/><span><b>{lastSync}</b><small>Latest project changes are mirrored automatically.</small></span><Button variant="editorActive" size="sm" onClick={syncGit}>{syncing ? "Syncing…" : "Sync now"}</Button></div></div></SettingsSection><SettingsSection title="Repository actions"><div className="git-actions"><Button variant="outline" size="sm"><ExternalLink size={13}/> Open on GitHub</Button><Button variant="outline" size="sm"><GitBranch size={13}/> Create branch</Button></div></SettingsSection></>}</div></div>;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="settings-section"><h3>{title}</h3><div>{children}</div></section>; }
function DataRow({ label, value, action }: { label: string; value: string; action?: string }) { return <div className="data-row"><span>{label}</span><b>{value}</b>{action ? <Button variant="outline" size="sm">{action}</Button> : <span/>}</div>; }
function ToggleRow({ label, detail, value, setValue }: { label: string; detail: string; value: boolean; setValue: (value: boolean) => void }) { return <div className="toggle-row"><div><b>{label}</b><p>{detail}</p></div><Button variant={value ? "editorActive" : "outline"} size="icon-sm" className={`editor-switch ${value ? "on" : ""}`} onClick={() => setValue(!value)} aria-label={`Toggle ${label}`}><i/></Button></div>; }

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

function ConnectorsSurface({ projectId }: { projectId: string }) { const [tab, setTab] = useState("Firecrawl"); return <div className="connectors-layout"><div className="feature-tabs">{["Firecrawl", "Supabase"].map(item => <Button variant={tab === item ? "editorActive" : "ghost"} size="sm" key={item} onClick={() => setTab(item)}>{item}</Button>)}</div>{tab === "Firecrawl" ? <FirecrawlSurface projectId={projectId}/> : <SupabaseSetup projectId={projectId}/>}</div>; }

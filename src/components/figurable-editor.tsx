import { useState, type SVGProps } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft, ArrowUp, AudioLines, Check, ChevronDown, Code2, Copy,
  Download, ExternalLink, Eye, FileCode2, FileText, Github, Image as ImageIcon,
  Layers3, Loader2, MessageSquare, Monitor, MoreHorizontal, MousePointer2,
  PanelLeft, Paperclip, Plus, RefreshCw, Search, Send, Share2, Sparkles,
  Tablet, Upload, Video, WandSparkles, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "Build" | "Plan" | "Ask";
type Device = "desktop" | "tablet" | "mobile";
type Tool = "AI" | "Supabase" | "MCP" | "GitHub" | "Firecrawl";

const pages = ["Home", "About", "Services", "Contact"];
const files = [
  "src/pages/Index.tsx",
  "src/components/Hero.tsx",
  "src/components/Navigation.tsx",
  "src/components/Services.tsx",
  "src/styles/App.css",
  "public/og-image.png",
];

function PlugIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Z" />
      <path d="M12 17v4m-3 0h6" />
    </svg>
  );
}

export function FigurableEditor() {
  const { projectId } = useParams({ from: "/project/$projectId" });
  const projectName = projectId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const [mode, setMode] = useState<Mode>("Build");
  const [device, setDevice] = useState<Device>("desktop");
  const [page, setPage] = useState("Home");
  const [chatOpen, setChatOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [surface, setSurface] = useState<"Preview" | "Code">("Preview");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState("Hero headline");
  const [headline, setHeadline] = useState("Build something worth returning to.");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>("AI");

  const notify = (value: string) => {
    setNotice(value);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const send = () => {
    if (!message.trim() || working) return;
    setWorking(true);
    window.setTimeout(() => {
      setWorking(false);
      setMessage("");
      notify(mode === "Plan" ? "Plan updated — no files changed." : "Change staged in the workspace.");
    }, 800);
  };

  const openPreview = () => {
    const html = `<!doctype html><html><head><title>${projectName}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;background:#080a0d;color:#f5f7fa;font-family:Inter,system-ui}
main{min-height:100vh;display:grid;place-items:center;padding:40px;background:
radial-gradient(circle at 15% 10%,rgba(80,190,255,.16),transparent 35%),
radial-gradient(circle at 80% 80%,rgba(100,255,190,.08),transparent 35%)}
article{max-width:760px;padding:56px;border:1px solid #ffffff18;border-radius:30px;
background:#ffffff0b;backdrop-filter:blur(22px);box-shadow:0 30px 100px #0008}
small{letter-spacing:.18em;color:#91a1b2}h1{font-size:clamp(42px,7vw,80px);line-height:.95}
p{font-size:18px;line-height:1.7;color:#aab6c2}
</style></head><body><main><article>
<small>FIGURABLE PREVIEW</small><h1>${projectName}</h1>
<p>Preview opened outside the workspace. The live runtime will connect during the backend phase.</p>
</article></main></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/project/${projectId}?preview=1`);
      notify("Preview link copied.");
    } catch {
      notify("Preview URL ready to copy from the address bar.");
    }
  };

  const exportManifest = () => {
    const blob = new Blob([
      JSON.stringify({
        name: projectName,
        exportedAt: new Date().toISOString(),
        files,
        note: "Frontend export manifest. Real ZIP generation is a backend/export-service phase."
      }, null, 2)
    ], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectId}-figurable-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Export manifest downloaded.");
  };

  const addAttachment = (label: string) => {
    setAttachments(items => [...items, label]);
    notify(`${label} attached to the next AI turn.`);
  };

  const tools: [Tool, any][] = [
    ["AI", Sparkles], ["Supabase", Layers3], ["MCP", PlugIcon],
    ["GitHub", Github], ["Firecrawl", Search],
  ];

  return (
    <div className="h-screen min-h-[680px] overflow-hidden bg-[#07090c] text-white">
      <div className="flex h-full">
        {chatOpen && (
          <aside className="flex w-[370px] shrink-0 flex-col border-r border-white/[0.08] bg-white/[0.035] backdrop-blur-2xl">
            <div className="flex h-14 items-center gap-2 border-b border-white/[0.07] px-3">
              <Link to="/" className="grid size-9 place-items-center rounded-xl text-white/55 hover:bg-white/[0.07] hover:text-white">
                <ArrowLeft className="size-4" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{projectName}</div>
                <div className="text-[10px] text-white/30">Figurable.dev · private project</div>
              </div>
              <button onClick={() => setChatOpen(false)} className="grid size-8 place-items-center rounded-lg text-white/45 hover:bg-white/[0.07] hover:text-white">
                <PanelLeft className="size-4" />
              </button>
            </div>

            <div className="border-b border-white/[0.07] p-2">
              <div className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
                {(["Build", "Plan", "Ask"] as Mode[]).map(item => (
                  <button key={item} onClick={() => setMode(item)}
                    className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px]",
                      mode === item ? "bg-white/[0.11] text-white" : "text-white/40 hover:text-white/80")}>
                    {item === "Build" ? <Zap className="size-3.5" /> :
                     item === "Plan" ? <FileText className="size-3.5" /> :
                     <MessageSquare className="size-3.5" />}
                    {item}
                  </button>
                ))}
              </div>
              <p className="px-2 pt-2 text-[10px] text-white/30">
                {mode === "Build" ? "Make changes to the project." :
                 mode === "Plan" ? "Reason about changes without modifying files." :
                 "Ask questions without starting a build."}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-5 flex justify-end">
                <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-white/[0.08] bg-white/[0.055] px-3.5 py-2.5 text-[12px] leading-5 text-white/70">
                  Make the homepage feel more polished and fix the hero spacing.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-200">
                  <Sparkles className="size-3.5" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold">Figurable</div>
                  <p className="mt-1 text-[12px] leading-5 text-white/50">
                    Project context is loaded. Select a visible element in the preview for a targeted edit.
                  </p>
                  <div className="mt-3 space-y-1.5 text-[10px] text-white/35">
                    <div className="flex gap-2"><Check className="size-3 text-emerald-300" />Project context loaded</div>
                    <div className="flex gap-2"><Check className="size-3 text-emerald-300" />Preview surface ready</div>
                    <div className="flex gap-2"><Check className="size-3 text-emerald-300" />Frontend-only mode</div>
                  </div>
                </div>
              </div>
              {working && (
                <div className="mt-5 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3">
                  <div className="flex items-center gap-2 text-[11px] text-cyan-100">
                    <Loader2 className="size-3.5 animate-spin" />
                    {mode === "Plan" ? "Reasoning through the change…" : "Working through the project…"}
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-300/50" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.07] p-3">
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {attachments.map((item, i) => (
                    <span key={`${item}-${i}`} className="rounded-lg border border-white/[0.08] bg-white/[0.045] px-2 py-1 text-[10px] text-white/50">
                      <Paperclip className="mr-1 inline size-3" />{item}
                    </span>
                  ))}
                </div>
              )}
              <div className="rounded-2xl border border-white/[0.1] bg-black/20">
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={3} placeholder={mode === "Plan" ? "Describe what you want to plan…" : "Describe a change to make…"}
                  className="w-full resize-none bg-transparent px-3.5 pt-3 text-[12px] leading-5 outline-none placeholder:text-white/25" />
                <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
                  <div className="flex-1 text-[9px] text-white/25">Enter to send · Shift+Enter for newline</div>
                  <button onClick={send} disabled={!message.trim() || working}
                    className="grid size-8 place-items-center rounded-lg bg-white text-black disabled:opacity-20">
                    <ArrowUp className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[
                  ["Image", ImageIcon], ["Video", Video], ["Audio", AudioLines], ["File", FileText]
                ].map(([label, Icon]: any) => (
                  <button key={label} onClick={() => addAttachment(label)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-white/[0.06] py-2 text-[9px] text-white/35 hover:bg-white/[0.05] hover:text-white">
                    <Icon className="size-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-white/[0.025] px-3 backdrop-blur-2xl">
            {!chatOpen && <button onClick={() => setChatOpen(true)} className="grid size-9 place-items-center rounded-lg text-white/45 hover:bg-white/[0.07]"><PanelLeft className="size-4" /></button>}
            <div className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
              {(["Preview", "Code"] as const).map(item => (
                <button key={item} onClick={() => setSurface(item)}
                  className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px]",
                    surface === item ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white")}>
                  {item === "Preview" ? <Eye className="size-3.5" /> : <Code2 className="size-3.5" />}{item}
                </button>
              ))}
            </div>

            {surface === "Preview" && (
              <div className="hidden rounded-xl border border-white/[0.08] bg-black/20 p-1 md:flex">
                {([
                  ["desktop", Monitor], ["tablet", Tablet], ["mobile", Tablet]
                ] as const).map(([item, Icon]) => (
                  <button key={item} onClick={() => setDevice(item)} title={item}
                    className={cn("grid size-7 place-items-center rounded-lg", device === item ? "bg-white/[0.09] text-white" : "text-white/35 hover:text-white")}>
                    <Icon className={cn("size-3.5", item === "mobile" && "rotate-90")} />
                  </button>
                ))}
              </div>
            )}

            <select value={page} onChange={e => setPage(e.target.value)}
              className="hidden max-w-[120px] bg-transparent text-[11px] text-white/45 outline-none md:block">
              {pages.map(item => <option key={item} className="bg-[#0d1117]">{item}</option>)}
            </select>

            <div className="flex-1" />
            <button onClick={openPreview} className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[10px] text-white/45 hover:bg-white/[0.06] hover:text-white sm:flex">
              <ExternalLink className="size-3.5" />Open preview
            </button>
            <button onClick={share} className="grid size-8 place-items-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white"><Share2 className="size-3.5" /></button>
            <button onClick={exportManifest} className="grid size-8 place-items-center rounded-lg text-white/40 hover:bg-white/[0.06] hover:text-white"><Download className="size-3.5" /></button>
            <button onClick={() => notify("Publish is a backend-phase action")} className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-semibold text-black">Publish</button>
            <MoreHorizontal className="size-4 text-white/30" />
          </header>

          <div className="flex min-h-0 flex-1">
            <section className="relative min-w-0 flex-1 overflow-hidden bg-[#090c10]">
              {surface === "Preview" ? (
                <>
                  <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
                    <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,.65)]" />
                    <span className="text-[10px] text-white/35">Preview synced</span>
                    <span className="text-white/15">·</span>
                    <span className="text-[10px] text-white/25">/{page.toLowerCase()}</span>
                    <div className="flex-1" />
                    <button onClick={() => notify("Preview refreshed")} className="grid size-7 place-items-center rounded-lg text-white/35 hover:bg-white/[0.06]"><RefreshCw className="size-3.5" /></button>
                  </div>

                  <div className="flex h-[calc(100%-40px)] items-center justify-center overflow-auto p-4 md:p-8"
                    style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px)", backgroundSize: "18px 18px" }}>
                    <div className={cn(
                      "relative overflow-hidden rounded-2xl border border-white/[0.1] bg-white shadow-[0_30px_100px_rgba(0,0,0,.4)] transition-all",
                      device === "desktop" ? "h-[min(76vh,760px)] w-full max-w-[1120px]" :
                      device === "tablet" ? "h-[min(78vh,820px)] w-[min(768px,88%)]" :
                      "h-[min(78vh,760px)] w-[min(390px,88%)]"
                    )}>
                      <div className="h-full overflow-auto bg-[#f8fafc] text-slate-950">
                        <div className="sticky top-0 z-10 flex h-9 items-center gap-1 border-b border-slate-200 bg-white/85 px-3 backdrop-blur">
                          <span className="size-2 rounded-full bg-slate-300" /><span className="size-2 rounded-full bg-slate-300" /><span className="size-2 rounded-full bg-slate-300" />
                          <div className="ml-3 flex-1 rounded-md bg-slate-100 px-3 py-1 text-center text-[9px] text-slate-400">{projectName.toLowerCase().replace(/\s+/g, "-")}.local/{page.toLowerCase()}</div>
                        </div>
                        <nav className="flex items-center justify-between px-6 py-5 md:px-10">
                          <strong className="text-sm">{projectName}</strong>
                          <div className="hidden gap-5 text-[10px] text-slate-500 sm:flex">{pages.map(p => <span key={p}>{p}</span>)}</div>
                          <button className="rounded-full bg-slate-950 px-3 py-1.5 text-[9px] text-white">Get started</button>
                        </nav>
                        <div className="grid gap-8 px-6 pb-16 pt-12 md:grid-cols-[1.25fr_.75fr] md:px-12 md:pt-20">
                          <div>
                            <span className="text-[9px] font-semibold uppercase tracking-[.2em] text-slate-400">FIGURABLE PREVIEW · {page.toUpperCase()}</span>
                            <div onClick={() => setSelected("Hero headline")}
                              className={cn("mt-4 cursor-pointer rounded-xl p-1", selected === "Hero headline" ? "ring-2 ring-sky-400 ring-offset-4 ring-offset-[#f8fafc]" : "hover:ring-1 hover:ring-sky-300")}>
                              <h1 className="max-w-[700px] text-[clamp(42px,7vw,82px)] font-semibold leading-[.94] tracking-[-.055em]">{headline}</h1>
                            </div>
                            <p onClick={() => setSelected("Hero copy")}
                              className={cn("mt-5 cursor-pointer rounded-xl p-1 text-[15px] leading-7 text-slate-500", selected === "Hero copy" ? "ring-2 ring-sky-400 ring-offset-4 ring-offset-[#f8fafc]" : "hover:ring-1 hover:ring-sky-300")}>
                              A focused digital experience with enough structure to stay useful and enough space to breathe.
                            </p>
                            <button className="mt-7 rounded-full bg-slate-950 px-5 py-3 text-[11px] text-white">Explore the work</button>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
                            <span className="text-[9px] uppercase tracking-[.18em] text-slate-400">Project context</span>
                            {["Clear hierarchy", "Responsive by default", "Reusable components"].map((item, i) => (
                              <div key={item} className="mt-5"><div className="text-[12px] font-semibold">{String(i+1).padStart(2,"0")} · {item}</div><p className="mt-1 text-[11px] leading-5 text-slate-400">Selected project surface placeholder.</p></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <CodePanel />
              )}
            </section>

            {inspectorOpen && surface === "Preview" && (
              <aside className="hidden w-[290px] shrink-0 border-l border-white/[0.07] bg-white/[0.025] p-3 lg:block">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold"><MousePointer2 className="size-3.5 text-sky-300" />Visual editor</div>
                  <button onClick={() => setInspectorOpen(false)} className="grid size-7 place-items-center rounded-lg text-white/35 hover:bg-white/[0.06]"><X className="size-3.5" /></button>
                </div>

                <div className="mt-3 rounded-xl border border-sky-300/15 bg-sky-300/[0.04] p-3">
                  <div className="text-[10px] text-sky-200">Select mode active</div>
                  <p className="mt-1 text-[9px] leading-4 text-white/35">Select an element in the preview and edit that specific surface.</p>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <div className="text-[9px] uppercase tracking-[.15em] text-white/30">Selected element</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px]"><Layers3 className="size-3.5 text-white/40" />{selected}</div>
                  {selected === "Hero headline" && (
                    <textarea value={headline} onChange={e => setHeadline(e.target.value)}
                      className="mt-3 min-h-24 w-full resize-none rounded-lg border border-white/[0.07] bg-white/[0.03] p-2.5 text-[11px] leading-5 outline-none focus:border-sky-300/30" />
                  )}
                  <div className="mt-2 flex gap-1.5">
                    <button onClick={() => notify("Targeted edit staged for AI")} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2 py-2 text-[10px] font-medium text-black">
                      <WandSparkles className="size-3" />Apply
                    </button>
                    <button onClick={() => setSelected("")} className="grid size-8 place-items-center rounded-lg border border-white/[0.08] text-white/40"><X className="size-3.5" /></button>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <div className="mb-2 text-[9px] uppercase tracking-[.15em] text-white/30">Editing tools</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      ["Select", MousePointer2], ["Annotate", PencilIcon],
                      ["Edit", WandSparkles], ["Inspect", Code2]
                    ].map(([label, Icon]: any) => (
                      <button key={label} onClick={() => notify(`${label} tool selected`)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-2 py-2 text-[9px] text-white/45 hover:bg-white/[0.05] hover:text-white">
                        <Icon className="size-3" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/15 p-3">
                  <div className="mb-2 text-[9px] uppercase tracking-[.15em] text-white/30">Active context</div>
                  {tools.map(([tool, Icon]: any) => (
                    <button key={tool} onClick={() => setActiveTool(tool)}
                      className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px]",
                        activeTool === tool ? "bg-white/[0.07] text-white" : "text-white/35 hover:bg-white/[0.04]")}>
                      <Icon className="size-3.5" /><span className="flex-1 text-left">{tool}</span>
                      {activeTool === tool && <span className="size-1.5 rounded-full bg-emerald-300" />}
                    </button>
                  ))}
                </div>
              </aside>
            )}
          </div>

          <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-white/[0.06] px-3 text-[9px] text-white/30">
            <span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-300" />Frontend workspace ready</span>
            <span>·</span><span>Figurable.dev</span><div className="flex-1" />
            <span>Context preserved</span><span>⌘K Search</span>
          </footer>
        </main>
      </div>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/[0.1] bg-[#11161d]/95 px-3.5 py-2.5 text-[11px] shadow-2xl backdrop-blur-xl">
          <Check className="size-3.5 text-emerald-300" />{notice}
        </div>
      )}
    </div>
  );
}

function CodePanel() {
  return (
    <div className="flex h-full flex-col bg-[#0a0d11]">
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.07] px-3 text-[10px]">
        <FileCode2 className="size-3.5 text-cyan-300" /><span className="text-white/60">src/pages/Index.tsx</span>
        <div className="flex-1" /><span className="text-white/25">Frontend editor</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr]">
        <aside className="border-r border-white/[0.06] p-2">
          <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1.5 text-[9px] text-white/25"><Search className="size-3" />Search files</div>
          {files.map(file => <button key={file} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[9px] text-white/40 hover:bg-white/[0.04] hover:text-white"><FileCode2 className="size-3.5" />{file}</button>)}
        </aside>
        <pre className="overflow-auto p-5 text-[11px] leading-6 text-white/60"><code><span className="text-white/20">// Figurable project source</span>{"\n"}<span className="text-cyan-300">export default function</span> <span className="text-white">Home</span>() {"{"}{"\n"}  <span className="text-cyan-300">return</span> (&lt;<span className="text-sky-300">main</span> className=<span className="text-amber-200">"liquid-page"</span>&gt;{"\n"}    &lt;<span className="text-sky-300">Hero</span> /&gt;{"\n"}    &lt;<span className="text-sky-300">ProjectContext</span> /&gt;{"\n"}  &lt;/<span className="text-sky-300">main</span>&gt;);{"\n"}{"}"}</code></pre>
      </div>
    </div>
  );
}

function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}><path d="m4 20 4.2-1 10.5-10.5a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z"/><path d="m13.9 6.1 4 4"/></svg>;
}

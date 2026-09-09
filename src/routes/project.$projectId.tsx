import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  FileCode2,
  Files,
  Globe2,
  History,
  MessageSquare,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Rocket,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Surface = "Preview" | "Code" | "Files" | "History" | "Analytics";
type Mode = "Build" | "Plan" | "Ask";

const files = [
  "src/pages/Index.tsx",
  "src/components/Hero.tsx",
  "src/components/Navigation.tsx",
  "src/styles/App.css",
  "public/og-image.png",
];

export const Route = createFileRoute("/project/$projectId")({
  head: () => ({
    meta: [
      { title: "Project editor — Joshua's workspace" },
      { name: "description", content: "A focused project editor with conversation, preview, code, and workspace tools." },
      { property: "og:title", content: "Project editor — Joshua's workspace" },
      { property: "og:description", content: "A focused project editor with conversation, preview, code, and workspace tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectWorkspace,
});

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const projectName = projectId.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const [surface, setSurface] = useState<Surface>("Preview");
  const [mode, setMode] = useState<Mode>("Build");
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(files[0]);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  const notify = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setWorking(true);
    window.setTimeout(() => {
      setWorking(false);
      setMessage("");
      notify("Change applied to workspace");
    }, 900);
  };

  return (
    <div className="editor-screen">
      <aside className={`editor-chat ${chatOpen ? "" : "editor-chat-hidden"}`}>
        <div className="editor-chat-top">
          <Link to="/" className="editor-icon-button" aria-label="Back to dashboard">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="editor-project">
            <strong>{projectName}</strong>
            <span>Joshua's workspace</span>
          </div>
          <button className="editor-icon-button" aria-label="Collapse conversation" onClick={() => setChatOpen(false)}>
            <PanelLeft className="size-4" />
          </button>
        </div>
        <div className="editor-mode-tabs" role="tablist" aria-label="Editor mode">
          {(["Build", "Plan", "Ask"] as Mode[]).map((item) => (
            <button key={item} className={mode === item ? "is-active" : ""} onClick={() => setMode(item)} role="tab" aria-selected={mode === item}>
              {item === "Build" ? <Zap /> : item === "Plan" ? <Files /> : <MessageSquare />}
              {item}
            </button>
          ))}
        </div>
        <div className="editor-chat-scroll">
          <div className="editor-user-prompt">Continue shaping {projectName} with a calm, polished interface.</div>
          <div className="editor-assistant-message">
            <span className="editor-assistant-icon"><Sparkles /></span>
            <div>
              <strong>{mode === "Plan" ? "Plan prepared." : mode === "Ask" ? "Here is what I found." : "Workspace ready."}</strong>
              <p>{mode === "Plan" ? "The next steps are mapped and ready for your review." : "Your project surface is ready. Continue iterating or inspect the generated files."}</p>
              <div className="editor-status-line"><Check />Structure mapped</div>
              <div className="editor-status-line"><Check />Liquid glass system applied</div>
            </div>
          </div>
          {working && <div className="editor-generation-status"><span className="editor-spinner" />Applying your change<span className="editor-pulse" /><span className="editor-pulse" /><span className="editor-pulse" /></div>}
        </div>
        <div className="editor-composer">
          <textarea aria-label="Workspace message" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Ask about your project..." rows={3} />
          <div className="editor-composer-actions">
            <button className="editor-round-button" aria-label="Add context"><Plus /></button>
            <span className="editor-private-label">Private project</span>
            <span className="editor-spacer" />
            <button className="editor-send-button" aria-label="Send message" onClick={sendMessage}><Send /></button>
          </div>
        </div>
      </aside>

      <main className="editor-main">
        <header className="editor-toolbar">
          {!chatOpen && <button className="editor-reopen-chat" aria-label="Open conversation" onClick={() => setChatOpen(true)}><PanelLeft /></button>}
          <div className="editor-surface-tabs" role="tablist" aria-label="Project surfaces">
            {(["Preview", "Code", "Files", "History", "Analytics"] as Surface[]).map((item) => {
              const Icon = item === "Preview" ? Globe2 : item === "Code" ? Code2 : item === "Files" ? Files : item === "History" ? History : BarChart3;
              return <button key={item} className={surface === item ? "is-active" : ""} onClick={() => setSurface(item)} role="tab" aria-selected={surface === item}><Icon />{item}</button>;
            })}
          </div>
          <div className="editor-toolbar-actions">
            <Button variant="outline" size="sm" onClick={() => notify("Share link copied")}><Share2 />Share</Button>
            <Button size="sm" onClick={() => notify("Preview is ready to publish")}><Rocket />Publish</Button>
            <button className="editor-toolbar-more" aria-label="More project actions" onClick={() => notify("More project actions opened")}><MoreHorizontal /></button>
          </div>
        </header>
        <div className="editor-content">
          {surface === "Preview" && <PreviewSurface projectName={projectName} />}
          {surface === "Code" && <CodeSurface file={selectedFile} />}
          {surface === "Files" && <FilesSurface selectedFile={selectedFile} setSelectedFile={setSelectedFile} />}
          {surface === "History" && <HistorySurface />}
          {surface === "Analytics" && <AnalyticsSurface onNotify={notify} />}
        </div>
      </main>
      {notice && <div className="editor-toast" role="status"><Check />{notice}</div>}
    </div>
  );
}

function PreviewSurface({ projectName }: { projectName: string }) {
  return <div className="editor-preview-frame"><div className="editor-browser-chrome"><span /><span /><span /><div>preview.{projectName.toLowerCase().replace(/\s+/g, "-")}.local</div><Globe2 /></div><div className="editor-site-preview"><nav><strong>{projectName.toUpperCase()}</strong><span>Home</span><span>Work</span><span>About</span><span>Journal</span><Button size="sm">Contact</Button></nav><section className="editor-site-hero"><div><span className="editor-site-eyebrow">A CLEARER WAY FORWARD</span><h1>Build something<br /><em>worth returning to.</em></h1><p>A thoughtful digital space for ideas, products, and the people they serve.</p><Button size="lg">Explore the work <ArrowLeft /></Button></div><aside><span>PROJECT NOTE</span><strong>01&nbsp;&nbsp; Clarity over noise</strong><p>Every surface has a job. Every detail earns its place.</p><strong>02&nbsp;&nbsp; Built to last</strong><p>A calm foundation for the next iteration.</p></aside></section></div></div>;
}

function CodeSurface({ file }: { file: string }) {
  return <div className="editor-surface-panel editor-code-panel"><header><div><FileCode2 /><strong>{file}</strong></div><span><ShieldCheck />Read only</span></header><pre><code><span className="editor-code-comment">// generated workspace surface</span>{"\n\n"}<span className="editor-code-keyword">export default function</span> <span className="editor-code-name">Workspace</span>() {" {"}{"\n"}  <span className="editor-code-keyword">return</span> ({"\n"}    &lt;<span className="editor-code-name">main</span> className=<span className="editor-code-string">"liquid-workspace"</span>&gt;{"\n"}      &lt;<span className="editor-code-name">Hero</span> /&gt;{"\n"}      &lt;<span className="editor-code-name">ProjectGrid</span> /&gt;{"\n"}    &lt;/<span className="editor-code-name">main</span>&gt;{"\n"}  ){"\n"}{"}"}</code></pre></div>;
}

function FilesSurface({ selectedFile, setSelectedFile }: { selectedFile: string; setSelectedFile: (file: string) => void }) {
  return <div className="editor-surface-panel editor-files-panel"><aside><div className="editor-file-search"><Files /><input aria-label="Search files" placeholder="Search files" /></div>{files.map((file) => <button key={file} className={selectedFile === file ? "is-active" : ""} onClick={() => setSelectedFile(file)}><FileCode2 />{file}</button>)}<button className="editor-upload-file"><Upload />Upload file</button></aside><section><Files /><strong>{selectedFile}</strong><span>Generated source and assets are ready to inspect.</span></section></div>;
}

function HistorySurface() {
  const history = ["Added class-journey guidance", "Updated offer card image frame", "Polished campaign page visuals", "Updated navigation and hero", "Applied liquid glass system"];
  return <div className="editor-surface-panel editor-history-panel"><header><div><span className="editor-panel-eyebrow">PROJECT TIMELINE</span><h2>History</h2></div><Button variant="outline" size="sm"><Upload />Export</Button></header>{history.map((entry, index) => <button className="editor-history-entry" key={entry}><span>0{index + 1}</span><div><strong>{entry}</strong><small>{index === 0 ? "Today, 8:34 AM" : `Sep ${6 - index}, 2:12 PM`}</small></div><ArrowLeft /></button>)}</div>;
}

function AnalyticsSurface({ onNotify }: { onNotify: (message: string) => void }) {
  return <div className="editor-surface-panel editor-analytics-panel"><header><div><span className="editor-panel-eyebrow">PROJECT INSIGHTS</span><h2>Analytics</h2></div><Button variant="outline" size="sm" onClick={() => onNotify("Range menu opened")}>Last 7 days <ChevronDown /></Button></header><div className="editor-metric-row">{[["Visitors", "0"], ["Page views", "0"], ["Views per visit", "0"], ["Visit duration", "0s"], ["Bounce rate", "0%"]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="editor-analytics-empty"><BarChart3 /><strong>Publish your app to start tracking visitors</strong><span>Share your live URL to see traffic here.</span><Button onClick={() => onNotify("Preview is ready to publish")}><Rocket />Publish</Button></div></div>;
}
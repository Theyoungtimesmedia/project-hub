import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, MoreHorizontal, Play, Settings, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/project/$projectId")({
  head: () => ({
    meta: [
      { title: "Project workspace — Joshua's workspace" },
      { name: "description", content: "A local project workspace preview." },
      { property: "og:title", content: "Project workspace — Joshua's workspace" },
      { property: "og:description", content: "A local project workspace preview." },
    ],
  }),
  component: ProjectWorkspace,
});

function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const projectName = projectId.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  return <div className="project-workspace-page"><header className="project-workspace-topbar"><Link to="/" className="project-back-link"><ArrowLeft className="size-4" />Back to dashboard</Link><div className="project-breadcrumb"><span className="project-breadcrumb-dot" />{projectName}</div><div className="project-workspace-actions"><Button variant="outline" size="sm"><Share2 />Share</Button><Button variant="outline" size="sm"><Settings />Settings</Button><Button size="sm"><Play />Preview</Button><Button variant="ghost" size="icon" aria-label="More project actions"><MoreHorizontal /></Button></div></header><main className="project-workspace-body"><div className="project-workspace-intro"><div className="project-workspace-kicker"><Sparkles className="size-4" />Local project workspace</div><h1>{projectName}</h1><p>This frontend-only workspace is ready for the next phase. Real generation and connections are intentionally disabled.</p><div className="project-workspace-cta"><Button><Play />Open preview</Button><Button variant="outline"><ExternalLink />View project settings</Button></div></div><div className="project-workspace-canvas"><div className="canvas-toolbar"><span className="canvas-dot canvas-dot-red" /><span className="canvas-dot canvas-dot-yellow" /><span className="canvas-dot canvas-dot-green" /><span className="canvas-toolbar-label">Preview canvas</span></div><div className="canvas-placeholder"><Sparkles className="size-6" /><p>Your project preview will live here</p><span>Describe the next change from the dashboard to continue.</span></div></div></main></div>;
}
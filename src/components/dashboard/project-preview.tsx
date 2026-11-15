import { FileCode2, Globe2 } from "lucide-react";

export function ProjectPreview({ name, description, live }: { name: string; description: string; live: boolean }) {
  return (
    <div className="mini-page mini-blue">
      <div className="mini-nav">
        <span className="mini-logo">{name.trim().slice(0, 24) || "Untitled project"}</span>
        <span className="flex items-center gap-1.5 text-[9px]">{live ? <Globe2 size={10}/> : <FileCode2 size={10}/>} {live ? "Published URL" : "Workspace"}</span>
      </div>
      <div className="mini-notes">
        <small>{live ? "PUBLISHED PROJECT" : "PROJECT WORKSPACE"}</small>
        <b>{name || "Untitled project"}</b>
        <p>{description || "No project description has been added yet."}</p>
      </div>
    </div>
  );
}

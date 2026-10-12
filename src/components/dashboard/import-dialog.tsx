import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, GitBranch, KeyRound, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackend } from "@/lib/backend";

export function ImportDialog({ open, onOpenChange, workspaceId }: { open: boolean; onOpenChange: (open: boolean) => void; workspaceId: string | null }) {
  const { session, request, invoke } = useBackend();
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");
  const [projectName, setProjectName] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function importRepository() {
    if (!session || !workspaceId) throw new Error("Wait for your workspace to finish loading, then try again.");
    let parsed: URL;
    try { parsed = new URL(repoUrl.trim()); } catch { throw new Error("Enter a valid GitHub repository URL."); }
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") throw new Error("Use an HTTPS URL from github.com.");
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) throw new Error("The URL must contain an owner and repository name.");
    const owner = parts[0];
    const repo = parts[1].replace(/\\.git$/i, "");
    if (!token.trim()) throw new Error("A GitHub token is required to read this repository.");
    const name = projectName.trim() || repo.replace(/[-_]+/g, " ").replace(/\\b\\w/g, char => char.toUpperCase());
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
    const rows = await request<Array<{ id: string }>>("projects?select=id", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ workspace_id: workspaceId, name, slug: slug + "-" + crypto.randomUUID().slice(0, 8), description: "Imported from GitHub: " + owner + "/" + repo, created_by: session.user.id }),
    });
    const projectId = rows[0]?.id;
    if (!projectId) throw new Error("Supabase did not return the new project.");
    setProgress("Saving the GitHub token in encrypted storage…");
    await request("rpc/store_project_secret", { method: "POST", body: JSON.stringify({ p_project_id: projectId, p_secret_key: "GITHUB_TOKEN", p_secret_value: token.trim() }) });
    setProgress("Checking repository access…");
    const connected = await invoke<{ account: string; repository: string; defaultBranch: string }>("figurable-github", { projectId, owner, repo, branch: branch.trim() || "main", action: "connect" });
    await request("github_integrations?on_conflict=project_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ project_id: projectId, account_label: connected.account, repository_owner: owner, repository_name: repo, default_branch: connected.defaultBranch || branch.trim() || "main", auto_push_enabled: false, created_by: session.user.id, updated_at: new Date().toISOString() }),
    });
    setProgress("Importing repository files into private project storage…");
    const result = await invoke<{ synced: number; warnings?: string[] }>("figurable-github", { projectId, action: "sync" });
    setToken("");
    onOpenChange(false);
    navigate({ to: "/project/$projectId", params: { projectId }, search: { prompt: "" } });
    if (result.warnings?.length) console.warn("GitHub import completed with warnings:", result.warnings);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setProgress("");
    try { await importRepository(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "GitHub import failed."); }
    finally { setBusy(false); }
  }

  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay"/>
      <Dialog.Content className="dialog-content">
        <Dialog.Title>Import a GitHub project</Dialog.Title>
        <Dialog.Description>Import real source files into Figurable and keep the repository connected. Auto-push stays off until you enable it.</Dialog.Description>
        <Dialog.Close asChild><Button variant="ghost" size="icon" className="dialog-close" disabled={busy}><X size={16}/></Button></Dialog.Close>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="form-label">Project name (optional)<input value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Use repository name"/></label>
          <label className="form-label">Repository URL<input type="url" value={repoUrl} onChange={event => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repository" required/></label>
          <label className="form-label">Branch<input value={branch} onChange={event => setBranch(event.target.value)} placeholder="main" required/></label>
          <label className="form-label">GitHub token<input type="password" autoComplete="off" value={token} onChange={event => setToken(event.target.value)} placeholder="Stored encrypted in Supabase Vault" required/></label>
          <p className="text-xs leading-5 text-zinc-500">Use a token with repository Contents read permission. The token is stored in Vault, not in project files. The import supports up to 100 eligible files.</p>
          {progress && <p role="status" className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">{progress}</p>}
          {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}
          <div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button><Button type="submit" variant="primary" disabled={busy || !workspaceId}>{busy ? <><LoaderCircle size={14} className="mr-2 animate-spin"/>Importing…</> : <><GitBranch size={14} className="mr-2"/>Import repository<ArrowRight size={14} className="ml-2"/></>}</Button></div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

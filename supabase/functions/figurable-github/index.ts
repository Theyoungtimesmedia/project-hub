import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}
function safePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!path || path.length > 240 || path.split("/").some(part => !part || part === "." || part === "..")) return null;
  return path;
}
function mimeFor(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".js") || lower.endsWith(".mjs") || lower.endsWith(".cjs")) return "text/javascript";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx") || lower.endsWith(".jsx")) return "text/plain";
  if (lower.endsWith(".json") || lower.endsWith(".map")) return "application/json";
  if (lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".yml") || lower.endsWith(".yaml") || lower.endsWith(".sql") || lower.endsWith(".toml")) return "text/plain";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".zip")) return "application/zip";
  return "application/octet-stream";
}
function decodeBase64(value: string) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "POST is required." }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !url || !anon || !service) return json({ error: "A valid signed-in session is required." }, 401);
  let body: { projectId?: string; owner?: string; repo?: string; branch?: string; action?: string };
  try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (!body.projectId) return json({ error: "projectId is required." }, 400);
  const action = body.action || "connect";
  if (!["connect", "sync"].includes(action)) return json({ error: "Unsupported GitHub action." }, 400);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: "Your session is no longer valid." }, 401);
  const { data: project } = await userClient.from("projects").select("id,active_branch").eq("id", body.projectId).maybeSingle();
  if (!project) return json({ error: "Project not found or access was removed." }, 404);
  const { data: vaultToken } = await admin.rpc("read_project_secret", { p_project_id: body.projectId, p_secret_key: "GITHUB_TOKEN" });
  if (typeof vaultToken !== "string" || !vaultToken.trim()) return json({ error: "Save a GitHub personal access token in this project's encrypted GitHub connector first." }, 503);

  let owner = body.owner?.trim() ?? "";
  let repo = body.repo?.trim() ?? "";
  let branch = body.branch?.trim() || "main";
  if (action === "sync") {
    const { data: integration } = await userClient.from("github_integrations").select("repository_owner,repository_name,default_branch").eq("project_id", body.projectId).maybeSingle();
    if (!integration) return json({ error: "Connect a GitHub repository before syncing files." }, 404);
    owner = integration.repository_owner;
    repo = integration.repository_name;
    branch = integration.default_branch || "main";
  }
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || !/^[A-Za-z0-9_.\/-]{1,200}$/.test(branch) || branch.includes("..")) {
    return json({ error: "Repository owner, name or branch contains invalid characters." }, 400);
  }

  const ghHeaders = { Authorization: "Bearer " + vaultToken, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const [userResponse, repoResponse] = await Promise.all([
    fetch("https://api.github.com/user", { headers: ghHeaders }),
    fetch("https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo), { headers: ghHeaders }),
  ]);
  const user = await userResponse.json().catch(() => ({}));
  const repository = await repoResponse.json().catch(() => ({}));
  if (!userResponse.ok) return json({ error: "GitHub rejected the token. Check the token and its repository permissions." }, 502);
  if (!repoResponse.ok) return json({ error: "GitHub could not open " + owner + "/" + repo + ". Confirm the repository exists and the token has Contents read/write permission." }, 502);
  const fullName = String(repository.full_name ?? owner + "/" + repo);
  const defaultBranch = String(repository.default_branch ?? branch);
  if (action === "connect") return json({ success: true, account: String(user.login ?? "Connected account"), repository: fullName, defaultBranch, private: Boolean(repository.private) });

  const api = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo);
  const refResponse = await fetch(api + "/git/ref/heads/" + encodeURIComponent(branch), { headers: ghHeaders });
  const refData = await refResponse.json().catch(() => ({}));
  if (!refResponse.ok || !refData.object?.sha) return json({ error: "Could not read GitHub branch " + branch + "." }, 502);
  const commitResponse = await fetch(api + "/git/commits/" + refData.object.sha, { headers: ghHeaders });
  const commitData = await commitResponse.json().catch(() => ({}));
  if (!commitResponse.ok || !commitData.tree?.sha) return json({ error: "Could not read the latest repository tree." }, 502);
  const treeResponse = await fetch(api + "/git/trees/" + commitData.tree.sha + "?recursive=1", { headers: ghHeaders });
  const treeData = await treeResponse.json().catch(() => ({}));
  if (!treeResponse.ok || !Array.isArray(treeData.tree)) return json({ error: "Could not list repository files." }, 502);
  const candidates = treeData.tree.filter((entry: Record<string, unknown>) => entry.type === "blob" && typeof entry.path === "string" && typeof entry.sha === "string" && !String(entry.path).split("/").some(part => part === "node_modules" || part === ".git" || part === "dist" || part === "build" || part === ".next") && !String(entry.path).endsWith(".lockb"));
  if (candidates.length > 100) return json({ error: "This repository has more than 100 eligible files. Narrow the import before syncing." }, 413);
  const manifest: Record<string, { sha: string; size: number }> = {};
  let totalBytes = 0;
  let synced = 0;
  const errors: string[] = [];
  for (const entry of candidates) {
    const path = safePath(entry.path);
    if (!path) continue;
    const size = Number(entry.size ?? 0);
    if (!Number.isFinite(size) || size < 0 || size > 750000 || totalBytes + size > 8 * 1024 * 1024) {
      errors.push(path + " skipped (file or import size limit)");
      continue;
    }
    const blobResponse = await fetch(api + "/git/blobs/" + entry.sha, { headers: ghHeaders });
    const blobData = await blobResponse.json().catch(() => ({}));
    if (!blobResponse.ok || blobData.encoding !== "base64" || typeof blobData.content !== "string") {
      errors.push(path + " could not be read");
      continue;
    }
    let bytes: Uint8Array;
    try { bytes = decodeBase64(blobData.content); } catch { errors.push(path + " has invalid blob encoding"); continue; }
    if (bytes.byteLength !== size || totalBytes + bytes.byteLength > 8 * 1024 * 1024) {
      errors.push(path + " skipped (decoded size limit)");
      continue;
    }
    const mime = mimeFor(path);
    const storagePath = body.projectId + "/" + path;
    const { error: storageError } = await admin.storage.from("project-files").upload(storagePath, new Blob([bytes as unknown as BlobPart], { type: mime }), { upsert: true, contentType: mime });
    if (storageError) { errors.push(path + " storage error"); continue; }
    let textContent: string | null = null;
    if (mime.startsWith("text/") || /json|javascript|xml/.test(mime)) {
      try { textContent = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { textContent = null; }
      if (textContent && textContent.length > 100000) textContent = null;
    }
    const { error: rowError } = await admin.from("project_files").upsert({
      project_id: body.projectId, file_path: path, file_name: path.split("/").at(-1), mime_type: mime,
      size_bytes: bytes.byteLength, storage_path: storagePath, text_content: textContent, sha256: String(entry.sha),
      source: "github", uploaded_by: auth.user.id, updated_at: new Date().toISOString(),
    }, { onConflict: "project_id,file_path" });
    if (rowError) { errors.push(path + " metadata error"); continue; }
    manifest[path] = { sha: String(entry.sha), size: bytes.byteLength };
    totalBytes += bytes.byteLength;
    synced++;
  }

  const { data: oldGithubFiles } = await admin.from("project_files").select("id,file_path,storage_path").eq("project_id", body.projectId).eq("source", "github");
  for (const oldFile of oldGithubFiles ?? []) {
    if (manifest[oldFile.file_path]) continue;
    if (oldFile.storage_path) await admin.storage.from("project-files").remove([oldFile.storage_path]);
    await admin.from("project_files").delete().eq("id", oldFile.id);
  }
  await admin.from("github_integrations").update({ last_synced_at: new Date().toISOString(), last_sync_status: errors.length ? "Synced with " + errors.length + " warnings" : "Synced " + synced + " files" }).eq("project_id", body.projectId);
  return json({ success: true, repository: fullName, branch, synced, totalBytes, warnings: errors.slice(0, 30), commit: String(refData.object.sha) });
});

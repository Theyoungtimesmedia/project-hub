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
function safePath(value: string) {
  const path = value.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!path || path.length > 240 || path.split("/").some(part => !part || part === "." || part === "..")) return null;
  return path;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "POST is required." }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !url || !anon || !service) return json({ error: "A valid signed-in session is required." }, 401);

  let body: { projectId?: string; turnId?: string };
  try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (!body.projectId || !body.turnId) return json({ error: "projectId and turnId are required." }, 400);

  const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: "Your session is no longer valid." }, 401);
  const { data: project } = await userClient.from("projects").select("id,active_branch").eq("id", body.projectId).maybeSingle();
  if (!project) return json({ error: "Project not found or you do not have access to it." }, 404);
  const { data: snapshot, error: snapshotError } = await userClient.from("project_snapshots")
    .select("id,turn_id,label,branch_name,files_manifest,summary,created_at")
    .eq("project_id", body.projectId).eq("turn_id", body.turnId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (snapshotError || !snapshot) return json({ error: "No restorable checkpoint exists for this Build turn." }, 404);

  const manifest = snapshot.files_manifest as Record<string, { snapshot_path?: string; mime_type?: string; size_bytes?: number }>;
  const paths = Object.keys(manifest);
  if (!paths.length) return json({ error: "This checkpoint has no saved files." }, 422);
  const current = await admin.from("project_files").select("id,file_path,storage_path").eq("project_id", body.projectId);
  const pathSet = new Set(paths);
  for (const file of current.data ?? []) {
    if (!pathSet.has(file.file_path)) {
      if (file.storage_path) await admin.storage.from("project-files").remove([file.storage_path]);
      await admin.from("project_files").delete().eq("id", file.id);
    }
  }

  let previewHtml: string | null = null;
  const restored: string[] = [];
  for (const path of paths) {
    const safe = safePath(path);
    const entry = manifest[path];
    if (!safe || !entry?.snapshot_path) continue;
    const { data: blob, error: downloadError } = await admin.storage.from("project-files").download(entry.snapshot_path);
    if (downloadError || !blob) return json({ error: "Could not restore checkpoint file " + path + ": " + (downloadError?.message ?? "file missing") }, 502);
    const storagePath = body.projectId + "/" + safe;
    const { error: uploadError } = await admin.storage.from("project-files").upload(storagePath, blob, { upsert: true, contentType: entry.mime_type ?? blob.type ?? "application/octet-stream" });
    if (uploadError) return json({ error: "Could not write restored file " + path + ": " + uploadError.message }, 502);
    const text = (entry.mime_type ?? "").startsWith("text/") || /html|json|javascript|xml/.test(entry.mime_type ?? "") ? await blob.text() : null;
    const { error: rowError } = await admin.from("project_files").upsert({
      project_id: body.projectId, file_path: safe, file_name: safe.split("/").at(-1), mime_type: entry.mime_type ?? blob.type ?? "application/octet-stream",
      size_bytes: entry.size_bytes ?? blob.size, storage_path: storagePath, text_content: text && text.length <= 100000 ? text : null,
      source: "generated", uploaded_by: auth.user.id, updated_at: new Date().toISOString(),
    }, { onConflict: "project_id,file_path" });
    if (rowError) return json({ error: "Could not update restored file metadata for " + path + "." }, 500);
    restored.push(path);
    if (path === "index.html" && text) previewHtml = text;
  }

  const { data: turn } = await admin.from("chat_turns").insert({
    project_id: body.projectId, user_id: auth.user.id, mode: "Build", prompt: "Restore checkpoint: " + snapshot.label,
    summary: "Restored " + restored.length + " files from checkpoint " + snapshot.created_at,
    status: "completed", result_payload: { preview_html: previewHtml, restored_snapshot_id: snapshot.id, restored_files: restored },
    started_at: new Date().toISOString(), completed_at: new Date().toISOString(),
  }).select("id").single();
  if (turn) await admin.from("turn_events").insert({ turn_id: turn.id, kind: "checkpoint", label: "Checkpoint restored", detail: snapshot.label, payload: { source_turn_id: body.turnId, restored_files: restored.length } });
  return json({ success: true, turnId: turn?.id ?? null, restoredFiles: restored.length, preview_html: previewHtml, summary: "Restored " + restored.length + " files from checkpoint." });
});

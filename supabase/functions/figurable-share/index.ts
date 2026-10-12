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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST" && req.method !== "GET") return json({ error: "GET or POST is required." }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !service) return json({ error: "Preview service is unavailable." }, 503);
  let token = "";
  if (req.method === "GET") {
    token = new URL(req.url).searchParams.get("token")?.trim() ?? "";
  } else {
    let body: { token?: string };
    try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
    token = body.token?.trim() ?? "";
  }
  if (!/^[a-f0-9]{64}$/.test(token)) return json({ error: "This preview link is invalid or has been revoked." }, 404);

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: link } = await admin.from("project_share_links").select("id,project_id,label,expires_at,is_active")
    .eq("token_hash", tokenHash).maybeSingle();
  if (!link || !link.is_active || (link.expires_at && new Date(link.expires_at).getTime() <= Date.now())) {
    return json({ error: "This preview link has expired or been revoked." }, 404);
  }

  const { data: project } = await admin.from("projects").select("name").eq("id", link.project_id).maybeSingle();
  if (!project) return json({ error: "This project is no longer available." }, 404);
  const { data: turns } = await admin.from("chat_turns").select("result_payload,created_at")
    .eq("project_id", link.project_id).eq("mode", "Build").eq("status", "completed")
    .order("created_at", { ascending: false }).limit(20);
  let previewHtml: string | null = null;
  for (const turn of turns ?? []) {
    const candidate = turn.result_payload?.preview_html;
    if (typeof candidate === "string" && candidate.trim()) { previewHtml = candidate; break; }
  }
  if (!previewHtml) {
    const { data: file } = await admin.from("project_files").select("text_content,storage_path")
      .eq("project_id", link.project_id).eq("file_path", "index.html").maybeSingle();
    if (file?.text_content) previewHtml = file.text_content;
    else if (file?.storage_path) {
      const { data: blob } = await admin.storage.from("project-files").download(file.storage_path);
      if (blob && blob.size <= 700000) previewHtml = await blob.text();
    }
  }
  if (!previewHtml) return json({ error: "This project has no self-contained HTML preview to share yet. Generate a preview in Build mode first." }, 422);
  if (req.method === "GET") {
    return new Response(previewHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "sandbox allow-scripts; default-src 'self' data: blob: https:; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
      },
    });
  }
  return json({ success: true, name: project.name, label: link.label, html: previewHtml });
});

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

function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host === "0.0.0.0" || host === "169.254.169.254") return false;
    if (/^(10\.|127\.|192\.168\.|169\.254\.)/.test(host)) return false;
    const match = host.match(/^172\.(\d+)\./);
    if (match && Number(match[1]) >= 16 && Number(match[1]) <= 31) return false;
    return true;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return json({ error: "POST is required." }, 405);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const envFirecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!token || !supabaseUrl || !anonKey || !serviceKey) return json({ error: "A valid signed-in session is required." }, 401);

  let body: { projectId?: string; url?: string };
  try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  const projectId = body.projectId;
  const targetUrl = body.url?.trim();
  if (!projectId || !targetUrl || !isPublicHttpsUrl(targetUrl)) return json({ error: "Provide a valid public HTTPS website URL and projectId." }, 400);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Your session is no longer valid. Sign in again." }, 401);
  const { data: project, error: projectError } = await userClient.from("projects").select("id,name").eq("id", projectId).maybeSingle();
  if (projectError || !project) return json({ error: "Project not found or you do not have access to it." }, 404);

  const { data: vaultFirecrawlKey } = await admin.rpc("read_project_secret", { p_project_id: projectId, p_secret_key: "FIRECRAWL_API_KEY" });
  const firecrawlKey = typeof vaultFirecrawlKey === "string" && vaultFirecrawlKey.trim() ? vaultFirecrawlKey : envFirecrawlKey;
  if (!firecrawlKey) return json({ error: "Firecrawl is not configured. Save a Firecrawl key in this project's Connectors settings first." }, 503);

  const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { Authorization: "Bearer " + firecrawlKey, "Content-Type": "application/json" },
    body: JSON.stringify({ url: targetUrl, formats: ["markdown", "links"] }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    const message = payload.error?.message ?? payload.error ?? "Firecrawl returned HTTP " + response.status + ".";
    return json({ error: String(message) }, 502);
  }

  const data = payload.data ?? payload;
  const markdown = typeof data.markdown === "string" ? data.markdown : "";
  const metadata = data.metadata ?? {};
  if (!markdown.trim()) return json({ error: "Firecrawl returned no readable Markdown for this URL." }, 422);
  const title = String(metadata.title ?? metadata.ogTitle ?? targetUrl).slice(0, 240);
  const { data: knowledge, error: saveError } = await admin.from("project_knowledge").insert({
    project_id: projectId,
    title: "Web source: " + title,
    content: "Source URL: " + targetUrl + "\nRetrieved at: " + new Date().toISOString() + "\n\n" + markdown.slice(0, 100000),
    created_by: authData.user.id,
    is_active: true,
  }).select("id,title,created_at").single();

  if (saveError || !knowledge) return json({ error: "Content was retrieved but could not be saved to project knowledge." }, 500);
  return json({ success: true, knowledgeId: knowledge.id, title, sourceUrl: targetUrl, characters: markdown.length, savedAt: knowledge.created_at });
});

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
  if (req.method !== "POST") return json({ error: "POST is required." }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!token || !url || !anon || !service) return json({ error: "A valid signed-in session is required." }, 401);
  let body: { projectId?: string; owner?: string; repo?: string; branch?: string };
  try { body = await req.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
  if (!body.projectId || !body.owner?.trim() || !body.repo?.trim()) return json({ error: "Project, repository owner and repository name are required." }, 400);
  const owner = body.owner.trim();
  const repo = body.repo.trim();
  const branch = body.branch?.trim() || "main";
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(owner) || !/^[A-Za-z0-9_.-]{1,100}$/.test(repo) || !/^[A-Za-z0-9_.\/-]{1,200}$/.test(branch) || branch.includes("..")) {
    return json({ error: "Repository owner, name or branch contains invalid characters." }, 400);
  }
  const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const { data: auth, error: authError } = await userClient.auth.getUser(token);
  if (authError || !auth.user) return json({ error: "Your session is no longer valid." }, 401);
  const { data: project } = await userClient.from("projects").select("id").eq("id", body.projectId).maybeSingle();
  if (!project) return json({ error: "Project not found or access was removed." }, 404);
  const { data: vaultToken } = await admin.rpc("read_project_secret", { p_project_id: body.projectId, p_secret_key: "GITHUB_TOKEN" });
  if (typeof vaultToken !== "string" || !vaultToken.trim()) return json({ error: "Save a GitHub personal access token in this project's encrypted GitHub connector first." }, 503);

  const ghHeaders = { Authorization: "Bearer " + vaultToken, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  const [userResponse, repoResponse] = await Promise.all([
    fetch("https://api.github.com/user", { headers: ghHeaders }),
    fetch("https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo), { headers: ghHeaders }),
  ]);
  const user = await userResponse.json().catch(() => ({}));
  const repository = await repoResponse.json().catch(() => ({}));
  if (!userResponse.ok) return json({ error: "GitHub rejected the token. Check the token and its repository permissions." }, 502);
  if (!repoResponse.ok) return json({ error: "GitHub could not open " + owner + "/" + repo + ". Confirm the repository exists and the token has Contents read/write permission." }, 502);
  return json({ success: true, account: String(user.login ?? "Connected account"), repository: String(repository.full_name ?? owner + "/" + repo), defaultBranch: String(repository.default_branch ?? branch), private: Boolean(repository.private) });
});

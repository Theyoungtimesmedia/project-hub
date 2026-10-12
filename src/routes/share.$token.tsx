import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, LoaderCircle, ShieldAlert } from "lucide-react";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const Route = createFileRoute("/share/$token")({
  head: () => ({
    meta: [
      { title: "Shared preview — Figurable" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SharedPreviewRoute,
});

function SharedPreviewRoute() {
  const { token } = Route.useParams();
  const [name, setName] = useState("Shared project");
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        setError("The preview service is not configured.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(SUPABASE_URL + "/functions/v1/figurable-share", {
          method: "POST",
          headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
          body: JSON.stringify({ token }),
        });
        const payload = await response.json().catch(() => ({})) as { success?: boolean; name?: string; html?: string; error?: string };
        if (!response.ok || !payload.success || typeof payload.html !== "string") throw new Error(payload.error ?? "This preview link is invalid or unavailable.");
        if (!cancelled) { setName(payload.name ?? "Shared project"); setHtml(payload.html); }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load this preview.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [token]);

  return <main className="min-h-screen bg-[#f5f7fb] text-zinc-900">
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-sm font-semibold text-white">F</span><b>Figurable</b><span className="text-zinc-400">/</span><span className="text-sm text-zinc-600">{name}</span></div><a href="https://figurable.vercel.app" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">Figurable <ExternalLink size={12}/></a></header>
    {loading ? <div className="grid min-h-[70vh] place-items-center text-sm text-zinc-500"><span><LoaderCircle className="mr-2 inline animate-spin" size={16}/>Loading shared preview…</span></div> : error ? <div className="mx-auto grid min-h-[70vh] max-w-lg place-items-center p-6"><section className="w-full rounded-2xl border border-zinc-200 bg-white p-7 text-center shadow-sm"><ShieldAlert className="mx-auto text-amber-600" size={28}/><h1 className="mt-4 text-lg font-semibold">Preview unavailable</h1><p className="mt-2 text-sm leading-6 text-zinc-600">{error}</p></section></div> : <iframe title={name + " shared preview"} srcDoc={html ?? ""} sandbox="allow-scripts" className="block h-[calc(100vh-56px)] w-full border-0 bg-white"/>}
  </main>;
}

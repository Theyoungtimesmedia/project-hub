import { useEffect, useState, type ReactNode, type FormEvent } from "react";
import { ArrowRight, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackend } from "@/lib/backend";

export function BackendGate({ children }: { children: ReactNode }) {
  const { configured, session, loading } = useBackend();
  const [publicShareRoute, setPublicShareRoute] = useState(false);
  useEffect(() => { setPublicShareRoute(window.location.pathname.startsWith("/share/")); }, []);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { signIn, signUp } = useBackend();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (signup) {
        await signUp(email.trim(), password, name.trim());
        setNotice("Account request submitted. If email confirmation is enabled, confirm your address before signing in.");
        setSignup(false);
        setPassword("");
      } else {
        await signIn(email.trim(), password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  if (publicShareRoute) return <>{children}</>;
  if (!configured) return <main className="min-h-screen grid place-items-center bg-[#f6f8fb] p-6 text-zinc-900"><section className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><ShieldCheck size={20}/></div><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-700">Figurable · backend setup</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Connect your Supabase project</h1><p className="mt-3 text-sm leading-6 text-zinc-600">The app does not load demo projects. Add the public project URL and publishable/anon key to the deployment environment so authentication and RLS-backed data can start.</p><div className="mt-5 space-y-3 rounded-xl bg-zinc-50 p-4 font-mono text-xs text-zinc-700"><p>VITE_SUPABASE_URL=https://your-project.supabase.co</p><p>VITE_SUPABASE_ANON_KEY=your-public-anon-key</p></div><p className="mt-4 text-xs leading-5 text-zinc-500">Set these in your hosting provider's environment variables, then redeploy. Never add a service-role key to a VITE_ variable.</p></section></main>;
  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] text-sm text-zinc-500"><LoaderCircle className="mr-2 inline animate-spin" size={16}/> Restoring your secure session…</main>;
  if (!session) return <main className="grid min-h-screen place-items-center bg-[#f6f8fb] p-5 text-zinc-900"><section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm"><div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-semibold text-white">F</span><span className="text-lg font-semibold tracking-tight">Figurable</span></div><p className="mt-7 text-xs font-semibold uppercase tracking-[.15em] text-blue-700">Private development workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{signup ? "Create your workspace" : "Welcome back"}</h1><p className="mt-2 text-sm leading-6 text-zinc-600">Your projects, files, conversations and connector settings stay in your own Supabase-backed workspace.</p><form onSubmit={submit} className="mt-6 space-y-3">{signup && <label className="block text-xs font-medium text-zinc-700">Name<input className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-blue-500" required autoComplete="name" value={name} onChange={e=>setName(e.target.value)} /></label>}<label className="block text-xs font-medium text-zinc-700">Email<input className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-blue-500" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label className="block text-xs font-medium text-zinc-700">Password<input className="mt-1.5 h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-blue-500" type="password" required minLength={8} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={e=>setPassword(e.target.value)} /></label>{error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">{notice}</p>}<Button type="submit" disabled={busy} className="w-full" variant="primary">{busy ? <LoaderCircle className="mr-2 animate-spin" size={15}/> : <KeyRound className="mr-2" size={15}/>}{signup ? "Create account" : "Sign in"}<ArrowRight className="ml-auto" size={15}/></Button></form><p className="mt-5 text-center text-sm text-zinc-600">{signup ? "Already have an account?" : "New to Figurable?"} <button className="font-semibold text-blue-700 hover:underline" onClick={()=>{setSignup(v=>!v);setError("");setNotice("");}}>{signup ? "Sign in" : "Create account"}</button></p></section></main>;
  return <>{children}</>;
}

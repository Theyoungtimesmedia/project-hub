import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const SESSION_KEY = "figurable.auth.session";
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
};

type AuthContextValue = {
  configured: boolean;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  upload: (path: string, file: File) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as AuthSession;
    return parsed.access_token && parsed.refresh_token && parsed.user?.id ? parsed : null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function persistSession(value: Record<string, unknown>): AuthSession {
  const user = value.user as AuthSession["user"] | undefined;
  const session: AuthSession = {
    access_token: String(value.access_token ?? ""),
    refresh_token: String(value.refresh_token ?? ""),
    expires_at: Number(value.expires_at ?? (Date.now() / 1000 + Number(value.expires_in ?? 3600))),
    user: user ?? { id: "" },
  };
  if (!session.access_token || !session.refresh_token || !session.user.id) {
    throw new Error("Authentication did not return a complete session. Check your Supabase Auth settings.");
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("figurable:auth", { detail: session }));
  return session;
}

async function authRequest(path: string, body: Record<string, unknown>) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the deployment environment.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(data.msg ?? data.message ?? data.error_description ?? data.error ?? "Authentication request failed."));
  return data;
}

async function refreshSession(session: AuthSession): Promise<AuthSession> {
  const data = await authRequest("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
  return persistSession({ ...data, expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600) });
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const configured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    let alive = true;
    const load = async () => {
      const stored = readStoredSession();
      if (!stored) { if (alive) { setSession(null); setLoading(false); } return; }
      try {
        const fresh = stored.expires_at < Date.now() / 1000 + 60 ? await refreshSession(stored) : stored;
        if (alive) { setSession(fresh); setError(null); }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
        if (alive) setSession(null);
      } finally { if (alive) setLoading(false); }
    };
    void load();
    const onAuth = (event: Event) => setSession((event as CustomEvent<AuthSession>).detail);
    window.addEventListener("figurable:auth", onAuth);
    return () => { alive = false; window.removeEventListener("figurable:auth", onAuth); };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const data = await authRequest("token?grant_type=password", { email, password });
    const next = persistSession({ ...data, expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600) });
    setSession(next);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    const data = await authRequest("signup", { email, password, data: { name } });
    if (data.access_token) {
      const next = persistSession({ ...data, expires_at: Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600) });
      setSession(next);
    } else {
      throw new Error("Account created. Confirm your email, then sign in. If confirmation emails are disabled in Supabase Auth, sign in now.");
    }
  }, []);

  const signOut = useCallback(async () => {
    const current = readStoredSession();
    if (SUPABASE_URL && SUPABASE_ANON_KEY && current?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${current.access_token}` } }).catch(() => undefined);
    }
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured.");
    let current = readStoredSession();
    if (current && current.expires_at < Date.now() / 1000 + 60) current = await refreshSession(current);
    const headers = new Headers(init.headers);
    headers.set("apikey", SUPABASE_ANON_KEY);
    headers.set("Authorization", `Bearer ${current?.access_token ?? SUPABASE_ANON_KEY}`);
    if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) headers.set("content-type", "application/json");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers });
    if (response.status === 204) return undefined as T;
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = data && typeof data === "object" ? String((data as Record<string, unknown>).message ?? (data as Record<string, unknown>).hint ?? (data as Record<string, unknown>).details ?? "Request failed.") : "Request failed.";
      throw new Error(detail);
    }
    return data as T;
  }, []);

  const upload = useCallback(async (path: string, file: File) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase is not configured.");
    const current = readStoredSession();
    if (!current) throw new Error("Sign in before uploading files.");
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/project-files/${path.split("/").map(encodeURIComponent).join("/")}`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${current.access_token}`, "content-type": file.type || "application/octet-stream", "x-upsert": "true" },
      body: file,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(String(data.message ?? data.error ?? "Upload failed."));
    }
  }, []);

  const value = useMemo(() => ({ configured, session, loading, error, signIn, signUp, signOut, request, upload }), [configured, session, loading, error, signIn, signUp, signOut, request, upload]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useBackend() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useBackend must be used inside BackendProvider.");
  return value;
}

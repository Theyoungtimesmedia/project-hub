import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "https://unhwyywmnkwsjiiusauo.supabase.co").replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaHd5eXdtbmt3c2ppaXVzYXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzQ3MzMsImV4cCI6MjEwNzQxMDczM30.QXn4jIfsfVP7pg-hwyFAN4KkoF5-a-sBDV-tbjdqUks";
const SESSION_KEY = "sb-unhwyywmnkwsjiiusauo-auth-token";

type BackendUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };
type Session = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; token_type?: string; user: BackendUser };
type BackendContextValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  request: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
  invoke: <T = unknown>(name: string, body?: Record<string, unknown>) => Promise<T>;
  upload: (path: string, file: File) => Promise<void>;
  download: (path: string) => Promise<Blob>;
  remove: (path: string) => Promise<void>;
};

const BackendContext = createContext<BackendContextValue | null>(null);

function parseResponse(text: string): unknown {
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

function messageOf(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    for (const key of ["message", "error_description", "error", "msg", "hint"]) {
      if (typeof value[key] === "string" && value[key]) return value[key] as string;
    }
  }
  return fallback;
}

function readSavedSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.access_token || !parsed.refresh_token || !parsed.user?.id) return null;
    return parsed;
  } catch { return null; }
}

function writeSavedSession(session: Session | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch { /* Private browsing may disable storage; the in-memory session still works. */ }
}

function storagePath(path: string) {
  return path.split("/").map(part => encodeURIComponent(part)).join("/");
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<Session | null>(null);

  const saveSession = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
    writeSavedSession(next);
  }, []);

  const refreshSession = useCallback(async (refreshToken: string): Promise<Session> => {
    const response = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const payload = parseResponse(await response.text()) as Record<string, unknown> | null;
    if (!response.ok || !payload || typeof payload.access_token !== "string" || typeof payload.refresh_token !== "string" || !payload.user) {
      throw new Error(messageOf(payload, "Your session expired. Sign in again."));
    }
    const expiresIn = Number(payload.expires_in || 3600);
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_in: expiresIn,
      expires_at: Number(payload.expires_at || Math.floor(Date.now() / 1000) + expiresIn),
      token_type: String(payload.token_type || "bearer"),
      user: payload.user as BackendUser,
    };
  }, []);

  const getValidSession = useCallback(async () => {
    const current = sessionRef.current;
    if (!current) return null;
    if (current.expires_at && current.expires_at > Math.floor(Date.now() / 1000) + 45) return current;
    try {
      const next = await refreshSession(current.refresh_token);
      saveSession(next);
      return next;
    } catch {
      saveSession(null);
      return null;
    }
  }, [refreshSession, saveSession]);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const saved = readSavedSession();
      if (saved) {
        sessionRef.current = saved;
        if (saved.expires_at && saved.expires_at <= Math.floor(Date.now() / 1000) + 45) {
          try {
            const fresh = await refreshSession(saved.refresh_token);
            if (active) saveSession(fresh);
          } catch {
            if (active) saveSession(null);
          }
        } else if (active) {
          setSession(saved);
        }
      }
      if (active) setLoading(false);
    };
    void restore();
    return () => { active = false; };
  }, [refreshSession, saveSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const payload = parseResponse(await response.text()) as Record<string, unknown> | null;
    if (!response.ok || !payload || typeof payload.access_token !== "string" || typeof payload.refresh_token !== "string" || !payload.user) {
      throw new Error(messageOf(payload, "Could not sign in. Check your email and password."));
    }
    const expiresIn = Number(payload.expires_in || 3600);
    saveSession({
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_in: expiresIn,
      expires_at: Number(payload.expires_at || Math.floor(Date.now() / 1000) + expiresIn),
      token_type: String(payload.token_type || "bearer"),
      user: payload.user as BackendUser,
    });
  }, [saveSession]);

  const signUp = useCallback(async (email: string, password: string, name = "") => {
    const response = await fetch(SUPABASE_URL + "/auth/v1/signup", {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, data: { name: name.trim(), full_name: name.trim() } }),
    });
    const payload = parseResponse(await response.text()) as Record<string, unknown> | null;
    if (!response.ok) throw new Error(messageOf(payload, "Could not create your account."));
    if (payload && typeof payload.access_token === "string" && typeof payload.refresh_token === "string" && payload.user) {
      const expiresIn = Number(payload.expires_in || 3600);
      saveSession({
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_in: expiresIn,
        expires_at: Number(payload.expires_at || Math.floor(Date.now() / 1000) + expiresIn),
        token_type: String(payload.token_type || "bearer"),
        user: payload.user as BackendUser,
      });
    }
  }, [saveSession]);

  const signOut = useCallback(async () => {
    const current = await getValidSession();
    try {
      if (current) {
        await fetch(SUPABASE_URL + "/auth/v1/logout", {
          method: "POST",
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + current.access_token },
        });
      }
    } finally { saveSession(null); }
  }, [getValidSession, saveSession]);

  const authorizedFetch = useCallback(async (url: string, init: RequestInit = {}) => {
    let current = await getValidSession();
    const headers = new Headers(init.headers);
    headers.set("apikey", SUPABASE_ANON_KEY);
    headers.set("Authorization", "Bearer " + (current?.access_token || SUPABASE_ANON_KEY));
    const response = await fetch(url, { ...init, headers });
    if (response.status !== 401 || !current) return response;
    try {
      current = await refreshSession(current.refresh_token);
      saveSession(current);
      headers.set("Authorization", "Bearer " + current.access_token);
      return await fetch(url, { ...init, headers });
    } catch { saveSession(null); return response; }
  }, [getValidSession, refreshSession, saveSession]);

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const cleanPath = path.replace(/^\/+/, "");
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    const response = await authorizedFetch(SUPABASE_URL + "/rest/v1/" + cleanPath, { ...init, headers });
    const payload = parseResponse(await response.text());
    if (!response.ok) throw new Error(messageOf(payload, "Supabase request failed with HTTP " + response.status + "."));
    return payload as T;
  }, [authorizedFetch]);

  const invoke = useCallback(async <T,>(name: string, body: Record<string, unknown> = {}): Promise<T> => {
    const response = await authorizedFetch(SUPABASE_URL + "/functions/v1/" + encodeURIComponent(name), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = parseResponse(await response.text());
    if (!response.ok) throw new Error(messageOf(payload, "The server function failed with HTTP " + response.status + "."));
    if (payload === null) throw new Error("The server returned an empty response.");
    return payload as T;
  }, [authorizedFetch]);

  const upload = useCallback(async (path: string, file: File) => {
    const safePath = path.replaceAll("\\", "/").replace(/^\/+/, "");
    if (!safePath || safePath.split("/").some(part => !part || part === "." || part === "..")) throw new Error("Invalid project storage path.");
    const response = await authorizedFetch(SUPABASE_URL + "/storage/v1/object/project-files/" + storagePath(safePath), {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "true", "cache-control": "3600" },
      body: file,
    });
    if (!response.ok) throw new Error(messageOf(parseResponse(await response.text()), "Upload failed with HTTP " + response.status + "."));
  }, [authorizedFetch]);

  const download = useCallback(async (path: string) => {
    const response = await authorizedFetch(SUPABASE_URL + "/storage/v1/object/authenticated/project-files/" + storagePath(path));
    if (!response.ok) throw new Error(messageOf(parseResponse(await response.text()), "Download failed with HTTP " + response.status + "."));
    return await response.blob();
  }, [authorizedFetch]);

  const remove = useCallback(async (path: string) => {
    const response = await authorizedFetch(SUPABASE_URL + "/storage/v1/object/project-files/" + storagePath(path), { method: "DELETE" });
    if (!response.ok) throw new Error(messageOf(parseResponse(await response.text()), "File removal failed with HTTP " + response.status + "."));
  }, [authorizedFetch]);

  const value = useMemo<BackendContextValue>(() => ({
    session, loading, configured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY), signIn, signUp, signOut, request, invoke, upload, download, remove,
  }), [session, loading, signIn, signUp, signOut, request, invoke, upload, download, remove]);

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  const value = useContext(BackendContext);
  if (!value) throw new Error("useBackend must be used inside BackendProvider.");
  return value;
}

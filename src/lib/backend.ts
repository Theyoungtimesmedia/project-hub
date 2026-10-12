import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://unhwyywmnkwsjiiusauo.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaHd5eXdtbmt3c2ppaXVzYXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzQ3MzMsImV4cCI6MjEwNzQxMDczM30.QXn4jIfsfVP7pg-hwyFAN4KkoF5-a-sBDV-tbjdqUks";

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
});

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

function errorMessage(value: unknown, fallback: string): string {
  if (value instanceof Error && value.message) return value.message;
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object" && "message" in value && typeof value.message === "string") return value.message;
  return fallback;
}

export function BackendProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) console.error("Could not restore the Figurable session:", error.message);
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name = "") => {
    const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  const request = useCallback(async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
    const cleanPath = path.replace(/^\/+/, "");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token || SUPABASE_ANON_KEY;
    const headers = new Headers(init.headers);
    headers.set("apikey", SUPABASE_ANON_KEY);
    headers.set("Authorization", "Bearer " + token);
    if (init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    const response = await fetch(SUPABASE_URL + "/rest/v1/" + cleanPath, { ...init, headers });
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    if (!response.ok) {
      const message = errorMessage(payload, "Supabase request failed with HTTP " + response.status + ".");
      throw new Error(message);
    }
    return payload as T;
  }, []);

  const invoke = useCallback(async <T,>(name: string, body: Record<string, unknown> = {}): Promise<T> => {
    const { data, error } = await supabase.functions.invoke<T>(name, { body });
    if (error) {
      let message = error.message || "The server function failed.";
      try {
        const context = (error as { context?: Response }).context;
        if (context) {
          const detail = await context.clone().json() as { error?: string; message?: string };
          message = detail.error || detail.message || message;
        }
      } catch { /* Keep the SDK error if the response is not JSON. */ }
      throw new Error(message);
    }
    if (data === null) throw new Error("The server returned an empty response.");
    return data;
  }, []);

  const upload = useCallback(async (path: string, file: File) => {
    const safePath = path.replaceAll("\\", "/").replace(/^\/+/, "");
    if (!safePath || safePath.split("/").some(part => !part || part === "." || part === "..")) {
      throw new Error("Invalid project storage path.");
    }
    const { error } = await supabase.storage.from("project-files").upload(safePath, file, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
      cacheControl: "3600",
    });
    if (error) throw new Error(error.message);
  }, []);

  const download = useCallback(async (path: string) => {
    const { data, error } = await supabase.storage.from("project-files").download(path);
    if (error) throw new Error(error.message);
    return data;
  }, []);

  const remove = useCallback(async (path: string) => {
    const { error } = await supabase.storage.from("project-files").remove([path]);
    if (error) throw new Error(error.message);
  }, []);

  const value = useMemo<BackendContextValue>(() => ({
    session, loading: authLoading, configured: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY), signIn, signUp, signOut, request, invoke, upload, download, remove,
  }), [session, authLoading, signIn, signUp, signOut, request, invoke, upload, download, remove]);

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

export function useBackend() {
  const value = useContext(BackendContext);
  if (!value) throw new Error("useBackend must be used inside BackendProvider.");
  return value;
}

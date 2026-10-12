import * as Dialog from '@radix-ui/react-dialog';
import { Activity, Check, ChevronDown, ChevronRight, Clock3, Code2, Copy, Eye, EyeOff, FileCode2, FileText, KeyRound, ListChecks, LockKeyhole, MessageCircle, ShieldCheck, Terminal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBackend } from '@/lib/backend';
import { useBackend } from '@/lib/backend';
import { Button } from '@/components/ui/button';

export type PlanState = { title: string; text: string; steps: boolean[]; stepDetails?: Array<{ title: string; detail: string; path?: string; action?: string }>; files?: Array<{ path: string; action: string }>; status: 'review' | 'approved' | 'discarded' };
export function PlanCard({ plan, onOpen, onApprove, onDiscard }: { plan: PlanState; onOpen: () => void; onApprove: () => void; onDiscard: () => void }) {
  if (plan.status !== "review") return <p className="turn-summary muted-turn">{plan.status === "approved" ? "Plan approved and sent to Build mode." : "Plan discarded. No changes were made by the planner."}</p>;
  const steps = plan.stepDetails ?? [];
  return <section className="plan-card"><div className="context-card-title"><ListChecks size={17}/><div><b>Implementation plan</b><small>{steps.length} steps · awaiting review</small></div></div>{steps.length ? <ol>{steps.map((step, index) => <li key={index}><i>{index + 1}</i><span><b>{step.title}</b><small>{step.detail}</small></span></li>)}</ol> : <p className="text-sm text-zinc-500">The planner did not return structured steps. Review the plan document for details.</p>}<div className="context-actions"><Button variant="editorActive" size="sm" onClick={onApprove}><Check size={13}/>Approve and build</Button><Button variant="outline" size="sm" onClick={onOpen}>Review plan</Button><Button variant="ghost" size="sm" onClick={onDiscard}>Discard</Button></div></section>;
}
export function PlanPreview({ plan, onChange, onApprove, onClose, onDiscard }: { plan: PlanState; onChange: (value: PlanState) => void; onApprove: () => void; onClose: () => void; onDiscard: () => void }) {
  const [editing, setEditing] = useState(false);
  const steps = plan.stepDetails ?? [];
  const files = plan.files ?? [];
  return <section className="plan-preview"><header><div><span><FileText size={14}/> .figurable/plan.md</span><small>{plan.status === "review" ? "Draft · Review required" : plan.status}</small></div><Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>{editing ? "View document" : "Edit plan"}</Button><Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close plan preview"><X size={14}/></Button></header><div className="plan-document"><div className="plan-markdown"><span className="plan-kicker">IMPLEMENTATION PLAN</span>{editing ? <><label className="settings-field">Plan title<input value={plan.title} onChange={e => onChange({ ...plan, title: e.target.value })}/></label><label className="settings-field">Plan outline<textarea value={plan.text} onChange={e => onChange({ ...plan, text: e.target.value })}/></label></> : <><h1>{plan.title}</h1><p className="whitespace-pre-wrap">{plan.text}</p></>}<h2>Implementation steps</h2>{steps.map((step, index) => <label className="plan-step" key={index}><input type="checkbox" checked={plan.steps[index] ?? false} onChange={() => onChange({ ...plan, steps: steps.map((_, i) => i === index ? !plan.steps[i] : Boolean(plan.steps[i])) })}/><span><b>{index + 1}. {step.title}</b><small>{step.detail}</small></span></label>)}{steps.length === 0 && <p className="text-sm text-zinc-500">No structured steps were returned by the planner.</p>}</div><aside><h3>Affected files</h3>{files.map((file, index) => <p key={index}><FileCode2 size={13}/>{file.path}<em>{file.action}</em></p>)}{files.length === 0 && <p className="text-xs text-zinc-500">The planner did not identify specific files.</p>}<div className="plan-impact"><b>Plan scope</b><span>{files.length} affected files listed</span><span>Review before implementation</span></div></aside></div><footer><span role="status">Plan edits and step progress are saved to this project.</span><Button variant="ghost" size="sm" onClick={onDiscard}>Discard</Button><Button variant="outline" size="sm" onClick={() => setEditing(false)}>{editing ? "Save and close" : "Edit plan"}</Button><Button variant="editorActive" size="sm" disabled={plan.status !== "review"} onClick={onApprove}>Approve plan</Button></footer></section>;
}

export function SecretRequestCard() {
  const [visible, setVisible] = useState(false); const [secret, setSecret] = useState(''); const [saved, setSaved] = useState(false);
  return <section className="secret-card"><div className="context-card-title"><LockKeyhole size={17}/><div><b>Add SUPABASE_SERVICE_ROLE_KEY</b><small>Demo credential request</small></div></div>{saved ? <div className="secret-saved" role="status"><Check size={14}/>Demo submission complete · value cleared</div> : <><label className="secret-label">Demo key<div><input type={visible ? 'text' : 'password'} autoComplete="off" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Use a sample value, not a real key"/><Button variant="ghost" size="icon-sm" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide secret' : 'Show secret'}>{visible ? <EyeOff size={13}/> : <Eye size={13}/>}</Button></div></label><Button variant="editorActive" size="sm" disabled={!secret.trim()} onClick={() => { setSecret(''); setSaved(true); }}><KeyRound size={13}/>Save demo secret</Button></>}<p><ShieldCheck size={13}/>Simulation only. No encrypted storage or live connection.</p></section>;
}
export function ChoiceCard({ onAnswer }: { onAnswer: (answer: string) => void }) {
  const [choice, setChoice] = useState<string | null>(null);
  return <section className="choice-card"><div className="context-card-title"><MessageCircle size={17}/><div><b>How should authentication work?</b><small>Choose an option for this prototype</small></div></div><div className="choice-options">{['Email + Password', 'Magic Link', 'Google OAuth'].map(item => <Button key={item} variant={choice === item ? 'editorActive' : 'outline'} size="sm" disabled={choice !== null} onClick={() => { setChoice(item); onAnswer(item); }}>{choice === item && <Check size={12}/>} {item}</Button>)}</div>{choice && <p role="status">Answered: <b>{choice}</b></p>}</section>;
}
export type TurnDetails = { text: string; summary: string; id: number; dbId?: string; status?: string; previewHtml?: string | null };
type StoredTurnEvent = { id: string; kind: string; label: string; detail: string | null; payload: Record<string, unknown>; diff_patch: string | null; duration_ms: number | null; created_at: string };
type StoredTurn = { status: string; error_message: string | null; provider: string | null; model: string | null; input_tokens: number | null; output_tokens: number | null; started_at: string | null; completed_at: string | null; result_payload: Record<string, unknown> | null };

export function BuildDetailsDrawer({ turn, onClose, onPreview }: { turn: TurnDetails; onClose: () => void; onPreview: () => void }) {
  const { request } = useBackend();
  const [tab, setTab] = useState<"Timeline" | "Changes" | "Output">("Timeline");
  const [events, setEvents] = useState<StoredTurnEvent[]>([]);
  const [storedTurn, setStoredTurn] = useState<StoredTurn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!turn.dbId) { setLoading(false); setError("This execution has not been saved yet."); return; }
      setLoading(true); setError(null);
      try {
        const [eventRows, turnRows] = await Promise.all([
          request<StoredTurnEvent[]>("turn_events?select=id,kind,label,detail,payload,diff_patch,duration_ms,created_at&turn_id=eq." + turn.dbId + "&order=created_at.asc"),
          request<StoredTurn[]>("chat_turns?select=status,error_message,provider,model,input_tokens,output_tokens,started_at,completed_at,result_payload&id=eq." + turn.dbId),
        ]);
        if (cancelled) return;
        setEvents(eventRows);
        setStoredTurn(turnRows[0] ?? null);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load execution details.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [turn.dbId, request]);

  const changedFiles = events.filter(event => event.kind === "edit" || event.payload?.path).map(event => ({
    path: typeof event.payload?.path === "string" ? event.payload.path : event.label,
    detail: event.detail,
    payload: event.payload,
  }));
  const output = storedTurn?.result_payload;
  return <section className="details-canvas" aria-label={"Details for turn " + turn.id}>
    <header className="details-toolbar"><Button variant="outline" size="sm" onClick={onClose}><X size={14}/> Back to latest</Button><div className="details-metrics"><span><Clock3 size={13}/>{storedTurn?.started_at ? new Date(storedTurn.started_at).toLocaleTimeString() : "Start time unavailable"}</span><span><Activity size={13}/>{storedTurn?.provider ? storedTurn.provider + (storedTurn.model ? " · " + storedTurn.model : "") : "Provider not recorded"}</span></div><h2>Execution details</h2><div className="details-tabs">{(["Timeline", "Changes", "Output"] as const).map(item => <Button key={item} variant={tab === item ? "editorActive" : "ghost"} size="sm" onClick={() => setTab(item)}>{item === "Timeline" ? <Clock3 size={13}/> : item === "Changes" ? <Code2 size={13}/> : <Terminal size={13}/>} {item}</Button>)}</div></header>
    <div className="details-content">{loading ? <p className="p-6 text-sm text-zinc-500">Loading saved execution events…</p> : error ? <p role="alert" className="m-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p> : tab === "Timeline" ? <div className="timeline-list">{events.map(event => <article className={"timeline-entry timeline-" + event.kind} key={event.id}><div className="flex items-start gap-3 p-3"><span className="timeline-icon">{event.kind === "edit" ? <FileCode2 size={14}/> : event.kind === "error" ? <Activity size={14}/> : event.kind === "output" ? <Terminal size={14}/> : <Clock3 size={14}/>}</span><span className="timeline-label"><b>{event.label}</b>{event.detail && <small>{event.detail}</small>}<small>{new Date(event.created_at).toLocaleString()}</small></span></div></article>)}{events.length === 0 && <p className="p-6 text-sm text-zinc-500">No event records were saved for this execution.</p>}</div> : tab === "Changes" ? <div className="details-changes">{changedFiles.map((item, index) => <article key={index}><FileCode2 size={14}/><div><b>{item.path}</b><small>{item.detail ?? "File operation recorded"}</small>{item.payload.size_bytes !== undefined && <small>{Number(item.payload.size_bytes).toLocaleString()} bytes saved</small>}</div></article>)}{changedFiles.length === 0 && <p className="p-6 text-sm text-zinc-500">No file-change events were recorded for this execution.</p>}</div> : <div className="details-output"><div><b>Execution status</b><span>{storedTurn?.status ?? turn.status ?? "Unknown"}</span></div><div><b>Summary</b><p>{turn.summary}</p></div><div><b>Started</b><span>{storedTurn?.started_at ? new Date(storedTurn.started_at).toLocaleString() : "Not recorded"}</span></div><div><b>Completed</b><span>{storedTurn?.completed_at ? new Date(storedTurn.completed_at).toLocaleString() : "Not completed"}</span></div><div><b>Token usage</b><span>{storedTurn?.input_tokens ?? "—"} input · {storedTurn?.output_tokens ?? "—"} output</span></div>{storedTurn?.error_message && <div role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{storedTurn.error_message}</div>}{turn.previewHtml && <Button variant="editorActive" size="sm" onClick={onPreview}>Open saved preview</Button>}{output && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">{JSON.stringify(output, null, 2)}</pre>}</div>}</div>
  </section>;
}

type ShareLinkRecord = { id: string; label: string; is_active: boolean; created_at: string; expires_at: string | null };

export function ProjectDialog({ open, onClose, projectName, projectId }: { open: boolean; onClose: () => void; projectName: string; projectId: string }) {
  const { request } = useBackend();
  const [links, setLinks] = useState<ShareLinkRecord[]>([]);
  const [lastUrl, setLastUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function loadLinks() {
    try {
      const rows = await request<ShareLinkRecord[]>("project_share_links?select=id,label,is_active,created_at,expires_at&project_id=eq." + projectId + "&order=created_at.desc");
      setLinks(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load share links.");
    }
  }

  useEffect(() => {
    if (open) { setError(null); setNotice(""); void loadLinks(); }
  }, [open, projectId]);

  async function createLink() {
    setBusy(true); setError(null); setNotice("");
    try {
      const result = await request<{ id: string; token: string; label: string; created_at: string }>("rpc/create_project_share_link", {
        method: "POST", body: JSON.stringify({ p_project_id: projectId, p_label: projectName + " preview" }),
      });
      const url = window.location.origin + "/share/" + result.token;
      setLastUrl(url);
      setNotice("A new read-only preview link was created. Copy it now; the token is only returned once.");
      await loadLinks();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create a share link.");
    } finally { setBusy(false); }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(lastUrl);
      setNotice("Share link copied.");
    } catch {
      setNotice("Clipboard access is unavailable. Select the link field and copy it manually.");
    }
  }

  async function revoke(link: ShareLinkRecord) {
    setBusy(true); setError(null);
    try {
      await request("project_share_links?id=eq." + link.id, {
        method: "PATCH", headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ is_active: false, revoked_at: new Date().toISOString() }),
      });
      setLinks(current => current.map(item => item.id === link.id ? { ...item, is_active: false } : item));
      setNotice("Share link revoked. Anyone using it will no longer be able to open the preview.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not revoke this share link.");
    } finally { setBusy(false); }
  }

  return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="editor-dialog editor-light share-dialog"><Dialog.Title>Share project preview</Dialog.Title><Dialog.Description>{projectName} · Read-only HTML preview</Dialog.Description><Dialog.Close asChild><Button variant="ghost" size="icon-sm" className="dialog-close" aria-label="Close dialog"><X size={15}/></Button></Dialog.Close><p className="text-sm leading-6 text-zinc-600">Anyone with an active link can view the latest saved self-contained preview. The link does not grant access to project files, chat history, credentials, or settings.</p><Button variant="editorActive" size="sm" disabled={busy} onClick={() => void createLink()}>{busy ? "Creating link…" : "Create new share link"}</Button>{lastUrl && <label className="form-label">New share link<div className="share-link"><input readOnly value={lastUrl} onFocus={event => event.currentTarget.select()}/><Button variant="editorActive" size="sm" onClick={() => void copyLink()}><Copy size={13}/> Copy</Button></div></label>}{error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{error}</p>}{notice && <p role="status" className="text-xs text-emerald-700">{notice}</p>}<h3 className="mt-4 text-sm font-semibold">Share links for this project</h3><div className="collaborator-list">{links.map(link => <div key={link.id}><span className="workspace-avatar">{link.is_active ? "↗" : "×"}</span><b>{link.label}</b><small>{link.is_active ? "Active" : "Revoked"} · {new Date(link.created_at).toLocaleDateString()}</small>{link.is_active && <Button variant="ghost" size="sm" disabled={busy} onClick={() => void revoke(link)}>Revoke</Button>}</div>)}{links.length === 0 && <p className="py-4 text-sm text-zinc-500">No share links created yet.</p>}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

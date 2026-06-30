"use client";

import { useState } from "react";
import { Icon } from "./Icon";

type Status = "idle" | "loading" | "ok" | "error";

// Lets a visitor get alerts by email and/or browser push, scoped to everything,
// one official, or one state.
export function SubscribeForm({
  scope = "all",
  scopeValue = null,
  label,
}: {
  scope?: "all" | "mp" | "state";
  scopeValue?: string | null;
  label?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [pushStatus, setPushStatus] = useState<Status>("idle");

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scope, scopeValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not subscribe");
      setStatus("ok");
      setMessage(
        data.demo
          ? "Saved (demo mode — email delivery activates once configured)."
          : "Subscribed! Check your inbox to confirm.",
      );
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function enablePush() {
    setPushStatus("loading");
    try {
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("Push not configured on this deployment.");
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Your browser doesn't support push.");
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Permission denied.");
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
      const res = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, scope, scopeValue }),
      });
      if (!res.ok) throw new Error("Could not save push subscription.");
      setPushStatus("ok");
    } catch (err) {
      setPushStatus("error");
      setMessage(err instanceof Error ? err.message : "Push failed");
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900 p-5 text-white">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <Icon name="bell" /> {label ?? "Get alerted on new spending data"}
      </h3>
      <p className="mt-1 text-sm text-slate-300">
        We&apos;ll notify you when fresh MPLADS records are published.
      </p>

      <form onSubmit={submitEmail} className="mt-4 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none placeholder:text-slate-500 focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Subscribe"}
        </button>
      </form>

      <button
        onClick={enablePush}
        disabled={pushStatus === "loading"}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white"
      >
        <Icon name={pushStatus === "ok" ? "check" : "device-mobile"} />
        {pushStatus === "ok" ? "Browser alerts on" : "Or enable browser alerts"}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm ${
            status === "error" || pushStatus === "error"
              ? "text-red-300"
              : "text-emerald-300"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// VAPID public keys are base64url; the Push API wants a Uint8Array.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

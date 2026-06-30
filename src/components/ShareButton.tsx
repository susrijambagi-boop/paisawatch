"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Share to the native sheet where available (mobile), otherwise reveal quick
// links for WhatsApp / X / copy — the channels Indian users actually use.
export function ShareButton({
  url,
  text,
  compact = false,
}: {
  url: string;
  text: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const absolute = url.startsWith("http")
    ? url
    : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`;

  async function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "PaisaWatch", text, url: absolute });
        return;
      } catch {
        // user cancelled or unsupported — fall through to the menu
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    await navigator.clipboard.writeText(`${text} ${absolute}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const encoded = encodeURIComponent(`${text} ${absolute}`);

  return (
    <div className="relative">
      <button
        onClick={onShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Icon name="share-2" />
        {!compact && "Share"}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          <a
            href={`https://wa.me/?text=${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name="brand-whatsapp" className="text-emerald-600" /> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name="brand-x" /> Post on X
          </a>
          <button
            onClick={copy}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name={copied ? "check" : "copy"} />
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

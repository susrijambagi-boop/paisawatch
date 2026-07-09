"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Share to the channels Indians actually use. Instagram and Snapchat have no
// web "share a link" URL, so they're reached via the native share sheet (which
// lists them on mobile), the rest are direct intents.
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

  const absolute =
    url.startsWith("http") || typeof window === "undefined"
      ? url
      : `${window.location.origin}${url}`;

  const u = encodeURIComponent(absolute);
  const t = encodeURIComponent(text);
  const tu = encodeURIComponent(`${text} ${absolute}`);

  const links: Array<{ label: string; href: string; icon: string; color?: string }> = [
    { label: "WhatsApp", href: `https://wa.me/?text=${tu}`, icon: "brand-whatsapp", color: "text-emerald-600" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, icon: "brand-x" },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: "brand-linkedin", color: "text-blue-700" },
    { label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, icon: "brand-telegram", color: "text-sky-500" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: "brand-facebook", color: "text-blue-600" },
    { label: "Email", href: `mailto:?subject=${t}&body=${tu}`, icon: "mail" },
    { label: "SMS", href: `sms:?&body=${tu}`, icon: "message-2" },
  ];

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "PaisaWatch", text, url: absolute });
        return;
      } catch {
        /* cancelled */
      }
    }
    setOpen((v) => !v);
  }

  async function copy() {
    await navigator.clipboard.writeText(`${text} ${absolute}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Icon name="share-2" />
        {!compact && "Share"}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Icon name={l.icon} className={l.color ?? "text-slate-500"} /> {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              nativeShare();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name="dots" className="text-slate-500" /> Instagram, Snapchat &amp; more…
          </button>
          <button
            onClick={copy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name={copied ? "check" : "copy"} className="text-slate-500" />
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

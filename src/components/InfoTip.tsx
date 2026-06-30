"use client";

import { useState } from "react";

// An "i" in a circle. Hover (desktop) or tap (touch) to reveal a definition.
export function InfoTip({ text, label }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label ?? "What this means"}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-400 hover:border-slate-400 hover:text-slate-600"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-1.5 w-60 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

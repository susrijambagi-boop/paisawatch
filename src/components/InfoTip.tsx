"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TIP_WIDTH = 240;

// An "i" in a circle. Hover (desktop) or tap (touch) to reveal a definition.
// The tooltip is rendered in a portal with viewport-aware positioning so it is
// never clipped by a card, table, or page edge.
export function InfoTip({ text, label }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, above: false });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  function show() {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const above = r.top > 140; // flip below when near the top of the viewport
    const left = Math.max(8, Math.min(r.left + r.width / 2 - TIP_WIDTH / 2, window.innerWidth - TIP_WIDTH - 8));
    const top = above ? r.top - 8 : r.bottom + 8;
    setPos({ top, left, above });
    setOpen(true);
  }

  return (
    <span className="inline-flex align-middle">
      <button
        ref={btnRef}
        type="button"
        aria-label={label ? `What "${label}" means` : "What this means"}
        onClick={() => (open ? setOpen(false) : show())}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="grid h-4 w-4 place-items-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none text-slate-400 hover:border-slate-400 hover:text-slate-600"
      >
        i
      </button>
      {mounted &&
        open &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: TIP_WIDTH,
              transform: pos.above ? "translateY(-100%)" : undefined,
            }}
            className="z-[9999] rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-normal leading-relaxed text-white shadow-xl"
          >
            {text}
          </span>,
          document.body,
        )}
    </span>
  );
}

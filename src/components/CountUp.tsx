"use client";

import { useEffect, useRef, useState } from "react";
import { formatCompactINR } from "@/lib/format";

type FormatKind = "compactINR" | "int";

function render(value: number, kind: FormatKind): string {
  if (kind === "compactINR") return formatCompactINR(value);
  return Math.round(value).toLocaleString("en-IN");
}

// Animates from 0 to `value` once, on mount. Respects reduced-motion.
export function CountUp({
  value,
  format = "int",
  durationMs = 900,
}: {
  value: number;
  format?: FormatKind;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(value * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, durationMs]);

  return <>{render(display, format)}</>;
}

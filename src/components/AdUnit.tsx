"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, adsEnabled } from "@/lib/ads";

interface AdUnitProps {
  /** AdSense ad-unit slot id (digits). If empty, nothing renders. */
  slot: string;
  /** AdSense format hint; "auto" is a responsive display unit. */
  format?: string;
  /** Extra classes for the outer wrapper. */
  className?: string;
}

// A single responsive AdSense display unit. Renders nothing unless a real
// publisher ID and a slot are configured, so the live site is unaffected until
// AdSense is set up. Labelled "Advertisement" per AdSense policy and for honesty.
export function AdUnit({ slot, format = "auto", className }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsEnabled || !slot || pushed.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // Script not loaded yet or blocked by an ad blocker; fail silently.
    }
  }, [slot]);

  if (!adsEnabled || !slot) return null;

  return (
    <div className={`my-6 ${className ?? ""}`}>
      <p className="mb-1 text-center text-[10px] uppercase tracking-wide text-slate-400">
        Advertisement
      </p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

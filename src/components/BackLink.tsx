"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./Icon";

// "Back" control on detail pages, returns to wherever the user came from,
// with a sensible fallback when there's no history (e.g. opened from a link).
export function BackLink({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
    >
      <Icon name="arrow-left" /> Back
    </button>
  );
}

"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

const SIZES = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-24 w-24 text-2xl",
};

const PALETTE = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-800",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
  "bg-orange-100 text-orange-800",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function MpAvatar({
  mp,
  size = "sm",
}: {
  mp: { name: string; photoUrl?: string | null };
  size?: keyof typeof SIZES;
}) {
  const [failed, setFailed] = useState(false);
  const base = `${SIZES[size]} shrink-0 rounded-full ring-1 ring-black/5 object-cover`;

  if (mp.photoUrl && !failed) {
    // Public affidavit photo, hotlinked from ADR/MyNeta with attribution; no
    // referrer sent. Falls back to initials if it fails to load.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={mp.photoUrl}
        alt={mp.name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className={base}
      />
    );
  }

  return (
    <div
      className={`${SIZES[size]} ${colorFor(mp.name)} shrink-0 rounded-full ring-1 ring-black/5 grid place-items-center font-semibold`}
      aria-hidden="true"
    >
      {initials(mp.name)}
    </div>
  );
}

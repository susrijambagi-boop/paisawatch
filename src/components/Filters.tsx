"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CATEGORY_LIST } from "@/lib/constants";
import { Icon } from "./Icon";

// Writes filter state into the URL so any view is shareable/bookmarkable.
export function Filters({ states }: { states: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  // Debounce the free-text search so we don't push on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== search) update("q", search);
    }, 300);
    return () => clearTimeout(id);
  }, [search, params, update]);

  const category = params.get("category") ?? "";
  const state = params.get("state") ?? "";
  const highOnly = params.get("minRisk") === "40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search official, vendor, place…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <select
        value={category}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="">All categories</option>
        {CATEGORY_LIST.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={state}
        onChange={(e) => update("state", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="">All states</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        onClick={() => update("minRisk", highOnly ? "" : "40")}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
          highOnly
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Icon name="coin-rupee" /> Large only
      </button>
    </div>
  );
}

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { MultiSelect } from "./MultiSelect";

const ASSET_BANDS = [
  { label: "₹1 cr+", value: "10000000" },
  { label: "₹5 cr+", value: "50000000" },
  { label: "₹10 cr+", value: "100000000" },
];
const CATEGORIES = ["GEN", "SC", "ST"];

export function MlaFilters({
  parties,
  educationLevels,
  states,
}: {
  parties: string[];
  educationLevels: string[];
  states: string[];
}) {
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

  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== search) update("q", search);
    }, 300);
    return () => clearTimeout(id);
  }, [search, params, update]);

  const csv = (key: string) => (params.get(key) ? params.get(key)!.split(",").filter(Boolean) : []);
  const val = (key: string) => params.get(key) ?? "";
  const cases = val("cases") === "1";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, constituency, state…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
        />
      </div>
      <MultiSelect label="State" options={states} selected={csv("state")} onChange={(n) => update("state", n.join(","))} />
      <MultiSelect label="Party" options={parties} selected={csv("party")} onChange={(n) => update("party", n.join(","))} />
      <MultiSelect label="Education" options={educationLevels} selected={csv("edu")} onChange={(n) => update("edu", n.join(","))} />
      <MultiSelect label="Category" options={CATEGORIES} selected={csv("cat")} onChange={(n) => update("cat", n.join(","))} />
      <select
        value={val("minAssets")}
        onChange={(e) => update("minAssets", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="">Any assets</option>
        {ASSET_BANDS.map((b) => (
          <option key={b.value} value={b.value}>{b.label}</option>
        ))}
      </select>
      <button
        onClick={() => update("cases", cases ? "" : "1")}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
          cases ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <Icon name="gavel" /> Declared cases
      </button>
      <select
        value={val("sort")}
        onChange={(e) => update("sort", e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
      >
        <option value="name">Sort: Name</option>
        <option value="assets">Sort: Assets</option>
        <option value="cases">Sort: Declared cases</option>
      </select>
    </div>
  );
}

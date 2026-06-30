"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icon";
import { MultiSelect } from "./MultiSelect";

const ASSET_BANDS = [
  { label: "₹1 cr+", value: "10000000" },
  { label: "₹5 cr+", value: "50000000" },
  { label: "₹10 cr+", value: "100000000" },
  { label: "₹50 cr+", value: "500000000" },
];
const LIAB_BANDS = [
  { label: "₹50 L+", value: "5000000" },
  { label: "₹1 cr+", value: "10000000" },
  { label: "₹5 cr+", value: "50000000" },
];
const ATT_BANDS = ["50", "75", "90"];
const NUM_BANDS = ["10", "25", "50", "100"];
const ACT_BANDS = ["25", "50", "75"];
const CATEGORIES = ["GEN", "SC", "ST"];

export function RepFilters({
  parties,
  states,
  educationLevels,
}: {
  parties: string[];
  states: string[];
  educationLevels: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [showMore, setShowMore] = useState(false);

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
  const on = (key: string) => params.get(key) === "1";
  const toggle = (key: string) => update(key, on(key) ? "" : "1");

  const Band = ({ k, label, opts }: { k: string; label: string; opts: { label: string; value: string }[] | string[] }) => (
    <select
      value={val(k)}
      onChange={(e) => update(k, e.target.value)}
      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
    >
      <option value="">{label}</option>
      {opts.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        return <option key={v} value={v}>{typeof o === "string" ? `${label.replace("Any ", "")} ${l}+` : l}</option>;
      })}
    </select>
  );

  const Toggle = ({ k, label, icon }: { k: string; label: string; icon: string }) => (
    <button
      onClick={() => toggle(k)}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
        on(k) ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon name={icon} /> {label}
    </button>
  );

  return (
    <div className="space-y-2">
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
        <MultiSelect label="Party" options={parties} selected={csv("party")} onChange={(n) => update("party", n.join(","))} />
        <MultiSelect label="State" options={states} selected={csv("state")} onChange={(n) => update("state", n.join(","))} />
        <select
          value={val("sort")}
          onChange={(e) => update("sort", e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="name">Sort: Name</option>
          <option value="assets">Sort: Assets</option>
          <option value="cases">Sort: Declared cases</option>
          <option value="attendance">Sort: Attendance</option>
          <option value="questions">Sort: Questions</option>
          <option value="activity">Sort: Activity score</option>
        </select>
        <button
          onClick={() => setShowMore((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Icon name="adjustments-horizontal" /> More filters
          <Icon name={showMore ? "chevron-up" : "chevron-down"} />
        </button>
      </div>

      {showMore && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <MultiSelect label="Education" options={educationLevels} selected={csv("edu")} onChange={(n) => update("edu", n.join(","))} />
          <MultiSelect label="Category" options={CATEGORIES} selected={csv("cat")} onChange={(n) => update("cat", n.join(","))} />
          <Band k="minAssets" label="Any assets" opts={ASSET_BANDS} />
          <Band k="minLiab" label="Any debt" opts={LIAB_BANDS} />
          <Band k="minAtt" label="Any attendance" opts={ATT_BANDS} />
          <Band k="minQ" label="Any questions" opts={NUM_BANDS} />
          <Band k="minDeb" label="Any debates" opts={NUM_BANDS} />
          <Band k="minAct" label="Any score" opts={ACT_BANDS} />
          <Toggle k="cases" label="Declared cases" icon="gavel" />
          <Toggle k="clean" label="Clean record" icon="shield-check" />
          <Toggle k="networth" label="Positive net worth" icon="trending-up" />
          <Toggle k="prs" label="Has track record" icon="chart-bar" />
        </div>
      )}
    </div>
  );
}

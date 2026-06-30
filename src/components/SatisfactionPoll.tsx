"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import type { PollTally } from "@/lib/polls";

// Citizen satisfaction poll. One vote per device (localStorage) + server-side
// rate limit. Clearly an unscientific, self-selected public poll, not a survey.
export function SatisfactionPoll({ subject }: { subject: string }) {
  const storageKey = `pw-vote-${subject}`;
  const [tally, setTally] = useState<PollTally | null>(null);
  const [voted, setVoted] = useState<"satisfied" | "dissatisfied" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setVoted((localStorage.getItem(storageKey) as "satisfied" | "dissatisfied" | null) ?? null);
    fetch(`/api/poll?subject=${encodeURIComponent(subject)}`)
      .then((r) => r.json())
      .then((d) => setTally(d.tally))
      .catch(() => {});
  }, [subject, storageKey]);

  async function vote(satisfied: boolean) {
    if (voted || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, satisfied }),
      });
      const data = await res.json();
      if (res.ok) {
        setTally(data.tally);
        const choice = satisfied ? "satisfied" : "dissatisfied";
        setVoted(choice);
        localStorage.setItem(storageKey, choice);
      }
    } finally {
      setBusy(false);
    }
  }

  const score = tally?.score ?? 0;
  const tone = score >= 60 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  const bar = score >= 60 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon name="mood-smile" /> Are citizens satisfied?
      </h2>

      <div className="mt-3 flex items-end gap-3">
        <div className={`text-4xl font-semibold ${tone}`}>{score}%</div>
        <div className="pb-1 text-xs text-slate-500">
          satisfied · {(tally?.total ?? 0).toLocaleString("en-IN")} vote
          {tally?.total === 1 ? "" : "s"}
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${score}%` }} />
      </div>

      {voted ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Icon name="check" className="text-emerald-600" /> You voted&nbsp;
          <span className="font-medium">{voted === "satisfied" ? "satisfied" : "not satisfied"}</span>.
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => vote(true)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <Icon name="thumb-up" /> Satisfied
          </button>
          <button
            onClick={() => vote(false)}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            <Icon name="thumb-down" /> Not satisfied
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">
        An unscientific, self-selected public poll (one vote per device) — a measure of opinion here,
        not a representative survey of the constituency.
      </p>
    </section>
  );
}

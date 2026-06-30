"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { timeAgo } from "@/lib/format";
import type { Comment } from "@/lib/comments";

// Public discussion thread for a state's spending. Comments are about the
// state's MPLADS spending, not individuals.
export function Comments({ stateSlug, stateName }: { stateSlug: string; stateName: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/comments?state=${encodeURIComponent(stateSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setComments(d.comments ?? []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [stateSlug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stateSlug, author, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post");
      setComments((prev) => [data.comment, ...prev]);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
        <Icon name="message-2" /> Discussion
        {comments.length > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            {comments.length}
          </span>
        )}
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        Public and moderated. Discuss {stateName}&apos;s spending — keep it civil
        and factual.
      </p>

      <form onSubmit={submit} className="mb-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts on this spending…"
          maxLength={600}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-slate-400">{body.length}/600</span>
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      {loading ? (
        <p className="text-sm text-slate-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{c.author}</span>
                <span>·</span>
                <span>{timeAgo(c.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

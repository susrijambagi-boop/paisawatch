import { getAnonClient, getServiceClient, isSupabaseConfigured } from "./supabase";

// Public comments on a state's spending. Stored in Supabase when configured;
// otherwise kept in a process-local store so the feature is demonstrable in
// development (not durable across serverless instances, production needs the
// database).

export interface Comment {
  id: string;
  stateSlug: string;
  author: string;
  body: string;
  createdAt: string;
}

const MAX_BODY = 600;
const MAX_AUTHOR = 60;

// Dev/demo fallback store.
const memory: Comment[] = [];

export interface NewComment {
  stateSlug: string;
  author: string;
  body: string;
}

export function sanitiseComment(input: NewComment): NewComment | null {
  const author = input.author.trim().slice(0, MAX_AUTHOR) || "Anonymous";
  const body = input.body.trim().slice(0, MAX_BODY);
  const stateSlug = input.stateSlug.trim();
  if (!body || !stateSlug) return null;
  return { author, body, stateSlug };
}

export async function getComments(stateSlug: string): Promise<Comment[]> {
  const client = getAnonClient();
  if (isSupabaseConfigured() && client) {
    const { data, error } = await client
      .from("comments")
      .select("*")
      .eq("state_slug", stateSlug)
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) {
      return data.map((row) => ({
        id: String(row.id),
        stateSlug: String(row.state_slug),
        author: String(row.author),
        body: String(row.body),
        createdAt: String(row.created_at),
      }));
    }
  }
  return memory
    .filter((c) => c.stateSlug === stateSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addComment(
  input: NewComment,
): Promise<{ ok: boolean; comment?: Comment; error?: string }> {
  const clean = sanitiseComment(input);
  if (!clean) return { ok: false, error: "Comment cannot be empty." };

  const client = getServiceClient();
  if (client) {
    const { data, error } = await client
      .from("comments")
      .insert({ state_slug: clean.stateSlug, author: clean.author, body: clean.body })
      .select("*")
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "Could not save." };
    return {
      ok: true,
      comment: {
        id: String(data.id),
        stateSlug: String(data.state_slug),
        author: String(data.author),
        body: String(data.body),
        createdAt: String(data.created_at),
      },
    };
  }

  const comment: Comment = {
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    stateSlug: clean.stateSlug,
    author: clean.author,
    body: clean.body,
    createdAt: new Date().toISOString(),
  };
  memory.unshift(comment);
  return { ok: true, comment };
}

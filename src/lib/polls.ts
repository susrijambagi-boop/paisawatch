import { getAnonClient, getServiceClient, isSupabaseConfigured } from "./supabase";

// Citizen satisfaction poll per representative. A simple Satisfied / Not
// satisfied vote; the "score" is the share that voted satisfied. This is an
// unscientific, self-selected public poll — NOT a verified survey — and is
// labelled as such in the UI. Stored in Supabase when configured, otherwise a
// process-local store for development.

export interface PollTally {
  satisfied: number;
  dissatisfied: number;
  total: number;
  score: number; // 0..100, % satisfied (0 when no votes)
}

function toTally(satisfied: number, dissatisfied: number): PollTally {
  const total = satisfied + dissatisfied;
  return { satisfied, dissatisfied, total, score: total ? Math.round((satisfied / total) * 100) : 0 };
}

// Dev/demo fallback store: subject -> [satisfiedCount, dissatisfiedCount].
const memory = new Map<string, [number, number]>();

export async function getTally(subject: string): Promise<PollTally> {
  const client = getAnonClient();
  if (isSupabaseConfigured() && client) {
    const { data, error } = await client.from("poll_votes").select("satisfied").eq("subject", subject);
    if (!error && data) {
      const sat = data.filter((r) => r.satisfied).length;
      return toTally(sat, data.length - sat);
    }
  }
  const [s, d] = memory.get(subject) ?? [0, 0];
  return toTally(s, d);
}

export async function addVote(
  subject: string,
  satisfied: boolean,
): Promise<{ ok: boolean; tally: PollTally; error?: string }> {
  const client = getServiceClient();
  if (client) {
    const { error } = await client.from("poll_votes").insert({ subject, satisfied });
    if (error) return { ok: false, tally: await getTally(subject), error: error.message };
    return { ok: true, tally: await getTally(subject) };
  }
  const [s, d] = memory.get(subject) ?? [0, 0];
  memory.set(subject, satisfied ? [s + 1, d] : [s, d + 1]);
  return { ok: true, tally: await getTally(subject) };
}

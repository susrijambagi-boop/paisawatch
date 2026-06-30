import { NextResponse } from "next/server";
import { z } from "zod";
import { addVote, getTally } from "@/lib/polls";
import { rateLimit, clientIp } from "@/lib/moderation";

export async function GET(request: Request) {
  const subject = new URL(request.url).searchParams.get("subject");
  if (!subject) return NextResponse.json({ error: "Missing subject" }, { status: 400 });
  return NextResponse.json({ tally: await getTally(subject) });
}

const schema = z.object({
  subject: z.string().min(1),
  satisfied: z.boolean(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const limited = rateLimit(`poll:${clientIp(request)}`);
  if (!limited.ok) {
    return NextResponse.json({ error: limited.reason }, { status: 429 });
  }

  const result = await addVote(parsed.data.subject, parsed.data.satisfied);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not record vote" }, { status: 500 });
  }
  return NextResponse.json({ tally: result.tally });
}

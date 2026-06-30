import { NextResponse } from "next/server";
import { z } from "zod";
import { addComment, getComments } from "@/lib/comments";
import { moderateContent, rateLimit, clientIp } from "@/lib/moderation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  if (!state) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }
  const comments = await getComments(state);
  return NextResponse.json({ comments });
}

const schema = z.object({
  stateSlug: z.string().min(1),
  author: z.string().max(60).optional().default("Anonymous"),
  body: z.string().min(1).max(600),
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
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  const limited = rateLimit(clientIp(request));
  if (!limited.ok) {
    return NextResponse.json({ error: limited.reason }, { status: 429 });
  }
  const moderation = moderateContent(parsed.data.body);
  if (!moderation.ok) {
    return NextResponse.json({ error: moderation.reason }, { status: 422 });
  }

  const result = await addComment(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ comment: result.comment });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailSubscription } from "@/lib/data";

const schema = z.object({
  email: z.string().email(),
  scope: z.enum(["all", "mp", "state"]).default("all"),
  scopeValue: z.string().nullable().optional(),
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
    return NextResponse.json({ error: "Invalid email or fields" }, { status: 400 });
  }

  const { email, scope, scopeValue } = parsed.data;
  const result = await createEmailSubscription({
    email,
    scope,
    scopeValue: scopeValue ?? null,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not subscribe" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, demo: result.demo });
}

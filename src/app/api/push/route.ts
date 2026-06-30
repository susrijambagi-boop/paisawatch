import { NextResponse } from "next/server";
import { z } from "zod";
import { savePushSubscription } from "@/lib/data";

// GET — hand the browser the VAPID public key (or signal push is unconfigured).
export async function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  return NextResponse.json({ configured: true, publicKey: key });
}

const schema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string(), auth: z.string() }),
  }),
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
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { subscription, scope, scopeValue } = parsed.data;
  const result = await savePushSubscription(subscription, scope, scopeValue ?? null);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Could not save" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, demo: result.demo });
}

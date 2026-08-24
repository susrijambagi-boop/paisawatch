import { ADSENSE_PUB_ID, adsEnabled } from "@/lib/ads";

// Serves /ads.txt. Google requires this file to authorise AdSense to sell ads on
// the domain. Built from the env publisher ID so it can never drift out of sync.
// Until a publisher ID is set, returns a harmless comment (no invalid record).
export function GET(): Response {
  const body = adsEnabled
    ? `google.com, ${ADSENSE_PUB_ID}, DIRECT, f08c47fec0942fa0\n`
    : "# ads.txt: set NEXT_PUBLIC_ADSENSE_CLIENT to publish an AdSense record\n";

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}

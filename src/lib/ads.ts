// Google AdSense configuration, entirely env-driven so nothing is hardcoded and
// the site renders zero ad markup until a real publisher ID is supplied. After
// AdSense approves the site, set these in the environment (and on Vercel):
//
//   NEXT_PUBLIC_ADSENSE_CLIENT          e.g. ca-pub-1234567890123456
//   NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT  a display ad-unit slot id (digits)
//   NEXT_PUBLIC_ADSENSE_SLOT_FOOTER     a display ad-unit slot id (digits)

export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

// The bare publisher number (pub-XXXX), used by ads.txt.
export const ADSENSE_PUB_ID = ADSENSE_CLIENT.replace(/^ca-/, "");

export const adsEnabled = /^ca-pub-\d+$/.test(ADSENSE_CLIENT);

export const AD_SLOTS = {
  inContent: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT ?? "",
  footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER ?? "",
} as const;

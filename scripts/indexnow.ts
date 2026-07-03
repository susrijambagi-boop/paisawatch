// Pings IndexNow (Bing, Yandex, and downstream Copilot/ChatGPT search) so key
// pages get re-crawled quickly. The key is proven by hosting <key>.txt at the
// site root (public/). Run: npx tsx scripts/indexnow.ts

const KEY = "add1222dcc0970ae99179f0855f35b79";
const HOST = "www.paisawatch.live";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const PATHS = ["", "/feed", "/map", "/tools", "/reps", "/mlas", "/officials", "/transparency", "/about"];

async function main() {
  const urlList = PATHS.map((p) => `https://${HOST}${p}`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
  if (!res.ok) console.log(await res.text());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

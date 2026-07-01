import "server-only";

// Server-only guarded re-export. The implementation lives in mplads-core.ts so
// it can also run in the vendor script (scripts/fetch-mplads.ts). The app reads
// vendored data (src/data/mplads.json) via lib/data.ts; this remains available
// for any server-side on-demand refresh.
export { fetchMpladsRecords } from "./mplads-core";

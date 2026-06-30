import { ImageResponse } from "next/og";

// Dynamic social share card. Referenced from page metadata (see mp/[slug]).
// e.g. /api/og?name=...&sub=...&amount=...
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "PaisaWatch";
  const sub = searchParams.get("sub") ?? "India's public money, in your pocket";
  const amount = searchParams.get("amount") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f172a",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            ₹
          </div>
          <div style={{ fontSize: 32, fontWeight: 600 }}>PaisaWatch</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
          <div style={{ fontSize: 32, color: "#94a3b8", marginTop: 12 }}>{sub}</div>
          {amount && (
            <div style={{ fontSize: 48, color: "#34d399", marginTop: 28, fontWeight: 600 }}>
              {`${amount} tracked`}
            </div>
          )}
        </div>

        <div style={{ fontSize: 26, color: "#64748b" }}>
          Follow public spending. Get alerted. Share the receipts.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

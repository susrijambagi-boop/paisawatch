import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About & methodology",
  description: "How PaisaWatch sources its MPLADS spending data.",
};

export default function AboutPage() {
  return (
    <div className="prose-sm max-w-none space-y-6 text-slate-700">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          About {SITE.name}
        </h1>
        <p className="mt-2 text-sm">
          {SITE.name} makes it easy for any citizen to see how MPLADS public-works
          money is spent across India — by state and by sector. Follow a state,
          filter the feed, view the spending map, and share what you find.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Where the data comes from</h2>
        <p className="mt-2 text-sm">
          The live feed uses official MPLADS (Members of Parliament Local Area
          Development Scheme) data published on{" "}
          <a className="text-emerald-700 underline" href="https://www.data.gov.in" target="_blank" rel="noopener noreferrer">data.gov.in</a>{" "}
          by the Ministry of Statistics &amp; Programme Implementation. Two
          datasets are combined:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>State-wise MPLADS expenditure (₹ crore) and completed works, FY2016-17 to FY2019-20.</li>
          <li>Sector-wise split of sanctioned works (roads, education, drinking water, sanitation &amp; health, public facilities, others).</li>
        </ul>
        <p className="mt-2 text-sm">
          India does not publish a per-MP, transaction-level spending API, so the
          live data is at state and sector level. Per-MP works data exists on the
          <a className="text-emerald-700 underline" href="https://mplads.gov.in" target="_blank" rel="noopener noreferrer"> MPLADS portal</a>{" "}
          but is not offered as an open API.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">How the numbers are built</h2>
        <p className="mt-2 text-sm">
          Each state&apos;s <strong>total</strong> expenditure is the official
          reported figure. The <strong>per-sector</strong> amount applies that
          state&apos;s reported sector mix to its total — so state totals are
          exact, while the split within a state is a disclosed derivation. The
          &ldquo;small / medium / large&rdquo; label is purely the rupee size of
          a line item; it is <strong>not</strong> a judgement of merit or any
          allegation of wrongdoing.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Corrections</h2>
        <p className="mt-2 text-sm">
          The linked source is always authoritative. If a figure looks wrong,
          check data.gov.in; we aim to correct verified errors quickly.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Who built this</h2>
        <p className="mt-2 text-sm">
          This is a tool built by <strong>Vinod Ashok Chinnannavar</strong> — an independent civic
          project to make India&apos;s public data easier for any citizen to read.
        </p>
      </section>
    </div>
  );
}

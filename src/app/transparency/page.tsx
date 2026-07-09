import type { Metadata } from "next";
import { getRepStats } from "@/lib/reps";
import { getMlaStats } from "@/lib/mlas";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Why this data is incomplete",
  description:
    "What's missing from India's public records on its elected representatives, why that opacity exists, why it matters for democracy, and how to read the data responsibly.",
};

function Coverage({ label, have, total, note }: { label: string; have: number; total: number; note: string }) {
  const pct = Math.round((have / total) * 100);
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {have.toLocaleString("en-IN")}
        <span className="text-base font-normal text-slate-400"> / {total.toLocaleString("en-IN")}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}

export default function TransparencyPage() {
  const ls = getRepStats().total;
  const mla = getMlaStats().total;

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-slate-700">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Why this data is incomplete, and why that matters
        </h1>
        <p className="mt-2 text-sm leading-7">
          Everything on PaisaWatch is real and links to its source. But it is not complete, and the
          gaps are not an accident of this project. They are the visible edge of how hard it is to
          see what India&apos;s elected representatives declare, earn, and do with public money. This
          page explains, plainly, what is missing, why, and how to read what remains.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">The honest coverage, right now</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Coverage label="Lok Sabha (lower house)" have={ls} total={543} note="The rest have no published affidavit analysis." />
          <Coverage label="Rajya Sabha (upper house)" have={0} total={245} note="No open, machine-readable per-member record exists." />
          <Coverage label="MLAs (state assemblies)" have={mla} total={4120} note="Across 28 states + 3 UTs; rest are unanalysed." />
        </div>
        <p className="mt-3 text-sm leading-7">
          The missing people are not hidden by choice. They are precisely the ones for whom no
          verifiable public record could be found, so we list a coverage count rather than invent
          their numbers.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Why the data is incomplete</h2>
        <ul className="space-y-3 text-sm leading-7">
          <li className="flex gap-3">
            <Icon name="puzzle" className="mt-1 shrink-0 text-slate-400" />
            <span>
              <strong>There is no single source of truth.</strong> Spending, affidavits, attendance and
              rosters live on different portals, run by different bodies, in different formats, for
              different years. Assembling one honest picture means stitching a dozen incompatible
              systems together.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="users" className="mt-1 shrink-0 text-slate-400" />
            <span>
              <strong>Coverage depends on a non-profit doing the state&apos;s job.</strong> The asset,
              liability and case figures come from a civic group manually reading scanned nomination
              affidavits. Where an affidavit is missing or illegible, that person simply isn&apos;t
              analysed, which is why the count is {ls} of 543, not all 543.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="lock" className="mt-1 shrink-0 text-slate-400" />
            <span>
              <strong>The upper house is a near-blackout.</strong> Rajya Sabha members file affidavits
              too, but no open, per-member, machine-readable version exists. The official portal&apos;s
              data sits behind an access-gated interface; the government open-data roster is from 2016;
              a leading tracker renders its list only in JavaScript; and the crowd-sourced encyclopaedia
              was inaccurate, its table mislabelled sitting members&apos; parties. None met a
              100%-accuracy bar, so the upper house stays empty rather than wrong.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="chart-bar" className="mt-1 shrink-0 text-slate-400" />
            <span>
              <strong>Spending is aggregate, not itemised.</strong> India publishes local-area
              development spending by state and sector, not what each individual representative spent,
              line by line. State MLA funds aren&apos;t published as open data at all.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="file-pencil" className="mt-1 shrink-0 text-slate-400" />
            <span>
              <strong>What exists is self-declared.</strong> Assets, liabilities and pending cases come
              from the candidate&apos;s own affidavit. A &ldquo;pending case&rdquo; is a charge, not a
              conviction. Declared assets are what was disclosed on a date, not independently audited.
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Why this counts as opacity</h2>
        <p className="text-sm leading-7">
          Data that exists on paper but can&apos;t be read at scale isn&apos;t truly public. A PDF behind
          a login, a table only a browser can render, a roster frozen in 2016, each is technically
          &ldquo;available&rdquo; and practically useless to a voter, a journalist or a researcher.
          Fragmentation is itself a form of secrecy: when the truth is scattered across incompatible
          systems, only those with the time, skill and money to assemble it can see it. Transparency
          that requires a data engineer is not transparency for everyone. And a system that trusts
          what officials declare about themselves, with little public means to verify, shifts the
          burden of proof onto the citizen.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Why opaqueness is bad for democracy</h2>
        <ul className="space-y-3 text-sm leading-7">
          <li className="flex gap-3">
            <Icon name="checkbox" className="mt-1 shrink-0 text-emerald-600" />
            <span>
              <strong>A vote without information is a guess.</strong> Elections only do their job when
              voters can see who they&apos;re choosing, declared wealth, pending cases, attendance, how
              public money is used. Remove the information and consent of the governed becomes consent
              in the dark.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="sun" className="mt-1 shrink-0 text-emerald-600" />
            <span>
              <strong>Sunlight deters misuse.</strong> The expectation of being seen changes behaviour.
              Where records are hard to find, the incentive to cut corners grows, and the cost of
              hiding is paid by the people who can least afford to dig.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="scale" className="mt-1 shrink-0 text-emerald-600" />
            <span>
              <strong>Opacity protects power and burdens the public.</strong> When accountability data
              is locked away, the advantage goes to whoever wants to avoid scrutiny.
            </span>
          </li>
          <li className="flex gap-3">
            <Icon name="heart-handshake" className="mt-1 shrink-0 text-emerald-600" />
            <span>
              <strong>Trust erodes in the dark.</strong> When citizens can&apos;t verify, rumour fills
              the gap, and a democracy that runs on rumour instead of records is a fragile one.
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">How to read this data responsibly</h2>
        <div className="space-y-3 rounded-2xl bg-white p-5 text-sm leading-7 ring-1 ring-slate-200">
          <p><strong>&ldquo;Pending case&rdquo; is not guilt.</strong> It is a declared, unresolved legal matter, context, not a verdict. Open the source before drawing a conclusion.</p>
          <p><strong>&ldquo;Declared assets&rdquo; is not audited wealth.</strong> It is self-reported, on a date, for one nomination.</p>
          <p><strong>&ldquo;Analysed&rdquo; is not &ldquo;all.&rdquo;</strong> {ls} of 543 means 58 people have no published affidavit, not that they are clean, and not that they are guilty.</p>
          <p><strong>Big numbers aren&apos;t scandals by themselves.</strong> A large state spends large sums. Size is not wrongdoing, look at what the money bought and whether it was tendered.</p>
          <p><strong>Performance metrics are partial.</strong> Attendance and questions measure presence and activity, not the quality or impact of someone&apos;s work.</p>
          <p><strong>Cross-check before you conclude.</strong> One figure is a starting point. Follow the source link, compare across years, and read past the headline number.</p>
          <p><strong>Absence of data is data too.</strong> When a seat can&apos;t be filled with verifiable facts, that gap is itself worth noticing, and worth asking why.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">What better would look like</h2>
        <p className="text-sm leading-7">
          A single, official, machine-readable, regularly-updated public register, every elected
          representative, both houses and every assembly, with declared assets, pending cases,
          attendance, and the itemised use of public funds, downloadable by anyone, free, forever.
          Until that exists, tools like this one assemble what is public and flag, honestly, what
          is not. The gaps on this page are the work that&apos;s left for our institutions to do.
        </p>
      </section>
    </div>
  );
}

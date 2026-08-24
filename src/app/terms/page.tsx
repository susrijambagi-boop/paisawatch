import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using PaisaWatch: data accuracy, no warranty, not professional advice, acceptable use, and limitation of liability.",
};

export default function TermsPage() {
  return (
    <div className="prose-sm mx-auto max-w-3xl space-y-6 text-slate-700">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm">Last updated: July 2026</p>
        <p className="mt-2 text-sm">
          By using {SITE.name} you agree to these terms. If you do not agree, please
          do not use the site.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">What this service is</h2>
        <p className="mt-2 text-sm">
          {SITE.name} is a free, non-partisan tool that aggregates official public
          records, such as MPLADS public-works spending and the election affidavits
          of elected representatives, and presents them in a readable form. It is an
          information service, not a government website.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Accuracy and no warranty</h2>
        <p className="mt-2 text-sm">
          We link every figure to its official source and aim to be accurate, but the
          site is provided as is, without warranty of any kind. Please keep in mind:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Affidavit figures are self-declared by candidates and are not independently audited.</li>
          <li>A declared pending case is a charge, not a conviction, and is not an allegation of guilt.</li>
          <li>The rupee size of a spend is a magnitude only, never a judgement of merit or wrongdoing.</li>
          <li>Where a verifiable record could not be found, we say so rather than guess.</li>
          <li>The linked official source is always authoritative. If a figure looks wrong, check the source.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Not professional advice</h2>
        <p className="mt-2 text-sm">
          The calculators (tax, EMI, investment, inflation and similar) produce rough
          estimates for general understanding only. They are not financial, tax,
          investment or legal advice. For decisions that matter, consult a qualified
          professional.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Acceptable use</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Do not use the site for any unlawful purpose or to harass any person.</li>
          <li>
            Comments must be civil and lawful. Do not post defamatory content, private
            personal information, or spam. We may remove content and block abuse.
          </li>
          <li>Do not attempt to disrupt, overload or scrape the service in a way that harms it.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Intellectual property</h2>
        <p className="mt-2 text-sm">
          The underlying public data belongs to its official sources. The site&apos;s
          design, code and original text are the work of the project. You may link to
          and share pages freely. When you quote a figure, please cite the official
          source we link to.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Third-party links and ads</h2>
        <p className="mt-2 text-sm">
          The site links to external official sources and may display third-party ads.
          We are not responsible for the content or practices of external sites and
          advertisers. See our{" "}
          <a className="text-emerald-700 underline" href="/privacy">Privacy Policy</a>{" "}
          for how advertising cookies work.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Limitation of liability</h2>
        <p className="mt-2 text-sm">
          To the extent permitted by law, {SITE.name} and its maker are not liable for
          any loss arising from use of, or reliance on, the site or its data. You use
          the information at your own judgement, and the linked source remains the
          authoritative record.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Changes and contact</h2>
        <p className="mt-2 text-sm">
          We may update these terms from time to time; the date at the top shows when
          they last changed. These terms are governed by the laws of India. Questions
          can be sent to{" "}
          <a className="text-emerald-700 underline" href="mailto:vinodachere@gmail.com">vinodachere@gmail.com</a>.
        </p>
      </section>
    </div>
  );
}

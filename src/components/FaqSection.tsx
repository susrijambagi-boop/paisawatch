import { JsonLd } from "./JsonLd";
import { FAQS } from "@/data/faq";

// Visible FAQ + FAQPage structured data. Answers stay in the DOM (inside
// <details>) so crawlers and answer engines can read them.
export function FaqSection() {
  return (
    <section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <h2 className="text-lg font-semibold text-slate-900">Frequently asked questions</h2>
      <div className="mt-3 divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
        {FAQS.map((f) => (
          <details key={f.q} className="group px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-slate-800 marker:content-none">
              {f.q}
              <span className="shrink-0 text-slate-400 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

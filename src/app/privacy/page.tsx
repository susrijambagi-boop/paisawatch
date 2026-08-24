import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PaisaWatch handles data: analytics, advertising cookies, comments, polls and email, and your rights under India's DPDP Act.",
};

export default function PrivacyPage() {
  return (
    <div className="prose-sm mx-auto max-w-3xl space-y-6 text-slate-700">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm">Last updated: July 2026</p>
        <p className="mt-2 text-sm">
          {SITE.name} is a free, non-partisan civic tool. This policy explains what
          data the site collects, why, and the choices you have. We keep data
          collection to the minimum needed to run the site.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">No account needed</h2>
        <p className="mt-2 text-sm">
          You can browse everything on {SITE.name} without signing up, logging in or
          giving us your name. We do not create user profiles.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Analytics</h2>
        <p className="mt-2 text-sm">
          We use Vercel Analytics and Google Analytics to understand aggregate usage,
          for example which pages are popular and roughly where visitors come from.
          These tools may set cookies or read device information. The data is used in
          aggregate to improve the site, not to identify you personally.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Advertising</h2>
        <p className="mt-2 text-sm">
          {SITE.name} may display ads served by Google, through Google AdSense.
          Third-party vendors, including Google, use cookies and similar
          technologies to serve ads based on your prior visits to this and other
          websites. Google&apos;s use of advertising cookies enables it and its
          partners to serve ads to you based on your visits.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            You can opt out of personalised advertising by visiting{" "}
            <a className="text-emerald-700 underline" href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </li>
          <li>
            You can opt out of some third-party vendors&apos; use of cookies at{" "}
            <a className="text-emerald-700 underline" href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a>.
          </li>
          <li>You can also block or delete cookies in your browser settings at any time.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Comments, polls and email</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>
            <strong>Comments:</strong> text you post is stored and shown publicly.
            Please do not include personal or sensitive information in a comment.
          </li>
          <li>
            <strong>Polls:</strong> satisfaction polls allow one vote per device and
            record only the vote, not your identity.
          </li>
          <li>
            <strong>Email:</strong> if you choose to subscribe for updates, we store
            your email address only to send those updates. You can unsubscribe at any
            time and we will delete it.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Who we share data with</h2>
        <p className="mt-2 text-sm">
          We do not sell your personal data. Data is processed by the service
          providers that run the site: Vercel (hosting and analytics), Google
          (analytics and advertising), and, if you subscribe, our email delivery
          provider. Each processes data under its own privacy terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
        <p className="mt-2 text-sm">
          Under India&apos;s Digital Personal Data Protection Act and similar laws,
          you can ask us to access, correct or delete any personal data you have
          given us, such as a subscription email or a comment. Contact us and we will
          act on reasonable requests.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Children</h2>
        <p className="mt-2 text-sm">
          {SITE.name} is a general-audience civic information site and is not directed
          at children.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
        <p className="mt-2 text-sm">
          Questions about this policy or your data can be sent to{" "}
          <a className="text-emerald-700 underline" href="mailto:vinodachere@gmail.com">vinodachere@gmail.com</a>.
          We may update this policy from time to time; the date at the top shows when
          it last changed.
        </p>
      </section>
    </div>
  );
}

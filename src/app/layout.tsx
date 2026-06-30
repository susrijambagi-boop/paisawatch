import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const GA_ID = "G-YHVF851S2P";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3/dist/tabler-icons.min.css"
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                name: SITE.name,
                url: siteUrl,
                description: SITE.description,
                inLanguage: "en-IN",
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${siteUrl}/reps?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@type": "Organization",
                name: SITE.name,
                url: siteUrl,
                description: SITE.description,
                founder: { "@type": "Person", name: "Vinod Ashok Chinnannavar" },
                areaServed: "IN",
              },
            ],
          }}
        />
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-6 text-xs text-slate-500">
            <p>
              {SITE.name} aggregates official MPLADS public-works data
              (data.gov.in / MoSPI) so citizens can follow how public money is
              used. State totals are official; per-sector amounts apply each
              state&apos;s reported mix. &ldquo;Spend size&rdquo; reflects rupee
              amount only — never a judgement. Always check the linked source.
            </p>
            <p className="mt-3 font-medium text-slate-600">
              A tool built by Vinod Ashok Chinnannavar.
            </p>
          </div>
        </footer>
        <Analytics />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}

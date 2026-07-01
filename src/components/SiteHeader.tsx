import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Icon } from "./Icon";

const NAV = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/feed", label: "Feed", icon: "news" },
  { href: "/map", label: "Map", icon: "map-2" },
  { href: "/tools", label: "Calculators", icon: "calculator" },
  { href: "/reps", label: "MPs", icon: "users" },
  { href: "/mlas", label: "MLAs", icon: "user-star" },
  { href: "/officials", label: "States", icon: "map-pin" },
  { href: "/transparency", label: "Coverage", icon: "alert-triangle" },
  { href: "/about", label: "About", icon: "info-circle" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 font-bold text-white">
            ₹
          </span>
          <span className="text-lg font-semibold tracking-tight">{SITE.name}</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon name={item.icon} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

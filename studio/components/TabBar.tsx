"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/sites", label: "Sites", match: (p: string) => p.startsWith("/sites") && !p.startsWith("/sites/new") },
  { href: "/sites/new", label: "New", match: (p: string) => p.startsWith("/sites/new") },
  { href: "/account", label: "Account", match: (p: string) => p.startsWith("/account") },
];

export function TabBar() {
  const pathname = usePathname();
  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/s/") ||
    pathname.startsWith("/preview/")
  ) {
    return null;
  }

  return (
    <nav className="glass-bar fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-3 pt-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium ${
                active ? "text-[var(--blue)]" : "text-[var(--secondary)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

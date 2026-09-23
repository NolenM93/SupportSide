"use client";

import Link from "next/link";
import type { SiteRecord } from "@/lib/site/types";

export function SitesHome({ sites }: { sites: SiteRecord[] }) {
  return (
    <div className="tab-safe mx-auto w-full max-w-lg px-5 pt-4">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-[var(--secondary)]">Support Side</p>
          <h1 className="large-title mt-1">Sites</h1>
        </div>
        <Link href="/sites/new" className="ios-btn px-4 py-2 text-sm">
          New
        </Link>
      </header>

      {sites.length === 0 ? (
        <div className="glass-card rounded-[24px] p-6">
          <h2 className="text-xl font-semibold">Describe the business</h2>
          <p className="mt-2 text-[var(--secondary)]">
            We generate a one-page site. You keep prompting the design — colors, cards, spacing —
            then publish. We host it.
          </p>
          <Link href="/sites/new" className="ios-btn mt-5 w-full">
            Create a site
          </Link>
        </div>
      ) : (
        <div className="grouped-list">
          {sites.map((site) => (
            <Link key={site.id} href={`/sites/${site.id}`} className="grouped-row">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{site.name}</div>
                <div className="text-sm text-[var(--secondary)]">
                  {site.published ? "Live" : "Draft"} · /s/{site.slug}
                </div>
              </div>
              <span className="text-[var(--tertiary)]">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

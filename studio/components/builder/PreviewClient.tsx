"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteView } from "@/components/site/SiteView";
import type { SiteContent } from "@/lib/site/types";

const FRAMES = [
  { id: "desktop", label: "Desktop", width: 1100 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "mobile", label: "Phone", width: 390 },
] as const;

export function PreviewClient({
  site,
  backHref,
}: {
  site: SiteContent;
  backHref: string;
}) {
  const [frame, setFrame] = useState<(typeof FRAMES)[number]["id"]>("desktop");
  const width = FRAMES.find((f) => f.id === frame)?.width ?? 1100;

  return (
    <div className="tab-safe flex min-h-dvh flex-col">
      <header className="glass-nav flex items-center justify-between px-4 py-3">
        <Link href={backHref} className="text-sm font-semibold text-[var(--blue)]">
          Back
        </Link>
        <div className="segmented">
          {FRAMES.map((f) => (
            <button key={f.id} type="button" data-active={frame === f.id} onClick={() => setFrame(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="w-12" />
      </header>
      <div className="flex flex-1 justify-center overflow-auto bg-[#d6d3d1] p-6">
        <div
          className="overflow-hidden rounded-[24px] bg-white shadow-2xl"
          style={{ width, maxWidth: "100%" }}
        >
          <SiteView site={site} />
        </div>
      </div>
    </div>
  );
}

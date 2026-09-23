"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SiteRecord } from "@/lib/site/types";

export function NewSiteForm() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = (await res.json()) as { site?: SiteRecord; error?: string };
    setBusy(false);
    if (!data.site) {
      setError(data.error ?? "Could not generate the site.");
      return;
    }
    router.push(`/sites/${data.site.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="tab-safe mx-auto w-full max-w-lg px-5 pt-4 pb-10">
      <p className="text-sm font-semibold text-[var(--blue)]">
        <Link href="/sites">Sites</Link>
      </p>
      <h1 className="large-title mt-1 mb-3">New site</h1>
      <p className="mb-5 text-[var(--secondary)]">
        Describe the business. We fill Home, About, Services, and Contact. Then you keep
        prompting — “rounder cards”, “darker green”, “move contact up” — until it looks right.
        We host it.
      </p>
      <textarea
        required
        rows={6}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Frost Air HVAC in Tampa. 24/7 emergency, tune-ups, and new installs. Friendly, local, no runaround."
        className="ios-input min-h-[140px] resize-none"
      />
      {error && <p className="mt-2 text-sm text-[var(--red)]">{error}</p>}
      <button type="submit" className="ios-btn mt-5 w-full" disabled={busy}>
        {busy ? "Building…" : "Generate site"}
      </button>
    </form>
  );
}

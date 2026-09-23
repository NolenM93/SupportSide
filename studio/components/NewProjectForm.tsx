"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import type { Project, TemplateId } from "@/lib/types";

export function NewProjectForm() {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<TemplateId>("inventory");
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, prompt }),
    });
    const data = (await res.json()) as { project?: Project; error?: string };
    if (!data.project) {
      setBusy(false);
      setError(data.error ?? "Could not create project.");
      return;
    }
    router.push(`/p/${data.project.id}?q=${encodeURIComponent(prompt.trim())}`);
  }

  return (
    <form onSubmit={onSubmit} className="tab-safe mx-auto w-full max-w-lg px-5 pt-4 pb-8">
      <p className="text-sm font-semibold text-[var(--blue)]">
        <Link href="/">Projects</Link>
      </p>
      <h1 className="large-title mt-1 mb-6">New app</h1>

      <p className="mb-2 text-sm font-semibold text-[var(--secondary)]">Starting point</p>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {TEMPLATES.map((template) => {
          const active = template.id === templateId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              className={`glass-card rounded-2xl p-4 text-left ${
                active ? "ring-2 ring-[var(--blue)]" : ""
              }`}
            >
              <div className="font-semibold">{template.name}</div>
              <div className="mt-1 text-xs text-[var(--secondary)]">{template.blurb}</div>
            </button>
          );
        })}
      </div>

      <label className="mb-2 block text-sm font-semibold text-[var(--secondary)]">
        What should it do?
      </label>
      <textarea
        required
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="A job portal for my HVAC company. Techs see today’s work, customers can request service…"
        className="ios-input min-h-[120px] resize-none"
      />
      {error && <p className="mt-2 text-sm text-[var(--red)]">{error}</p>}
      <button type="submit" className="ios-btn mt-5 w-full" disabled={busy}>
        {busy ? "Creating…" : "Generate preview"}
      </button>
    </form>
  );
}

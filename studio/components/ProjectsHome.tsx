"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditsBadge } from "@/components/CreditsBadge";
import { TEMPLATES } from "@/lib/templates";
import type { Project, SessionUser } from "@/lib/types";

export function ProjectsHome({
  user,
  projects,
  balance,
  aiLive,
}: {
  user: SessionUser;
  projects: Project[];
  balance: number;
  aiLive: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function quickStart(templateId: string) {
    setCreating(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    const data = (await res.json()) as { project?: Project; error?: string };
    setCreating(false);
    if (data.project) router.push(`/p/${data.project.id}`);
  }

  return (
    <div className="tab-safe mx-auto w-full max-w-lg px-5 pt-4">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm text-[var(--secondary)]">Support Side Studio</p>
          <h1 className="large-title mt-1">Projects</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <CreditsBadge balance={balance} />
          <span className="chip">{aiLive ? "OpenAI live" : "Local builder"}</span>
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="rise">
          <div className="glass-card rounded-[24px] p-6">
            <h2 className="text-xl font-semibold tracking-tight">Describe the app you need</h2>
            <p className="mt-2 text-[var(--secondary)]">
              Prompt Studio to design a business web app — inventory, jobs, booking, or a blank canvas.
            </p>
            <Link href="/new" className="ios-btn mt-5 w-full">
              Start building
            </Link>
          </div>
          <p className="mt-6 mb-2 text-sm font-semibold text-[var(--secondary)]">Templates</p>
          <div className="grouped-list">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                className="grouped-row w-full text-left"
                disabled={creating}
                onClick={() => quickStart(template.id)}
              >
                <div className="flex-1">
                  <div className="font-semibold">{template.name}</div>
                  <div className="text-sm text-[var(--secondary)]">{template.blurb}</div>
                </div>
                <span className="text-[var(--tertiary)]">›</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grouped-list rise">
          {projects.map((project) => (
            <Link key={project.id} href={`/p/${project.id}`} className="grouped-row">
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold">{project.name}</div>
                <div className="text-sm capitalize text-[var(--secondary)]">
                  {project.templateId} · {new Date(project.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <span className="text-[var(--tertiary)]">›</span>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[var(--tertiary)]">
        Signed in as {user.email}
      </p>
    </div>
  );
}

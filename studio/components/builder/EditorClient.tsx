"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteView } from "@/components/site/SiteView";
import type { Section, SiteRecord, Theme } from "@/lib/site/types";
import { withTheme } from "@/lib/site/types";

const SUGGESTIONS = [
  "Make the cards rounder and the green darker",
  "Tighten the spacing",
  "Switch to dark mode",
  "Move contact up",
  "Serif type, more padding",
];

export function EditorClient({ site: initial }: { site: SiteRecord }) {
  const router = useRouter();
  const [site, setSite] = useState(() => ({
    ...initial,
    theme: withTheme(initial.theme),
    agentMessages: initial.agentMessages ?? [],
  }));
  const siteRef = useRef(site);
  siteRef.current = site;
  const [selected, setSelected] = useState(initial.sections[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [agentBusy, setAgentBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const selectedSection = site.sections.find((s) => s.id === selected) ?? site.sections[0];

  useEffect(() => {
    if (agentBusy) return;
    const t = setTimeout(() => {
      void save();
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site.sections, site.theme, site.pageTitle, site.metaDescription, site.name, agentBusy]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight });
  }, [site.agentMessages, agentBusy]);

  async function save() {
    setSaving(true);
    const current = siteRef.current;
    const res = await fetch(`/api/sites/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: current.name,
        slug: current.slug,
        theme: current.theme,
        sections: current.sections,
        pageTitle: current.pageTitle,
        metaDescription: current.metaDescription,
      }),
    });
    setSaving(false);
    if (!res.ok) setError("Save failed");
  }

  async function askAgent(text?: string) {
    const nextInstruction = (text ?? instruction).trim();
    if (!nextInstruction || agentBusy) return;
    setError(null);
    setMessage(null);
    setInstruction("");
    setAgentBusy(true);
    const current = siteRef.current;
    const res = await fetch(`/api/sites/${current.id}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction: nextInstruction,
        draft: {
          name: current.name,
          slug: current.slug,
          theme: current.theme,
          sections: current.sections,
          pageTitle: current.pageTitle,
          metaDescription: current.metaDescription,
        },
      }),
    });
    const data = (await res.json()) as { site?: SiteRecord; note?: string; error?: string };
    setAgentBusy(false);
    if (!res.ok || !data.site) {
      setError(data.error ?? "Agent could not apply that.");
      return;
    }
    setSite({
      ...data.site,
      theme: withTheme(data.site.theme),
      agentMessages: data.site.agentMessages ?? [],
    });
    setMessage(data.note ?? "Updated.");
  }

  function patchSection(id: string, data: Section["data"]) {
    setSite((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? ({ ...s, data } as Section) : s)),
    }));
  }

  function move(id: string, dir: -1 | 1) {
    setSite((prev) => {
      const i = prev.sections.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.sections.length) return prev;
      const next = [...prev.sections];
      const [row] = next.splice(i, 1);
      next.splice(j, 0, row);
      return { ...prev, sections: next };
    });
  }

  function patchTheme(patch: Partial<Theme>) {
    setSite((prev) => ({ ...prev, theme: withTheme({ ...prev.theme, ...patch }) }));
  }

  async function publish() {
    setError(null);
    const res = await fetch(`/api/sites/${site.id}/publish`, { method: "POST" });
    const data = (await res.json()) as { site?: SiteRecord; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not publish");
      if (res.status === 402) router.push("/account");
      return;
    }
    if (data.site) setSite({ ...data.site, theme: withTheme(data.site.theme) });
    setMessage("Published. Live at /s/" + (data.site?.slug ?? site.slug));
  }

  async function rollback() {
    const res = await fetch(`/api/sites/${site.id}/rollback`, { method: "POST" });
    const data = (await res.json()) as { site?: SiteRecord; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Nothing to roll back");
      return;
    }
    if (data.site) {
      setSite({ ...data.site, theme: withTheme(data.site.theme) });
      setMessage("Restored previous live version.");
    }
  }

  const previewHref = useMemo(() => `/preview/${site.previewToken}`, [site.previewToken]);

  return (
    <div className="tab-safe flex min-h-dvh flex-col">
      <header className="glass-nav sticky top-0 z-20 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--blue)]">
              <Link href="/sites">Sites</Link>
            </p>
            <input
              className="w-full bg-transparent text-[17px] font-semibold outline-none"
              value={site.name}
              onChange={(e) => setSite((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--tertiary)]">{saving ? "Saving" : "Saved"}</span>
            <Link href={`/sites/${site.id}/preview`} className="ios-btn ios-btn-ghost px-3 py-2 text-sm">
              Preview
            </Link>
            <button type="button" className="ios-btn px-3 py-2 text-sm" onClick={() => void publish()}>
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 lg:grid-cols-[200px_1fr_340px]">
        <aside className="border-white/10 p-3 lg:border-r">
          <p className="mb-2 px-1 text-xs font-semibold text-[var(--secondary)]">Sections</p>
          {site.sections.map((section) => (
            <div key={section.id} className="mb-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSelected(section.id)}
                className={`flex-1 rounded-xl px-3 py-2 text-left text-sm capitalize ${
                  selected === section.id ? "bg-white/10" : "text-[var(--secondary)]"
                }`}
              >
                {section.type}
              </button>
              <button type="button" className="px-1 text-[var(--tertiary)]" onClick={() => move(section.id, -1)}>
                ↑
              </button>
              <button type="button" className="px-1 text-[var(--tertiary)]" onClick={() => move(section.id, 1)}>
                ↓
              </button>
            </div>
          ))}
          <p className="mt-4 px-1 text-xs font-semibold text-[var(--secondary)]">Page</p>
          <label className="mt-2 block text-xs text-[var(--tertiary)]">Title</label>
          <input
            className="ios-input mt-1"
            value={site.pageTitle}
            onChange={(e) => setSite((p) => ({ ...p, pageTitle: e.target.value }))}
          />
          <label className="mt-2 block text-xs text-[var(--tertiary)]">Meta</label>
          <textarea
            className="ios-input mt-1 min-h-[72px] resize-none text-sm"
            value={site.metaDescription}
            onChange={(e) => setSite((p) => ({ ...p, metaDescription: e.target.value }))}
          />
        </aside>

        <div className="min-h-[70vh] overflow-auto bg-[#e7e5e4]">
          <SiteView site={site} />
        </div>

        <aside className="flex flex-col border-white/10 p-3 lg:border-l">
          <p className="text-xs font-semibold text-[var(--secondary)]">Design agent</p>
          <p className="mt-1 text-[12px] leading-snug text-[var(--tertiary)]">
            Tell it what to change — colors, cards, spacing, order — like you would tell a developer.
          </p>

          <div ref={chatRef} className="mt-3 max-h-[220px] space-y-2 overflow-y-auto pr-1">
            {(site.agentMessages ?? []).length === 0 && (
              <p className="text-[12px] text-[var(--tertiary)]">No changes yet. Try a suggestion below.</p>
            )}
            {(site.agentMessages ?? []).map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                  msg.role === "user" ? "bg-white/10 text-[var(--label)]" : "bg-white/5 text-[var(--secondary)]"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {agentBusy && <p className="text-[12px] text-[var(--tertiary)]">Working…</p>}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {SUGGESTIONS.map((hint) => (
              <button
                key={hint}
                type="button"
                className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-[var(--secondary)]"
                onClick={() => void askAgent(hint)}
              >
                {hint}
              </button>
            ))}
          </div>

          <form
            className="mt-3"
            onSubmit={(e) => {
              e.preventDefault();
              void askAgent();
            }}
          >
            <textarea
              className="ios-input min-h-[72px] resize-none text-sm"
              placeholder="e.g. rounder cards, navy buttons, move contact under services"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void askAgent();
                }
              }}
            />
            <button type="submit" className="ios-btn mt-2 w-full py-2 text-sm" disabled={agentBusy || !instruction.trim()}>
              {agentBusy ? "Updating preview…" : "Apply"}
            </button>
          </form>

          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold text-[var(--secondary)]">Fine-tune</summary>
            <label className="mt-3 block text-xs text-[var(--tertiary)]">Primary</label>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded-lg border-0 bg-transparent"
              value={site.theme.primary}
              onChange={(e) => patchTheme({ primary: e.target.value })}
            />
            <label className="mt-2 block text-xs text-[var(--tertiary)]">Background</label>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded-lg border-0 bg-transparent"
              value={site.theme.background}
              onChange={(e) => patchTheme({ background: e.target.value })}
            />
            <label className="mt-2 block text-xs text-[var(--tertiary)]">Cards</label>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded-lg border-0 bg-transparent"
              value={site.theme.surface}
              onChange={(e) => patchTheme({ surface: e.target.value })}
            />
            <label className="mt-2 block text-xs text-[var(--tertiary)]">Type</label>
            <select
              className="ios-input mt-1"
              value={site.theme.font}
              onChange={(e) => patchTheme({ font: e.target.value as Theme["font"] })}
            >
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
            </select>
            <Range
              label="Corners"
              value={site.theme.radius}
              min={0}
              max={40}
              onChange={(radius) => patchTheme({ radius })}
            />
            <Range
              label="Card padding"
              value={site.theme.cardPad}
              min={10}
              max={48}
              onChange={(cardPad) => patchTheme({ cardPad })}
            />
            <Range
              label="Section spacing"
              value={site.theme.sectionPad}
              min={16}
              max={96}
              onChange={(sectionPad) => patchTheme({ sectionPad })}
            />
            <Range
              label="Page width"
              value={site.theme.maxWidth}
              min={560}
              max={1200}
              onChange={(maxWidth) => patchTheme({ maxWidth })}
            />

            {selectedSection && (
              <SectionFields
                section={selectedSection}
                onChange={(data) => patchSection(selectedSection.id, data)}
              />
            )}
          </details>

          {message && <p className="mt-3 text-sm text-[var(--green)]">{message}</p>}
          {error && <p className="mt-3 text-sm text-[var(--red)]">{error}</p>}

          <div className="mt-4 space-y-2 text-sm">
            {site.published && site.live && (
              <a className="block text-[var(--blue)]" href={`/s/${site.live.slug}`} target="_blank" rel="noreferrer">
                Live URL →
              </a>
            )}
            <a className="block text-[var(--blue)]" href={previewHref} target="_blank" rel="noreferrer">
              Share draft preview →
            </a>
            <button type="button" className="text-[var(--secondary)]" onClick={() => void rollback()}>
              Rollback last publish
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mt-3 block text-xs text-[var(--tertiary)]">
      {label}
      <input
        type="range"
        className="mt-1 w-full"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <label className="mt-3 block text-xs text-[var(--tertiary)]">
      {label}
      {area ? (
        <textarea
          className="ios-input mt-1 min-h-[88px] resize-none text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="ios-input mt-1" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function SectionFields({
  section,
  onChange,
}: {
  section: Section;
  onChange: (data: Section["data"]) => void;
}) {
  if (section.type === "hero") {
    const d = section.data;
    return (
      <div className="mt-5">
        <p className="text-xs font-semibold text-[var(--secondary)]">Hero</p>
        <Field label="Kicker" value={d.kicker} onChange={(kicker) => onChange({ ...d, kicker })} />
        <Field label="Title" value={d.title} onChange={(title) => onChange({ ...d, title })} />
        <Field label="Subtitle" value={d.subtitle} onChange={(subtitle) => onChange({ ...d, subtitle })} area />
        <Field label="Button" value={d.cta} onChange={(cta) => onChange({ ...d, cta })} />
      </div>
    );
  }
  if (section.type === "about") {
    const d = section.data;
    return (
      <div className="mt-5">
        <p className="text-xs font-semibold text-[var(--secondary)]">About</p>
        <Field label="Title" value={d.title} onChange={(title) => onChange({ ...d, title })} />
        <Field label="Body" value={d.body} onChange={(body) => onChange({ ...d, body })} area />
      </div>
    );
  }
  if (section.type === "services") {
    const d = section.data;
    return (
      <div className="mt-5">
        <p className="text-xs font-semibold text-[var(--secondary)]">Services</p>
        <Field label="Heading" value={d.title} onChange={(title) => onChange({ ...d, title, items: d.items })} />
        {d.items.map((item, i) => (
          <div key={i} className="mt-2">
            <Field
              label={`Service ${i + 1} name`}
              value={item.title}
              onChange={(title) => {
                const items = d.items.map((it, idx) => (idx === i ? { ...it, title } : it));
                onChange({ ...d, items });
              }}
            />
            <Field
              label="Blurb"
              value={item.body}
              onChange={(body) => {
                const items = d.items.map((it, idx) => (idx === i ? { ...it, body } : it));
                onChange({ ...d, items });
              }}
              area
            />
          </div>
        ))}
      </div>
    );
  }
  if (section.type === "cta") {
    const d = section.data;
    return (
      <div className="mt-5">
        <p className="text-xs font-semibold text-[var(--secondary)]">CTA</p>
        <Field label="Title" value={d.title} onChange={(title) => onChange({ ...d, title })} />
        <Field label="Body" value={d.body} onChange={(body) => onChange({ ...d, body })} area />
        <Field label="Button" value={d.cta} onChange={(cta) => onChange({ ...d, cta })} />
      </div>
    );
  }
  if (section.type === "contact") {
    const d = section.data;
    return (
      <div className="mt-5">
        <p className="text-xs font-semibold text-[var(--secondary)]">Contact</p>
        <Field label="Title" value={d.title} onChange={(title) => onChange({ ...d, title })} />
        <Field label="Email" value={d.email} onChange={(email) => onChange({ ...d, email })} />
        <Field label="Phone" value={d.phone} onChange={(phone) => onChange({ ...d, phone })} />
        <Field label="Area" value={d.area} onChange={(area) => onChange({ ...d, area })} />
      </div>
    );
  }
  const d = section.data;
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold text-[var(--secondary)]">Footer</p>
      <Field label="Note" value={d.note} onChange={(note) => onChange({ ...d, note })} />
    </div>
  );
}

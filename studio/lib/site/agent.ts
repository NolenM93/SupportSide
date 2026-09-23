import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { isOpenAIConfigured, OPENAI_MODEL, redactSecrets } from "@/lib/env";
import type {
  AgentMessage,
  Section,
  SectionType,
  SiteContent,
  SiteRecord,
  Theme,
} from "@/lib/site/types";
import { DEFAULT_THEME, withTheme } from "@/lib/site/types";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const patchSchema = z.object({
  note: z.string(),
  name: z.string().optional(),
  pageTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  sectionOrder: z.array(z.enum(["hero", "about", "services", "cta", "contact", "footer"])).optional(),
  theme: z
    .object({
      background: hex.optional(),
      surface: hex.optional(),
      text: hex.optional(),
      muted: hex.optional(),
      primary: hex.optional(),
      font: z.enum(["sans", "serif"]).optional(),
      radius: z.number().optional(),
      buttonRadius: z.number().optional(),
      padX: z.number().optional(),
      sectionPad: z.number().optional(),
      maxWidth: z.number().optional(),
      cardPad: z.number().optional(),
      gap: z.number().optional(),
    })
    .optional(),
  hero: z
    .object({
      kicker: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      cta: z.string().optional(),
    })
    .optional(),
  about: z.object({ title: z.string().optional(), body: z.string().optional() }).optional(),
  services: z
    .object({
      title: z.string().optional(),
      items: z.array(z.object({ title: z.string(), body: z.string() })).optional(),
    })
    .optional(),
  cta: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
      cta: z.string().optional(),
    })
    .optional(),
  contact: z
    .object({
      title: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
  footer: z.object({ note: z.string().optional() }).optional(),
});

type AgentPatch = z.infer<typeof patchSchema>;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function clampTheme(theme: Theme): Theme {
  return {
    ...theme,
    radius: clamp(theme.radius, 0, 48),
    buttonRadius: clamp(theme.buttonRadius, 0, 999),
    padX: clamp(theme.padX, 12, 72),
    sectionPad: clamp(theme.sectionPad, 16, 120),
    maxWidth: clamp(theme.maxWidth, 560, 1280),
    cardPad: clamp(theme.cardPad, 10, 56),
    gap: clamp(theme.gap, 4, 32),
  };
}

function contentFrom(site: SiteRecord): SiteContent {
  return {
    name: site.name,
    slug: site.slug,
    theme: clampTheme(withTheme(site.theme)),
    sections: site.sections,
    pageTitle: site.pageTitle,
    metaDescription: site.metaDescription,
  };
}

function applySectionOrder(sections: Section[], order: SectionType[]): Section[] {
  const byType = new Map(sections.map((s) => [s.type, s]));
  const next: Section[] = [];
  const seen = new Set<SectionType>();
  for (const type of order) {
    const section = byType.get(type);
    if (section && !seen.has(type)) {
      next.push(section);
      seen.add(type);
    }
  }
  for (const section of sections) {
    if (!seen.has(section.type)) next.push(section);
  }
  return next;
}

function applyPatch(content: SiteContent, patch: AgentPatch): SiteContent {
  let sections = content.sections;
  if (patch.sectionOrder?.length) {
    sections = applySectionOrder(sections, patch.sectionOrder);
  }
  sections = sections.map((section) => {
    if (section.type === "hero" && patch.hero) {
      return { ...section, data: { ...section.data, ...patch.hero } };
    }
    if (section.type === "about" && patch.about) {
      return { ...section, data: { ...section.data, ...patch.about } };
    }
    if (section.type === "services" && patch.services) {
      return {
        ...section,
        data: {
          title: patch.services.title ?? section.data.title,
          items: patch.services.items?.length ? patch.services.items.slice(0, 6) : section.data.items,
        },
      };
    }
    if (section.type === "cta" && patch.cta) {
      return { ...section, data: { ...section.data, ...patch.cta } };
    }
    if (section.type === "contact" && patch.contact) {
      return { ...section, data: { ...section.data, ...patch.contact } };
    }
    if (section.type === "footer" && patch.footer) {
      return { ...section, data: { ...section.data, ...patch.footer } };
    }
    return section;
  });
  return {
    ...content,
    name: patch.name?.slice(0, 48) || content.name,
    pageTitle: patch.pageTitle?.slice(0, 80) || content.pageTitle,
    metaDescription: patch.metaDescription?.slice(0, 160) || content.metaDescription,
    theme: clampTheme(withTheme({ ...content.theme, ...patch.theme })),
    sections,
  };
}

function hexToRgb(hexColor: string) {
  const h = hexColor.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)] as const;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function adjust(hexColor: string, amount: number) {
  const [r, g, b] = hexToRgb(hexColor);
  return rgbToHex(r + amount, g + amount, b + amount);
}

const NAMED: Record<string, string> = {
  navy: "#1e3a5f",
  teal: "#0f766e",
  green: "#0f766e",
  forest: "#166534",
  gold: "#b45309",
  orange: "#c2410c",
  red: "#b91c1c",
  crimson: "#9f1239",
  blue: "#1d4ed8",
  purple: "#6d28d9",
  pink: "#be185d",
  black: "#0c0a09",
  cream: "#f6f4ef",
  white: "#ffffff",
  charcoal: "#1c1917",
  slate: "#334155",
  sand: "#e7e0d4",
  rust: "#9a3412",
};

function pickNamed(text: string) {
  const compact = text.toLowerCase().replace(/[^a-z]/g, " ");
  for (const [name, hexColor] of Object.entries(NAMED)) {
    if (new RegExp(`\\b${name}\\b`).test(compact)) return hexColor;
  }
  const hexMatch = text.match(/#([0-9a-fA-F]{6})\b/);
  if (hexMatch) return `#${hexMatch[1]}`;
  return null;
}

function colorTarget(text: string): keyof Theme {
  if (/\b(background|page background|\bbg\b)\b/i.test(text)) return "background";
  if (/\b(text color|copy color)\b/i.test(text)) return "text";
  if (/\bmuted\b/i.test(text)) return "muted";
  if (/\b(card color|card background|surface)\b/i.test(text)) return "surface";
  if (
    /\bcards?\b/i.test(text) &&
    /\b(darker|lighter)\b/i.test(text) &&
    !/\b(green|teal|blue|navy|primary|button|accent)\b/i.test(text)
  ) {
    return "surface";
  }
  return "primary";
}

function moveSection(sections: Section[], type: SectionType, dir: -1 | 1): Section[] {
  const i = sections.findIndex((s) => s.type === type);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sections.length) return sections;
  const next = [...sections];
  const [row] = next.splice(i, 1);
  next.splice(j, 0, row);
  return next;
}

function moveRelative(sections: Section[], type: SectionType, other: SectionType, after: boolean): Section[] {
  const moving = sections.find((s) => s.type === type);
  if (!moving || type === other) return sections;
  const rest = sections.filter((s) => s.type !== type);
  const i = rest.findIndex((s) => s.type === other);
  if (i < 0) return sections;
  rest.splice(i + (after ? 1 : 0), 0, moving);
  return rest;
}

function quoted(text: string) {
  return text.match(/["“](.+?)["”]/)?.[1]?.trim() ?? null;
}

export function applyLocalInstruction(content: SiteContent, instruction: string): { content: SiteContent; note: string } {
  const text = instruction.trim();
  const lower = text.toLowerCase();
  const notes: string[] = [];
  let next = { ...content, theme: withTheme(content.theme), sections: [...content.sections] };
  let theme = { ...next.theme };

  if (/\b(dark mode|make it dark|dark theme)\b/.test(lower)) {
    theme = {
      ...theme,
      background: "#0c0a09",
      surface: "#1c1917",
      text: "#fafaf9",
      muted: "#a8a29e",
    };
    notes.push("Switched to a dark theme");
  } else if (/\b(light mode|make it light|light theme)\b/.test(lower)) {
    theme = {
      ...theme,
      background: DEFAULT_THEME.background,
      surface: DEFAULT_THEME.surface,
      text: DEFAULT_THEME.text,
      muted: DEFAULT_THEME.muted,
    };
    notes.push("Switched to a light theme");
  }

  const named = pickNamed(text);
  if (named && !/\b(dark mode|light mode)\b/.test(lower)) {
    const target = colorTarget(lower);
    theme = { ...theme, [target]: named };
    notes.push(`Set ${target} to ${named}`);
  }

  if (/\b(darker|deeper)\b/.test(lower) && !/\bdark mode\b/.test(lower)) {
    const target = colorTarget(lower);
    const current = String(theme[target]);
    if (current.startsWith("#")) {
      theme = { ...theme, [target]: adjust(current, -32) };
      notes.push(`Made ${target} darker`);
    }
  }
  if (/\b(lighter|softer|paler)\b/.test(lower) && !/\blight mode\b/.test(lower)) {
    const target = colorTarget(lower);
    const current = String(theme[target]);
    if (current.startsWith("#")) {
      theme = { ...theme, [target]: adjust(current, 32) };
      notes.push(`Made ${target} lighter`);
    }
  }

  if (/\b(rounder|more rounded|softer corners)\b/.test(lower)) {
    theme.radius = theme.radius + 10;
    theme.buttonRadius = theme.buttonRadius + 6;
    notes.push("Rounded the cards and buttons");
  }
  if (/\b(pill|fully round buttons)\b/.test(lower)) {
    theme.buttonRadius = 999;
    notes.push("Made buttons pill-shaped");
  }
  if (/\b(sharp|square|less rounded|boxy)\b/.test(lower)) {
    theme.radius = 6;
    theme.buttonRadius = 6;
    notes.push("Squared off the corners");
  }
  if (/\b(tighter|compact|denser|less padding|tighter spacing)\b/.test(lower)) {
    theme.padX = Math.round(theme.padX * 0.78);
    theme.sectionPad = Math.round(theme.sectionPad * 0.72);
    theme.cardPad = Math.round(theme.cardPad * 0.75);
    theme.gap = Math.max(6, theme.gap - 4);
    notes.push("Tightened spacing");
  }
  if (/\b(spacious|airy|more padding|more space|roomier)\b/.test(lower)) {
    theme.padX = Math.round(theme.padX * 1.2);
    theme.sectionPad = Math.round(theme.sectionPad * 1.2);
    theme.cardPad = Math.round(theme.cardPad * 1.15);
    theme.gap = theme.gap + 4;
    notes.push("Opened up the spacing");
  }
  if (/\bwider\b/.test(lower)) {
    theme.maxWidth += 80;
    notes.push("Widened the page");
  }
  if (/\b(narrower|skinnier)\b/.test(lower)) {
    theme.maxWidth -= 80;
    notes.push("Narrowed the page");
  }
  if (/\bserif\b/.test(lower)) {
    theme.font = "serif";
    notes.push("Switched to serif type");
  } else if (/\bsans\b/.test(lower)) {
    theme.font = "sans";
    notes.push("Switched to sans type");
  }

  const before = lower.match(/move (hero|about|services|cta|contact|footer) before (hero|about|services|cta|contact|footer)/);
  const after = lower.match(/move (hero|about|services|cta|contact|footer) after (hero|about|services|cta|contact|footer)/);
  if (before) {
    next.sections = moveRelative(next.sections, before[1] as SectionType, before[2] as SectionType, false);
    notes.push(`Moved ${before[1]} before ${before[2]}`);
  } else if (after) {
    next.sections = moveRelative(next.sections, after[1] as SectionType, after[2] as SectionType, true);
    notes.push(`Moved ${after[1]} after ${after[2]}`);
  } else {
    const up = lower.match(/move (hero|about|services|cta|contact|footer) (up|higher|earlier)/);
    const down = lower.match(/move (hero|about|services|cta|contact|footer) (down|lower|later)/);
    if (up) {
      next.sections = moveSection(next.sections, up[1] as SectionType, -1);
      notes.push(`Moved ${up[1]} up`);
    } else if (down) {
      next.sections = moveSection(next.sections, down[1] as SectionType, 1);
      notes.push(`Moved ${down[1]} down`);
    }
  }
  if (/\b(contact (first|to the top)|put contact (up|near the top))\b/.test(lower)) {
    next.sections = moveRelative(next.sections, "contact", "hero", true);
    notes.push("Moved contact up under the hero");
  }

  const title = quoted(text);
  if (title && /\b(title|headline|heading)\b/.test(lower)) {
    next.sections = next.sections.map((section) =>
      section.type === "hero" ? { ...section, data: { ...section.data, title } } : section,
    );
    notes.push(`Updated the headline`);
  }

  next = { ...next, theme: clampTheme(theme) };

  if (!notes.length) {
    return {
      content,
      note: "I can change colors, spacing, corners, type, section order, and copy. Try: “make the cards rounder and the green darker” or “move contact up”.",
    };
  }
  return { content: next, note: notes.join(". ") + "." };
}

const SYSTEM = `You are a design agent for a one-page business website.
You only edit the provided JSON: theme tokens, section copy, and section order.
You cannot add HTML, JavaScript, extra pages, images, or new section types.
Keep existing section types. Preserve the client's meaning; do not invent a different business.
Theme tokens: background, surface, text, muted, primary (hex like #0f766e), font (sans|serif),
radius, buttonRadius, padX, sectionPad, maxWidth, cardPad, gap (pixels).
If the user asks for something you cannot do, say so in note and change nothing else.
Always write a short note in plain English describing what you changed.`;

async function applyOpenAI(content: SiteContent, instruction: string, history: AgentMessage[]): Promise<AgentPatch | null> {
  if (!isOpenAIConfigured()) return null;
  try {
    const recent = history
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");
    const { output } = await generateText({
      model: openai(OPENAI_MODEL),
      system: SYSTEM,
      prompt: `Recent chat:\n${recent || "(none)"}\n\nCurrent site JSON:\n${JSON.stringify(
        {
          name: content.name,
          pageTitle: content.pageTitle,
          metaDescription: content.metaDescription,
          theme: content.theme,
          sectionOrder: content.sections.map((s) => s.type),
          hero: content.sections.find((s) => s.type === "hero")?.data,
          about: content.sections.find((s) => s.type === "about")?.data,
          services: content.sections.find((s) => s.type === "services")?.data,
          cta: content.sections.find((s) => s.type === "cta")?.data,
          contact: content.sections.find((s) => s.type === "contact")?.data,
          footer: content.sections.find((s) => s.type === "footer")?.data,
        },
        null,
        2,
      )}\n\nInstruction:\n${instruction}\n\nReturn only fields you are changing, plus note.`,
      output: Output.object({ schema: patchSchema }),
      abortSignal: AbortSignal.timeout(20_000),
      timeout: 20_000,
    });
    return output ?? null;
  } catch (err) {
    console.error("[site-agent]", redactSecrets(err instanceof Error ? err.message : "fail"));
    return null;
  }
}

export async function runSiteAgent(opts: {
  site: SiteRecord;
  instruction: string;
  draft?: Partial<SiteContent> | null;
}): Promise<{ content: SiteContent; messages: AgentMessage[]; note: string }> {
  const instruction = opts.instruction.trim().slice(0, 2000);
  const site: SiteRecord = {
    ...opts.site,
    name: opts.draft?.name ?? opts.site.name,
    slug: opts.draft?.slug ?? opts.site.slug,
    theme: withTheme({ ...opts.site.theme, ...opts.draft?.theme }),
    sections: opts.draft?.sections ?? opts.site.sections,
    pageTitle: opts.draft?.pageTitle ?? opts.site.pageTitle,
    metaDescription: opts.draft?.metaDescription ?? opts.site.metaDescription,
    agentMessages: opts.site.agentMessages ?? [],
  };

  const current = contentFrom(site);
  const history = site.agentMessages ?? [];
  const aiPatch = await applyOpenAI(current, instruction, history);
  const applied = aiPatch
    ? { content: applyPatch(current, aiPatch), note: aiPatch.note }
    : applyLocalInstruction(current, instruction);

  const turn: AgentMessage[] = [
    { role: "user", content: instruction },
    { role: "assistant", content: applied.note },
  ];
  const messages = [...history, ...turn].slice(-40);

  return { content: applied.content, messages, note: applied.note };
}

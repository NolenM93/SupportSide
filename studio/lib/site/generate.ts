import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { isOpenAIConfigured, OPENAI_MODEL, redactSecrets } from "@/lib/env";
import { buildSiteFromPrompt } from "@/lib/site/template";
import type { SiteContent, Theme } from "@/lib/site/types";
import { withTheme } from "@/lib/site/types";

const schema = z.object({
  name: z.string(),
  kicker: z.string(),
  title: z.string(),
  subtitle: z.string(),
  about: z.string(),
  services: z.array(z.object({ title: z.string(), body: z.string() })).min(2).max(6),
  ctaTitle: z.string(),
  ctaBody: z.string(),
  area: z.string(),
  primary: z.string(),
});

function applyGenerated(base: SiteContent, g: z.infer<typeof schema>): SiteContent {
  const theme: Theme = {
    ...withTheme(base.theme),
    primary: /^#[0-9a-f]{6}$/i.test(g.primary) ? g.primary : withTheme(base.theme).primary,
  };
  return {
    ...base,
    name: g.name.slice(0, 48),
    pageTitle: `${g.name} · ${g.area}`,
    metaDescription: g.subtitle.slice(0, 160),
    theme,
    sections: base.sections.map((section) => {
      if (section.type === "hero") {
        return {
          ...section,
          data: {
            kicker: g.kicker,
            title: g.title || g.name,
            subtitle: g.subtitle,
            cta: "Request service",
          },
        };
      }
      if (section.type === "about") {
        return { ...section, data: { title: "How we work", body: g.about } };
      }
      if (section.type === "services") {
        return { ...section, data: { title: "What we do", items: g.services } };
      }
      if (section.type === "cta") {
        return {
          ...section,
          data: { title: g.ctaTitle, body: g.ctaBody, cta: "Get a callback" },
        };
      }
      if (section.type === "contact") {
        return { ...section, data: { ...section.data, area: g.area } };
      }
      if (section.type === "footer") {
        return {
          ...section,
          data: { note: `© ${new Date().getFullYear()} ${g.name}. Hosted by Support Side.` },
        };
      }
      return section;
    }),
  };
}

export async function generateSiteContent(prompt: string): Promise<SiteContent> {
  const base = buildSiteFromPrompt(prompt);
  if (!isOpenAIConfigured()) return base;

  try {
    const { output } = await generateText({
      model: openai(OPENAI_MODEL),
      system:
        "You fill a service-business website template. Never output the user's raw prompt as a heading. Keep copy short, local, and practical. primary must be a hex color like #0f766e.",
      prompt: `Business request:\n${prompt}\n\nReturn JSON for a one-page site (hero, about, 3-5 services, CTA, contact area).`,
      output: Output.object({ schema }),
    });
    if (!output) return base;
    return applyGenerated(base, output);
  } catch (err) {
    console.error("[generate-site]", redactSecrets(err instanceof Error ? err.message : "fail"));
    return base;
  }
}

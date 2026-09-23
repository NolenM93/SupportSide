import type { Section, SiteContent, Theme } from "@/lib/site/types";
import { DEFAULT_THEME } from "@/lib/site/types";

function sid() {
  return crypto.randomUUID();
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "site";
}

function nameFromPrompt(prompt: string) {
  const quoted = prompt.match(/["“']([^"”']{2,40})["”']/);
  if (quoted) return titleCase(quoted[1]);
  const called = prompt.match(
    /\b(?:called|named)\s+([A-Za-z][\w']{1,28}(?:\s+[A-Za-z][\w']{1,20}){0,3})/i,
  );
  if (called) return titleCase(called[1]);
  const forCompany = prompt.match(
    /\bfor (?:my |our |a |the )?([A-Za-z][\w']{2,28}(?:\s+[A-Za-z][\w']{2,20}){0,2})\s+(?:company|co\.?|shop|store|business|team|llc)\b/i,
  );
  if (forCompany) return titleCase(forCompany[1]);
  return "";
}

function servicesFromPrompt(prompt: string): { title: string; body: string }[] {
  const list = prompt.match(/services?:?\s*([^.]+)/i);
  if (list) {
    const parts = list[1]
      .split(/,| and /i)
      .map((s) => titleCase(s.replace(/[.]/g, "").trim()))
      .filter((s) => s.length > 1 && s.length < 40)
      .slice(0, 6);
    if (parts.length >= 2) {
      return parts.map((title) => ({
        title,
        body: `Professional ${title.toLowerCase()} for homes and businesses in your area.`,
      }));
    }
  }
  if (/\bhvac|heat|cool|ac\b/i.test(prompt)) {
    return [
      { title: "Repair", body: "Fast diagnosis and repair when the system is down." },
      { title: "Maintenance", body: "Seasonal tune-ups so you are not surprised in July or January." },
      { title: "Install", body: "Right-sized equipment, installed cleanly, explained in plain English." },
    ];
  }
  if (/\bplumb/i.test(prompt)) {
    return [
      { title: "Leaks & drains", body: "Stops the water, finds the cause, leaves the space clean." },
      { title: "Water heaters", body: "Repair or replace, with honest options on cost and timing." },
      { title: "Remodel rough-in", body: "Kitchens and baths done to code, coordinated with your other trades." },
    ];
  }
  return [
    { title: "Service calls", body: "Show up on time, fix the issue, tell you what we found." },
    { title: "Maintenance", body: "A simple plan so small problems do not become emergencies." },
    { title: "Emergency support", body: "When something breaks after hours, you have a number that answers." },
  ];
}

export function buildSiteFromPrompt(prompt: string, theme?: Partial<Theme>): SiteContent {
  const name = nameFromPrompt(prompt) || "Your Business";
  const items = servicesFromPrompt(prompt);
  const areaMatch = prompt.match(/\bin ([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  const area = areaMatch ? areaMatch[1] : "your area";
  const sections: Section[] = [
    {
      id: sid(),
      type: "hero",
      data: {
        kicker: "Local & trusted",
        title: name,
        subtitle: `Reliable work for people in ${area}. Clear pricing, real humans, no runaround.`,
        cta: "Request service",
      },
    },
    {
      id: sid(),
      type: "about",
      data: {
        title: "How we work",
        body: `${name} is built for busy owners who need a crew that shows up and explains the job. You get a straightforward plan, a fair price, and a follow-up if something is not right.`,
      },
    },
    {
      id: sid(),
      type: "services",
      data: { title: "What we do", items },
    },
    {
      id: sid(),
      type: "cta",
      data: {
        title: "Need help this week?",
        body: "Tell us what is going on. We will tell you if we can take it and when we can be there.",
        cta: "Get a callback",
      },
    },
    {
      id: sid(),
      type: "contact",
      data: {
        title: "Contact",
        email: "hello@example.com",
        phone: "(555) 010-2000",
        area,
      },
    },
    {
      id: sid(),
      type: "footer",
      data: { note: `© ${new Date().getFullYear()} ${name}. Hosted by Support Side.` },
    },
  ];

  return {
    name,
    slug: slugify(name),
    theme: { ...DEFAULT_THEME, ...theme },
    sections,
    pageTitle: `${name} · ${area}`,
    metaDescription: `${name} — service you can actually get on the phone. ${area}.`,
  };
}

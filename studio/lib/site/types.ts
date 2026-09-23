export type SectionType = "hero" | "about" | "services" | "cta" | "contact" | "footer";

export type ServiceItem = { title: string; body: string };

export type HeroData = { kicker: string; title: string; subtitle: string; cta: string };
export type AboutData = { title: string; body: string };
export type ServicesData = { title: string; items: ServiceItem[] };
export type CtaData = { title: string; body: string; cta: string };
export type ContactData = { title: string; email: string; phone: string; area: string };
export type FooterData = { note: string };

export type Section =
  | { id: string; type: "hero"; data: HeroData }
  | { id: string; type: "about"; data: AboutData }
  | { id: string; type: "services"; data: ServicesData }
  | { id: string; type: "cta"; data: CtaData }
  | { id: string; type: "contact"; data: ContactData }
  | { id: string; type: "footer"; data: FooterData };

export type Theme = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  font: "sans" | "serif";
  radius: number;
  buttonRadius: number;
  padX: number;
  sectionPad: number;
  maxWidth: number;
  cardPad: number;
  gap: number;
};

export const DEFAULT_THEME: Theme = {
  background: "#f6f4ef",
  surface: "#ffffff",
  text: "#1c1917",
  muted: "#78716c",
  primary: "#0f766e",
  font: "sans",
  radius: 18,
  buttonRadius: 12,
  padX: 24,
  sectionPad: 48,
  maxWidth: 880,
  cardPad: 24,
  gap: 12,
};

function num(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function withTheme(theme?: Partial<Theme> | null): Theme {
  const t = { ...DEFAULT_THEME, ...theme };
  return {
    ...t,
    font: t.font === "serif" ? "serif" : "sans",
    radius: num(t.radius, DEFAULT_THEME.radius),
    buttonRadius: num(t.buttonRadius, DEFAULT_THEME.buttonRadius),
    padX: num(t.padX, DEFAULT_THEME.padX),
    sectionPad: num(t.sectionPad, DEFAULT_THEME.sectionPad),
    maxWidth: num(t.maxWidth, DEFAULT_THEME.maxWidth),
    cardPad: num(t.cardPad, DEFAULT_THEME.cardPad),
    gap: num(t.gap, DEFAULT_THEME.gap),
  };
}

export type SiteContent = {
  name: string;
  slug: string;
  theme: Theme;
  sections: Section[];
  pageTitle: string;
  metaDescription: string;
};

export type AgentMessage = {
  role: "user" | "assistant";
  content: string;
};

export function hydrateSite<T extends { theme: Theme; agentMessages?: AgentMessage[] }>(site: T): T {
  return {
    ...site,
    theme: withTheme(site.theme),
    agentMessages: Array.isArray(site.agentMessages) ? site.agentMessages : [],
  };
}

export type SiteSnapshot = SiteContent & { publishedAt: string };

export type SiteRecord = SiteContent & {
  id: string;
  userId: string;
  prompt: string;
  previewToken: string;
  published: boolean;
  agentMessages: AgentMessage[];
  live: SiteSnapshot | null;
  previousLive: SiteSnapshot | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingStatus = "trialing" | "active" | "canceled" | "none";

export type Subscription = {
  userId: string;
  status: BillingStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
};

export function snapshotFrom(site: SiteRecord): SiteSnapshot {
  return {
    name: site.name,
    slug: site.slug,
    theme: withTheme(site.theme),
    sections: site.sections,
    pageTitle: site.pageTitle,
    metaDescription: site.metaDescription,
    publishedAt: new Date().toISOString(),
  };
}

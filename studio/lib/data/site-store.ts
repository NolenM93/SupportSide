import {
  newId,
  now,
  readDb,
  withLock,
  writeDb,
} from "@/lib/data/local-store";
import {
  hydrateSite,
  snapshotFrom,
  withTheme,
  type AgentMessage,
  type SiteRecord,
  type Subscription,
} from "@/lib/site/types";
import { slugify } from "@/lib/site/template";
import type { SiteContent } from "@/lib/site/types";
import { isStripeConfigured } from "@/lib/site/billing";

const TRIAL_DAYS = 14;

export async function ensureSubscription(userId: string): Promise<Subscription> {
  return withLock(async () => {
    const db = await readDb();
    const existing = db.subscriptions[userId];
    if (existing) return existing;
    const ends = new Date();
    ends.setDate(ends.getDate() + TRIAL_DAYS);
    const sub: Subscription = {
      userId,
      status: "trialing",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEndsAt: ends.toISOString(),
    };
    db.subscriptions[userId] = sub;
    await writeDb(db);
    return sub;
  });
}

export async function saveSubscription(sub: Subscription) {
  return withLock(async () => {
    const db = await readDb();
    db.subscriptions[sub.userId] = sub;
    await writeDb(db);
    return sub;
  });
}

export async function getSubscription(userId: string) {
  return ensureSubscription(userId);
}

export function canPublish(sub: Subscription) {
  if (!isStripeConfigured()) return true;
  if (sub.status === "active") return true;
  if (sub.status === "trialing" && sub.trialEndsAt && Date.parse(sub.trialEndsAt) > Date.now()) {
    return true;
  }
  return false;
}

export async function listSites(userId: string) {
  return withLock(async () => {
    const db = await readDb();
    return (db.sites ?? [])
      .filter((s) => s.userId === userId)
      .map(hydrateSite)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });
}

export async function getSiteForUser(userId: string, id: string) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.id === id && s.userId === userId);
    return site ? hydrateSite(site) : null;
  });
}

export async function getPublishedBySlug(slug: string) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.slug === slug && s.published && s.live);
    return site ? hydrateSite(site) : null;
  });
}

export async function getByPreviewToken(token: string) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.previewToken === token);
    return site ? hydrateSite(site) : null;
  });
}

function uniqueSlug(db: { sites?: { slug: string; id: string }[] }, base: string, ignoreId?: string) {
  let slug = slugify(base);
  let n = 2;
  while ((db.sites ?? []).some((s) => s.slug === slug && s.id !== ignoreId)) {
    slug = `${slugify(base)}-${n}`;
    n += 1;
  }
  return slug;
}

export async function createSite(userId: string, content: SiteContent, prompt: string) {
  return withLock(async () => {
    const db = await readDb();
    if (!db.sites) db.sites = [];
    const createdAt = now();
    const slug = uniqueSlug(db, content.slug || content.name);
    const site: SiteRecord = {
      ...content,
      theme: withTheme(content.theme),
      slug,
      id: newId(),
      userId,
      prompt,
      previewToken: newId(),
      published: false,
      agentMessages: [],
      live: null,
      previousLive: null,
      createdAt,
      updatedAt: createdAt,
    };
    db.sites.unshift(site);
    await writeDb(db);
    return site;
  });
}

export async function updateSite(
  userId: string,
  id: string,
  patch: Partial<SiteContent> & { agentMessages?: AgentMessage[] },
) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.id === id && s.userId === userId);
    if (!site) return null;
    const { theme, ...rest } = patch;
    Object.assign(site, rest, { updatedAt: now() });
    if (theme) site.theme = withTheme({ ...site.theme, ...theme });
    await writeDb(db);
    return hydrateSite(site);
  });
}

export async function publishSite(userId: string, id: string) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.id === id && s.userId === userId);
    if (!site) return null;
    site.previousLive = site.live;
    site.live = snapshotFrom(site);
    site.published = true;
    site.updatedAt = now();
    await writeDb(db);
    return hydrateSite(site);
  });
}

export async function rollbackSite(userId: string, id: string) {
  return withLock(async () => {
    const db = await readDb();
    const site = (db.sites ?? []).find((s) => s.id === id && s.userId === userId);
    if (!site?.previousLive) return null;
    const current = site.live;
    site.live = site.previousLive;
    site.previousLive = current;
    site.slug = site.live.slug;
    site.name = site.live.name;
    site.theme = site.live.theme;
    site.sections = site.live.sections;
    site.pageTitle = site.live.pageTitle;
    site.metaDescription = site.live.metaDescription;
    site.updatedAt = now();
    await writeDb(db);
    return hydrateSite(site);
  });
}

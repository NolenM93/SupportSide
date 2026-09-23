export type AppKind =
  | "inventory"
  | "jobs"
  | "booking"
  | "store"
  | "crm"
  | "dashboard";

export type Accent = "blue" | "teal" | "orange" | "purple" | "green";

export type SpecItem = {
  title: string;
  subtitle: string;
  badge: string;
  tone: "ok" | "hold" | "done";
};

export type AppSpec = {
  name: string;
  kicker: string;
  kind: AppKind;
  theme: "light" | "dark";
  accent: Accent;
  search: boolean;
  addLabel: string;
  primaryAction: string;
  itemNoun: string;
  formTitle: string;
  stats: { label: string; value: string }[];
  items: SpecItem[];
};

const KIND_META: Record<
  AppKind,
  { kicker: string; name: string; noun: string; add: string; action: string; form: string }
> = {
  inventory: {
    kicker: "Operations",
    name: "Inventory",
    noun: "product",
    add: "Add product",
    action: "Stock in",
    form: "New product",
  },
  jobs: {
    kicker: "Field ops",
    name: "Jobs",
    noun: "job",
    add: "New request",
    action: "Advance",
    form: "Service request",
  },
  booking: {
    kicker: "Reservations",
    name: "Bookings",
    noun: "booking",
    add: "Reserve",
    action: "Check in",
    form: "New reservation",
  },
  store: {
    kicker: "Shop",
    name: "Storefront",
    noun: "item",
    add: "Add item",
    action: "Add to bag",
    form: "New item",
  },
  crm: {
    kicker: "Clients",
    name: "Clients",
    noun: "client",
    add: "Add client",
    action: "Log note",
    form: "New client",
  },
  dashboard: {
    kicker: "Today",
    name: "Overview",
    noun: "update",
    add: "Add update",
    action: "Open",
    form: "New update",
  },
};

const SENTENCE_JUNK =
  /\b(i want|i need|make|create|build|please|can you|would you|an app|a app|a website|the app|that can|so that|help me|using ai)\b/i;

export function kindFromText(text: string, fallback: AppKind = "jobs"): AppKind {
  const t = text.toLowerCase();
  if (/\b(inventor|stock|sku|warehouse|product|shelf)\b/.test(t)) return "inventory";
  if (/\b(book|rental|reserv|calendar|appoint|schedul)\b/.test(t)) return "booking";
  if (/\b(shop|store|cart|menu|catalog|retail)\b/.test(t)) return "store";
  if (/\b(crm|lead|client list|customer list|pipeline)\b/.test(t)) return "crm";
  if (/\b(dashboard|report|metric|analytics|overview)\b/.test(t)) return "dashboard";
  if (/\b(job|dispatch|hvac|plumb|work order|ticket|service call|tech)\b/.test(t)) {
    return "jobs";
  }
  return fallback;
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function looksLikeName(value: string) {
  const s = value.trim().replace(/[.,!?]+$/g, "");
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length === 0 || words.length > 5) return false;
  if (s.length < 2 || s.length > 36) return false;
  if (SENTENCE_JUNK.test(s)) return false;
  if (/^(the|my|our|a|an|this|that)$/i.test(s)) return false;
  return true;
}

export function nameFromPrompt(prompt: string, kind: AppKind): string {
  const quoted = prompt.match(/["“']([^"”']{2,40})["”']/);
  if (quoted && looksLikeName(quoted[1])) return titleCase(quoted[1]);

  const called = prompt.match(
    /\b(?:called|named|name it|branded)\s+([A-Za-z][\w&']{1,28}(?:\s+[A-Za-z][\w&']{1,20}){0,3})/i,
  );
  if (called && looksLikeName(called[1])) return titleCase(called[1]);

  const forCompany = prompt.match(
    /\bfor (?:my |our |a |the )?([A-Za-z][\w&']{2,28}(?:\s+[A-Za-z][\w&']{2,20}){0,2})\s+(?:company|co\.?|shop|store|business|team|crew|llc)\b/i,
  );
  if (forCompany && looksLikeName(forCompany[1])) return titleCase(forCompany[1]);

  const forProper = prompt.match(
    /\bfor ([A-Z][A-Za-z0-9&']*(?:\s+[A-Z][A-Za-z0-9&']*){0,3})\b/,
  );
  if (forProper && looksLikeName(forProper[1])) return titleCase(forProper[1]);

  return KIND_META[kind].name;
}

function seedItems(kind: AppKind, prompt: string): SpecItem[] {
  const t = prompt.toLowerCase();
  if (kind === "inventory") {
    if (/\bgift|shop|boutique|mug\b/.test(t)) {
      return [
        { title: "Ceramic mug", subtitle: "MUG-01 · Shelf A", badge: "12 in stock", tone: "ok" },
        { title: "Gift wrap roll", subtitle: "WRP-04 · Low", badge: "3 left", tone: "hold" },
        { title: "Ribbon set", subtitle: "RIB-12 · Bin 2", badge: "18 in stock", tone: "ok" },
      ];
    }
    return [
      { title: "Filter 16x25", subtitle: "FIL-16 · Van 2", badge: "7 in stock", tone: "ok" },
      { title: "Capacitor 45/5", subtitle: "CAP-45 · Low", badge: "2 left", tone: "hold" },
      { title: "Thermostat kit", subtitle: "THR-01 · Shop", badge: "11 in stock", tone: "ok" },
    ];
  }
  if (kind === "jobs") {
    if (/\bhvac|cool|heat|ac\b/.test(t)) {
      return [
        { title: "Harbor Inn · Unit 4", subtitle: "No cool air · Today 9:00", badge: "Queued", tone: "hold" },
        { title: "Maple Dental", subtitle: "Replace thermostat · Today 11:30", badge: "En route", tone: "done" },
        { title: "12 Oak Street", subtitle: "Annual tune-up · Tomorrow", badge: "Scheduled", tone: "ok" },
      ];
    }
    return [
      { title: "River Clinic", subtitle: "Lobby lights out · Today 8:30", badge: "On site", tone: "done" },
      { title: "Pike Warehouse", subtitle: "Dock door stuck · Today 1:00", badge: "Queued", tone: "hold" },
      { title: "Lee Residence", subtitle: "Follow-up inspection", badge: "Done", tone: "ok" },
    ];
  }
  if (kind === "booking") {
    return [
      { title: "14ft trailer", subtitle: "Sat 9:00–4:00 · Ready", badge: "Open", tone: "ok" },
      { title: "Scissor lift", subtitle: "Sun all day · Held", badge: "Hold", tone: "hold" },
      { title: "Party tent 20x20", subtitle: "Next Fri · Deposit in", badge: "Reserved", tone: "done" },
    ];
  }
  if (kind === "store") {
    return [
      { title: "House blend", subtitle: "$14 · 12 oz bag", badge: "Add", tone: "ok" },
      { title: "Seasonal pastry", subtitle: "$5 · Bakes at 7am", badge: "Today", tone: "hold" },
      { title: "Drip mug", subtitle: "$22 · In store", badge: "Add", tone: "ok" },
    ];
  }
  if (kind === "crm") {
    return [
      { title: "Jordan Lee", subtitle: "Quoted roof repair · Follow up", badge: "Warm", tone: "hold" },
      { title: "Harbor Inn", subtitle: "Monthly contract · Active", badge: "Client", tone: "done" },
      { title: "Pike Properties", subtitle: "Intro call Thursday", badge: "New", tone: "ok" },
    ];
  }
  return [
    { title: "Open tickets", subtitle: "3 waiting on parts", badge: "3", tone: "hold" },
    { title: "Jobs today", subtitle: "4 on the board", badge: "4", tone: "done" },
    { title: "Invoices", subtitle: "2 sent this morning", badge: "2", tone: "ok" },
  ];
}

function seedStats(kind: AppKind, items: SpecItem[]): AppSpec["stats"] {
  const hold = items.filter((i) => i.tone === "hold").length;
  if (kind === "inventory") {
    return [
      { label: "SKUs", value: String(items.length) },
      { label: "Low stock", value: String(hold) },
      { label: "On hand", value: "38" },
    ];
  }
  if (kind === "jobs") {
    return [
      { label: "Today", value: String(items.length) },
      { label: "Waiting", value: String(hold) },
      { label: "Techs", value: "4" },
    ];
  }
  if (kind === "booking") {
    return [
      { label: "Units", value: String(items.length) },
      { label: "Open", value: String(items.filter((i) => i.tone === "ok").length) },
      { label: "Held", value: String(hold) },
    ];
  }
  return [
    { label: "Active", value: String(items.length) },
    { label: "Needs you", value: String(hold) },
    { label: "This week", value: "12" },
  ];
}

function accentFromPrompt(prompt: string, current?: Accent): Accent {
  const t = prompt.toLowerCase();
  if (/\borange|amber|gold\b/.test(t)) return "orange";
  if (/\bteal|cyan|aqua\b/.test(t)) return "teal";
  if (/\bpurple|violet|magenta\b/.test(t)) return "purple";
  if (/\bgreen|mint\b/.test(t)) return "green";
  if (/\bblue\b/.test(t)) return "blue";
  return current ?? "blue";
}

export function specFromPrompt(prompt: string, templateKind?: AppKind): AppSpec {
  const kind = kindFromText(prompt, templateKind ?? "jobs");
  const meta = KIND_META[kind];
  const name = nameFromPrompt(prompt, kind);
  const items = seedItems(kind, prompt);
  return {
    name,
    kicker: meta.kicker,
    kind,
    theme: /\bdark\b/i.test(prompt) ? "dark" : "light",
    accent: accentFromPrompt(prompt),
    search: !/\bno search\b/i.test(prompt),
    addLabel: meta.add,
    primaryAction: meta.action,
    itemNoun: meta.noun,
    formTitle: meta.form,
    stats: seedStats(kind, items),
    items,
  };
}

function extractAddedTitle(prompt: string, noun: string) {
  const named = prompt.match(
    new RegExp(
      `\\b(?:add|create|new)\\b[\\s\\w]{0,24}\\b${noun}\\b(?:\\s+(?:called|named))?\\s*([A-Za-z0-9][\\w&'\\s-]{1,40})`,
      "i",
    ),
  );
  if (named?.[1]) {
    const cleaned = named[1].trim().replace(/^(called|named)\s+/i, "");
    if (looksLikeName(cleaned)) return titleCase(cleaned);
  }
  const quoted = prompt.match(/["“']([^"”']{2,40})["”']/);
  if (quoted) return titleCase(quoted[1]);
  return null;
}

export function mergeSpec(current: AppSpec, prompt: string): AppSpec {
  const next: AppSpec = {
    ...current,
    items: current.items.map((item) => ({ ...item })),
    stats: current.stats.map((s) => ({ ...s })),
  };

  if (/\b(start over|new app|rebuild|from scratch)\b/i.test(prompt) || prompt.length > 140) {
    return specFromPrompt(prompt, current.kind);
  }

  if (/\bdark mode\b|\bmake it dark\b|\bdarker\b/i.test(prompt)) next.theme = "dark";
  if (/\blight mode\b|\bmake it light\b|\bbrighter\b/i.test(prompt)) next.theme = "light";
  next.accent = accentFromPrompt(prompt, next.accent);

  if (/\bhide search\b|\bno search\b/i.test(prompt)) next.search = false;
  if (/\badd (a )?search\b|\bsearch bar\b/i.test(prompt)) next.search = true;

  const rename = prompt.match(
    /\b(?:rename(?: it)? to|call it|title(?: should be)?)\s+([A-Za-z][\w&'’-]{1,28}(?:\s+[A-Za-z][\w&'’-]{1,20}){0,3})/i,
  );
  if (rename && looksLikeName(rename[1])) next.name = titleCase(rename[1]);

  const added = extractAddedTitle(prompt, next.itemNoun);
  if (added || /\badd (a )?(row|card|item|job|product|client|booking)\b/i.test(prompt)) {
    next.items.unshift({
      title: added ?? `New ${next.itemNoun}`,
      subtitle: "Added just now",
      badge: "New",
      tone: "hold",
    });
  }

  const kindShift = kindFromText(prompt, next.kind);
  if (kindShift !== next.kind && /\b(switch|change|make it|turn this into)\b/i.test(prompt)) {
    const rebuilt = specFromPrompt(prompt, kindShift);
    return { ...rebuilt, name: next.name, theme: next.theme, accent: next.accent };
  }

  next.stats = seedStats(next.kind, next.items);
  return next;
}

export function readSpec(files: Record<string, string>): AppSpec | null {
  const raw = files["spec.json"];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppSpec;
  } catch {
    return null;
  }
}

export function kindFromTemplate(templateId: string): AppKind {
  if (templateId === "inventory") return "inventory";
  if (templateId === "booking") return "booking";
  if (templateId === "portal") return "jobs";
  return "jobs";
}

export const TRIAL_CREDITS = Number(process.env.TRIAL_CREDITS ?? 100);
export const BASE_CREDIT_COST = 8;

export const MARKETING_URL =
  process.env.NEXT_PUBLIC_MARKETING_URL ?? "https://supportsidetech.com";

export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "http://localhost:3000";

/** Server-only. Never expose this with a NEXT_PUBLIC_ prefix. */
export const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function quoteUrl(params?: { project?: string; source?: string }) {
  const url = new URL("/#contact", MARKETING_URL);
  if (params?.source) url.searchParams.set("source", params.source);
  if (params?.project) url.searchParams.set("project", params.project);
  return url.toString();
}

export function redactSecrets(message: string) {
  return message.replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]");
}

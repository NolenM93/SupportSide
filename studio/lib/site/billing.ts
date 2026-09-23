export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_ID?.trim());
}

export const PLAN_LABEL = process.env.NEXT_PUBLIC_PLAN_NAME ?? "Support Side Hosting";
export const PLAN_PRICE = process.env.NEXT_PUBLIC_PLAN_PRICE ?? "$29/month";

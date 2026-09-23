import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSubscription } from "@/lib/data/site-store";
import { isStripeConfigured } from "@/lib/site/billing";
import { getStripe } from "@/lib/site/stripe";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 400 });
  }
  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_ID!;
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 400 });

  const origin = new URL(request.url).origin;
  const sub = await ensureSubscription(user.id);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/account?billing=success`,
    cancel_url: `${origin}/account?billing=cancel`,
    customer: sub.stripeCustomerId ?? undefined,
    customer_email: sub.stripeCustomerId ? undefined : user.email,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  });
  return NextResponse.json({ url: session.url });
}

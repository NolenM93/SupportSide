import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { ensureSubscription } from "@/lib/data/site-store";
import { getStripe } from "@/lib/site/stripe";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stripe = getStripe();
  const sub = await ensureSubscription(user.id);
  if (!stripe || !sub.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account yet. Subscribe first." }, { status: 400 });
  }
  const origin = new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/account`,
  });
  return NextResponse.json({ url: session.url });
}

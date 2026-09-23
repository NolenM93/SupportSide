import { NextResponse } from "next/server";
import { saveSubscription } from "@/lib/data/site-store";
import { getStripe } from "@/lib/site/stripe";
import type { BillingStatus, Subscription } from "@/lib/site/types";

function periodEndIso(sub: { current_period_end?: number }) {
  return typeof sub.current_period_end === "number"
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;
}

function trialEndIso(sub: { trial_end?: number | null }) {
  return typeof sub.trial_end === "number" ? new Date(sub.trial_end * 1000).toISOString() : null;
}

function billingStatus(status: string): BillingStatus {
  if (status === "active") return "active";
  if (status === "trialing") return "trialing";
  return "canceled";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId || session.client_reference_id;
    if (userId && session.subscription && session.customer) {
      const sub = (await stripe.subscriptions.retrieve(String(session.subscription))) as {
        status: string;
        current_period_end?: number;
        cancel_at_period_end: boolean;
        trial_end?: number | null;
      };
      const record: Subscription = {
        userId,
        status: billingStatus(sub.status),
        stripeCustomerId: String(session.customer),
        stripeSubscriptionId: String(session.subscription),
        currentPeriodEnd: periodEndIso(sub),
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        trialEndsAt: trialEndIso(sub),
      };
      await saveSubscription(record);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as {
      id: string;
      status: string;
      customer: string;
      metadata?: { userId?: string };
      current_period_end?: number;
      cancel_at_period_end: boolean;
      trial_end?: number | null;
    };
    const userId = sub.metadata?.userId;
    if (userId) {
      const record: Subscription = {
        userId,
        status: billingStatus(sub.status),
        stripeCustomerId: String(sub.customer),
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: periodEndIso(sub),
        cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
        trialEndsAt: trialEndIso(sub),
      };
      await saveSubscription(record);
    }
  }

  return NextResponse.json({ received: true });
}

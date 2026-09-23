import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canPublish, ensureSubscription } from "@/lib/data/site-store";
import { isStripeConfigured, PLAN_LABEL, PLAN_PRICE } from "@/lib/site/billing";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await ensureSubscription(user.id);
  return NextResponse.json({
    email: user.email,
    subscription: sub,
    canPublish: canPublish(sub),
    stripe: isStripeConfigured(),
    plan: { name: PLAN_LABEL, price: PLAN_PRICE },
  });
}

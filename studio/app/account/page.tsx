import { requireUser } from "@/lib/auth";
import { canPublish, ensureSubscription } from "@/lib/data/site-store";
import { isStripeConfigured, PLAN_LABEL, PLAN_PRICE } from "@/lib/site/billing";
import { AccountClient } from "@/components/AccountClient";

export default async function AccountPage() {
  const user = await requireUser();
  const subscription = await ensureSubscription(user.id);
  return (
    <AccountClient
      email={user.email}
      subscription={subscription}
      canPublish={canPublish(subscription)}
      stripe={isStripeConfigured()}
      plan={{ name: PLAN_LABEL, price: PLAN_PRICE }}
    />
  );
}

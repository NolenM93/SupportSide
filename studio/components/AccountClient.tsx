"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Subscription } from "@/lib/site/types";

export function AccountClient({
  email,
  subscription,
  canPublish,
  stripe,
  plan,
}: {
  email: string;
  subscription: Subscription;
  canPublish: boolean;
  stripe: boolean;
  plan: { name: string; price: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Checkout is not ready.");
  }

  async function portal() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await res.json()) as { url?: string; error?: string };
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Billing portal is not ready.");
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const status =
    subscription.status === "active"
      ? "Active"
      : subscription.status === "trialing"
        ? "Trial"
        : "Inactive";

  return (
    <div className="tab-safe mx-auto w-full max-w-lg px-5 pt-4">
      <h1 className="large-title mb-6">Account</h1>
      <div className="grouped-list">
        <div className="grouped-row">
          <div>
            <div className="text-sm text-[var(--secondary)]">Email</div>
            <div className="font-semibold">{email}</div>
          </div>
        </div>
        <div className="grouped-row">
          <div>
            <div className="text-sm text-[var(--secondary)]">Plan</div>
            <div className="font-semibold">
              {plan.name} · {status}
            </div>
            <div className="text-sm text-[var(--secondary)]">
              {canPublish ? "You can publish." : "Subscribe to publish a live site."}
              {!stripe && " Stripe is not connected yet — publishing is open in this environment."}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 mb-2 text-sm font-semibold text-[var(--secondary)]">Billing</p>
      <div className="grouped-list">
        <button type="button" className="grouped-row w-full text-left" onClick={() => void checkout()}>
          <div className="flex-1">
            <div className="font-semibold">Subscribe · {plan.price}</div>
            <div className="text-sm text-[var(--secondary)]">Monthly hosting. Cancel anytime.</div>
          </div>
          <span className="text-[var(--tertiary)]">›</span>
        </button>
        <button type="button" className="grouped-row w-full text-left" onClick={() => void portal()}>
          <div className="flex-1">
            <div className="font-semibold">Cancel or reactivate</div>
            <div className="text-sm text-[var(--secondary)]">Stripe customer portal.</div>
          </div>
          <span className="text-[var(--tertiary)]">›</span>
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--red)]">{error}</p>}
      <button type="button" className="ios-btn ios-btn-ghost mt-8 w-full" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}

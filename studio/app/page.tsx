import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PLAN_LABEL, PLAN_PRICE } from "@/lib/site/billing";

export default async function MarketingPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16">
      <p className="chip w-fit">Support Side</p>
      <h1 className="large-title mt-4">A site for your business. We host it.</h1>
      <p className="mt-4 text-lg text-[var(--secondary)]">
        Describe the company. Edit the words and colors. Publish. You stay on the tools — we keep
        the lights on.
      </p>
      <ul className="mt-8 space-y-2 text-sm text-[var(--secondary)]">
        <li>Generate from a prompt (Home, About, Services, Contact)</li>
        <li>Edit copy, photos later, colors, section order</li>
        <li>Preview desktop / tablet / phone</li>
        <li>Publish + rollback. {PLAN_LABEL} is {PLAN_PRICE}.</li>
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={user ? "/sites" : "/login"} className="ios-btn">
          {user ? "My sites" : "Start"}
        </Link>
        <Link href="/login" className="ios-btn ios-btn-ghost">
          Sign in
        </Link>
      </div>
    </div>
  );
}

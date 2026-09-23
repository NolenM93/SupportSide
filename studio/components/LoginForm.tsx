"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState<"local" | "supabase" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/auth/login")
      .then((res) => res.json())
      .then((data: { provider?: string }) => {
        setProvider(data.provider === "supabase" ? "supabase" : "local");
      });
    void fetch("/api/me").then((res) => {
      if (res.ok) {
        router.push("/sites");
        router.refresh();
      }
    });
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { error?: string; method?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not sign in.");
      return;
    }
    if (data.method === "magic_link") {
      setMessage("Check your email for a sign-in link.");
      return;
    }
    router.push("/sites");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <p className="chip w-fit">Support Side</p>
      <h1 className="large-title mt-4">Sign in to your sites</h1>
      <p className="mt-3 text-[var(--secondary)]">
        Generate a page, edit it, publish. We host it.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="ios-input"
        />
        <button type="submit" className="ios-btn w-full" disabled={busy}>
          {busy
            ? "Please wait…"
            : provider === "supabase"
              ? "Email me a sign-in link"
              : "Continue"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-[var(--green)]">{message}</p>}
      {error && <p className="mt-4 text-sm text-[var(--red)]">{error}</p>}
    </div>
  );
}

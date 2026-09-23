import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  localBalance,
  localEnsureTrial,
  localGetUserBySession,
  LOCAL_SESSION_COOKIE,
} from "@/lib/data/local-store";
import { sbBalance, sbEnsureProfile } from "@/lib/data/supabase-store";
import type { SessionUser } from "@/lib/types";

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    await sbEnsureProfile(supabase, user.id, user.email);
    return { id: user.id, email: user.email };
  }

  const jar = await cookies();
  return localGetUserBySession(jar.get(LOCAL_SESSION_COOKIE)?.value);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCreditBalance(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) return 0;
    return sbBalance(supabase, userId);
  }
  await localEnsureTrial(userId);
  return localBalance(userId);
}

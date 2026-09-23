import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import { localLogout, LOCAL_SESSION_COOKIE } from "@/lib/data/local-store";

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase?.auth.signOut();
  } else {
    const jar = await cookies();
    await localLogout(jar.get(LOCAL_SESSION_COOKIE)?.value);
    jar.delete(LOCAL_SESSION_COOKIE);
  }
  return NextResponse.json({ ok: true });
}

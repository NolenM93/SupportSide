import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";
import { localLogin, LOCAL_SESSION_COOKIE } from "@/lib/data/local-store";

export async function GET() {
  return NextResponse.json({
    provider: isSupabaseConfigured() ? "supabase" : "local",
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Auth is not configured." }, { status: 500 });
    }
    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, method: "magic_link" });
  }

  const { token } = await localLogin(email);
  const jar = await cookies();
  jar.set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true, method: "session" });
}

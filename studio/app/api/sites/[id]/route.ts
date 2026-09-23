import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSiteForUser, updateSite } from "@/lib/data/site-store";
import type { SiteContent } from "@/lib/site/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const site = await getSiteForUser(user.id, id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ site });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const patch = (await request.json()) as Partial<SiteContent>;
  const site = await updateSite(user.id, id, patch);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ site });
}

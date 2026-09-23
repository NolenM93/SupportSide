import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canPublish, ensureSubscription, getSiteForUser, publishSite } from "@/lib/data/site-store";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await ensureSubscription(user.id);
  if (!canPublish(sub)) {
    return NextResponse.json(
      { error: "Subscribe to publish. Trial ended.", code: "paywall" },
      { status: 402 },
    );
  }
  const { id } = await ctx.params;
  const site = await getSiteForUser(user.id, id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const published = await publishSite(user.id, id);
  return NextResponse.json({ site: published });
}

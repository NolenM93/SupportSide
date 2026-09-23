import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rollbackSite } from "@/lib/data/site-store";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const site = await rollbackSite(user.id, id);
  if (!site) {
    return NextResponse.json({ error: "No previous version to restore." }, { status: 400 });
  }
  return NextResponse.json({ site });
}

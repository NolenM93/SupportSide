import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSiteForUser, updateSite } from "@/lib/data/site-store";
import { runSiteAgent } from "@/lib/site/agent";
import type { SiteContent } from "@/lib/site/types";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await request.json()) as { instruction?: string; draft?: Partial<SiteContent> };
  const instruction = body.instruction?.trim();
  if (!instruction) {
    return NextResponse.json({ error: "Tell the agent what to change." }, { status: 400 });
  }
  const site = await getSiteForUser(user.id, id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await runSiteAgent({ site, instruction, draft: body.draft });
  const saved = await updateSite(user.id, id, {
    name: result.content.name,
    slug: result.content.slug,
    theme: result.content.theme,
    sections: result.content.sections,
    pageTitle: result.content.pageTitle,
    metaDescription: result.content.metaDescription,
    agentMessages: result.messages,
  });
  if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ site: saved, note: result.note });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canPublish, createSite, ensureSubscription, listSites } from "@/lib/data/site-store";
import { generateSiteContent } from "@/lib/site/generate";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sites = await listSites(user.id);
  return NextResponse.json({ sites });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { prompt?: string };
  const prompt = body.prompt?.trim();
  if (!prompt) return NextResponse.json({ error: "Describe the business." }, { status: 400 });
  await ensureSubscription(user.id);
  const content = await generateSiteContent(prompt);
  const site = await createSite(user.id, content, prompt);
  return NextResponse.json({ site, canPublish: canPublish(await ensureSubscription(user.id)) });
}

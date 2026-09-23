import { notFound } from "next/navigation";
import { PreviewClient } from "@/components/builder/PreviewClient";
import { requireUser } from "@/lib/auth";
import { getSiteForUser } from "@/lib/data/site-store";

export default async function SitePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const site = await getSiteForUser(user.id, id);
  if (!site) notFound();
  return <PreviewClient site={site} backHref={`/sites/${site.id}`} />;
}

import { notFound } from "next/navigation";
import { SiteView } from "@/components/site/SiteView";
import { getPublishedBySlug } from "@/lib/data/site-store";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getPublishedBySlug(slug);
  if (!site?.live) return { title: "Site" };
  return { title: site.live.pageTitle, description: site.live.metaDescription };
}

export default async function PublicSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getPublishedBySlug(slug);
  if (!site?.live) notFound();
  return <SiteView site={site.live} />;
}

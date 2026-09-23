import { notFound } from "next/navigation";
import { EditorClient } from "@/components/builder/EditorClient";
import { requireUser } from "@/lib/auth";
import { getSiteForUser } from "@/lib/data/site-store";

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const site = await getSiteForUser(user.id, id);
  if (!site) notFound();
  return <EditorClient site={site} />;
}

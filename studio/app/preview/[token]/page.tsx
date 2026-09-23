import { notFound } from "next/navigation";
import { SiteView } from "@/components/site/SiteView";
import { getByPreviewToken } from "@/lib/data/site-store";

export default async function DraftPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const site = await getByPreviewToken(token);
  if (!site) notFound();
  return (
    <div>
      <p className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
        Draft preview — not the live site.
      </p>
      <SiteView site={site} />
    </div>
  );
}

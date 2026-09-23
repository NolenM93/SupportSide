import { requireUser } from "@/lib/auth";
import { listSites } from "@/lib/data/site-store";
import { SitesHome } from "@/components/builder/SitesHome";

export default async function SitesPage() {
  const user = await requireUser();
  const sites = await listSites(user.id);
  return <SitesHome sites={sites} />;
}

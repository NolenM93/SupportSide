import { requireUser } from "@/lib/auth";
import { NewSiteForm } from "@/components/builder/NewSiteForm";

export default async function NewSitePage() {
  await requireUser();
  return <NewSiteForm />;
}

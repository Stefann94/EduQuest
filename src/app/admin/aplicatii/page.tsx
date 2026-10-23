import { Lock } from "lucide-react";
import type { Metadata } from "next";
import { ApplicationsList } from "@/components/admin/applications-list";
import { PageHeader } from "@/components/common/page-header";
import { getMentorApplications, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Aplicații mentori" };

export default async function ApplicationsPage() {
  // Pagina este doar pentru administratori; cu Supabase, verificarea se face pe sesiune.
  await getViewer("admin");
  const applications = await getMentorApplications();

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Aplicații mentori"
        description="Verifică aplicațiile pentru conturi de mentor. Un cont de mentor se activează doar după aprobare."
        meta={
          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <Lock className="size-3.5" aria-hidden="true" />
            Datele aplicanților sunt vizibile doar administratorilor.
          </span>
        }
      />
      <ApplicationsList applications={applications} />
    </div>
  );
}

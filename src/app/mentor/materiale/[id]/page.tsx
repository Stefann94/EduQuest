import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { PublicationBadge } from "@/components/common/status";
import { MATERIAL_KIND } from "@/components/learning/material-kind";
import { materialDraft } from "@/components/mentor-content/drafts";
import { MaterialForm } from "@/components/mentor-content/material-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { canEditContent } from "@/lib/data/mentor-content-queries";
import {
  demoIds,
  getMaterial,
  getMentorClasses,
  getViewer,
} from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

type Props = PageProps<"/mentor/materiale/[id]">;

export const metadata: Metadata = { title: "Editează materialul" };

export function generateStaticParams() {
  return demoIds.materials();
}

export default function EditMaterialPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const material = await getMaterial(me, id);
  if (!material) notFound();
  const { active, archived } = await getMentorClasses(me.id);
  const editable = canEditContent(me.id, material);

  // Clasa materialului rămâne în listă chiar dacă a fost arhivată între timp.
  const classes = [
    ...active,
    ...archived.filter((c) => c.id === material.classId),
  ].map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="grid gap-6">
      <PageHeader
        title={material.title}
        description={`${MATERIAL_KIND[material.kind].label} · ${material.className ?? "Resursă globală"} · adăugat pe ${formatDate(material.publishedAt)}`}
        back={{ href: "/mentor/materiale", label: "Materiale" }}
        meta={<PublicationBadge status={material.status} />}
      />
      <MaterialForm
        draft={materialDraft(material)}
        classes={classes}
        readOnlyReason={
          editable
            ? undefined
            : `Această resursă globală a fost publicată de ${material.author.displayName}. O poți consulta, dar doar autorul o poate modifica.`
        }
      />
    </div>
  );
}

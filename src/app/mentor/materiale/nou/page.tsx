import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { materialDraft } from "@/components/mentor-content/drafts";
import { MaterialForm } from "@/components/mentor-content/material-form";
import { getMentorClasses, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Material nou" };

export default async function NewMaterialPage() {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Material nou"
        description="O lecție scrisă direct în platformă, o fișă PDF, un link util sau un videoclip. Îl poți salva ca ciornă și publica mai târziu."
        back={{ href: "/mentor/materiale", label: "Materiale" }}
      />
      <MaterialForm
        draft={materialDraft()}
        classes={active.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

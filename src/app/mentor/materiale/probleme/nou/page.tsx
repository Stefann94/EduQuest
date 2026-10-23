import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { problemDraft } from "@/components/mentor-content/drafts";
import { ProblemForm } from "@/components/mentor-content/problem-form";
import { getMentorClasses, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Problemă rezolvată nouă" };

export default async function NewProblemPage() {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Problemă rezolvată nouă"
        description="Enunțul, exemplele și soluția explicată pas cu pas. Elevii încearcă singuri înainte să vadă rezolvarea."
        back={{ href: "/mentor/materiale", label: "Materiale" }}
      />
      <ProblemForm
        draft={problemDraft()}
        classes={active.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

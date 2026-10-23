import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentForm } from "@/components/mentor-content/assignment-form";
import { getMentorClasses, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Temă nouă" };

export default async function NewAssignmentPage() {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Temă nouă"
        description="O temă pentru una dintre clasele tale. Elevii o pot trimite ca text, fișiere sau link, iar tu le răspunzi cu feedback și XP, fără note."
        back={{ href: "/mentor/teme", label: "Teme" }}
      />
      <AssignmentForm
        classes={active.map((c) => ({
          id: c.id,
          name: c.name,
          students: c.studentIds.length,
        }))}
      />
    </div>
  );
}

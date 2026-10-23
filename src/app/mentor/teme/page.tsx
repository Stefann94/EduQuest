import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { AssignmentList } from "@/components/mentor-content/assignment-list";
import { buttonVariants } from "@/components/ui/button";
import {
  getMentorAssignments,
  getMentorClasses,
  getViewer,
} from "@/lib/data/queries";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Teme" };

export default async function MentorAssignmentsPage() {
  const me = await getViewer("mentor");
  const [assignments, classes] = await Promise.all([
    getMentorAssignments(me.id),
    getMentorClasses(me.id),
  ]);
  const toReview = assignments.reduce((s, a) => s + a.counts.submitted, 0);
  // Întâi temele cu trimiteri de revizuit, apoi cele mai noi.
  const sorted = [...assignments].sort(
    (a, b) =>
      Number(b.counts.submitted > 0) - Number(a.counts.submitted > 0) ||
      b.publishedAt.localeCompare(a.publishedAt),
  );

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Teme"
        description={
          toReview > 0
            ? `Temele din clasele tale. Ai ${plural(toReview, "trimitere", "trimiteri")} care așteaptă feedback.`
            : "Temele din clasele tale. Toate trimiterile au primit feedback."
        }
        actions={
          <Link href="/mentor/teme/nou" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Temă nouă
          </Link>
        }
      />
      <AssignmentList
        assignments={sorted}
        classes={[...classes.active, ...classes.archived].map((c) => ({
          id: c.id,
          name: c.name,
        }))}
      />
    </div>
  );
}

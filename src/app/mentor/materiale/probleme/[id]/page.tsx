import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { DifficultyBadge, PublicationBadge } from "@/components/common/status";
import { problemDraft } from "@/components/mentor-content/drafts";
import { ProblemForm } from "@/components/mentor-content/problem-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { canEditContent } from "@/lib/data/mentor-content-queries";
import {
  demoIds,
  getMentorClasses,
  getViewer,
  getWorkedProblem,
} from "@/lib/data/queries";

type Props = PageProps<"/mentor/materiale/probleme/[id]">;

export const metadata: Metadata = { title: "Editează problema" };

export function generateStaticParams() {
  return demoIds.problems();
}

export default function EditProblemPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const problem = await getWorkedProblem(me, id);
  if (!problem) notFound();
  const { active, archived } = await getMentorClasses(me.id);
  const classes = [
    ...active,
    ...archived.filter((c) => c.id === problem.classId),
  ].map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="grid gap-6">
      <PageHeader
        title={problem.title}
        description={`Problemă rezolvată · ${problem.topic} · ${problem.className ?? "Resursă globală"}`}
        back={{ href: "/mentor/materiale", label: "Materiale" }}
        meta={
          <>
            <PublicationBadge status={problem.status} />
            <DifficultyBadge level={problem.difficulty} />
          </>
        }
      />
      <ProblemForm
        draft={problemDraft(problem)}
        classes={classes}
        readOnlyReason={
          canEditContent(me.id, problem)
            ? undefined
            : `Această problemă globală a fost publicată de ${problem.author.displayName}. O poți consulta, dar doar autorul o poate modifica.`
        }
      />
    </div>
  );
}

import { CalendarClock } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBlock } from "@/components/common/code-block";
import { PageHeader } from "@/components/common/page-header";
import { UserAvatar } from "@/components/common/user-avatar";
import {
  ReviewPanel,
  type ReviewProblem,
} from "@/components/homework/review-panel";
import { RichText } from "@/components/learning/content-blocks";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { placeholderParams } from "@/lib/db/core";
import { getStudentWorkForMentor } from "@/lib/db/homework";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Evaluare temă" };

type Props = PageProps<"/mentor/teme/[id]/[atribuire]/[elev]">;

export function generateStaticParams() {
  return placeholderParams("id", "atribuire", "elev");
}

export default function ReviewPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id, atribuire, elev } = await params;
  const me = await requireUser("mentor");
  const work = await getStudentWorkForMentor(me.id, atribuire, elev);
  if (!work || work.assignment.homeworkId !== id) notFound();
  const { assignment: a, student } = work;

  const problems: ReviewProblem[] = work.problems.map((p) => ({
    id: p.id,
    title: p.title,
    required: p.required,
    state: p.state,
    submissionId: p.submissionId,
    feedback: p.feedback?.text,
    attempts: p.attempts,
    statement: p.statement.split(/\n{2,}/).map((para) => (
      <p key={para}>
        <RichText text={para} />
      </p>
    )),
    latest: p.attempts[0] ? (
      <CodeBlock code={p.attempts[0].code} language={p.language} />
    ) : undefined,
  }));

  return (
    <div className="grid max-w-4xl gap-6">
      <PageHeader
        back={{ href: `/mentor/teme/${id}?clasa=${a.classId}`, label: a.title }}
        title={student.displayName}
        description={`${a.title} · ${a.className}`}
        meta={
          <>
            <UserAvatar
              name={student.displayName}
              avatar={student.avatar}
              size="sm"
            />
            {a.deadline ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
                <CalendarClock className="size-4" aria-hidden="true" />
                Termen {formatDateTime(a.deadline)}
              </span>
            ) : null}
          </>
        }
      />
      <ReviewPanel
        assignmentId={a.id}
        studentId={student.id}
        studentName={student.displayName.split(" ")[0]}
        problems={problems}
        maxBonus={a.maxBonusXp}
        bonus={work.review?.bonusXp ?? null}
        note={work.review?.note ?? ""}
      />
    </div>
  );
}

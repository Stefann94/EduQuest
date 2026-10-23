import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { DifficultyBadge } from "@/components/common/status";
import { quizDraft } from "@/components/mentor-content/drafts";
import { QuizForm } from "@/components/mentor-content/quiz-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { canEditContent } from "@/lib/data/mentor-content-queries";
import {
  demoIds,
  getMentorClasses,
  getQuiz,
  getUser,
  getViewer,
} from "@/lib/data/queries";
import { plural } from "@/lib/format";

type Props = PageProps<"/mentor/quiz/[id]">;

export const metadata: Metadata = { title: "Editează quiz-ul" };

export function generateStaticParams() {
  return demoIds.quizzes();
}

export default function EditQuizPage({ params }: Props) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const quiz = await getQuiz(me, id);
  if (!quiz) notFound();
  const [{ active, archived }, author] = await Promise.all([
    getMentorClasses(me.id),
    getUser(quiz.authorId),
  ]);
  const classes = [
    ...active,
    ...archived.filter((c) => c.id === quiz.classId),
  ].map((c) => ({ id: c.id, name: c.name }));
  const className = classes.find((c) => c.id === quiz.classId)?.name;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={quiz.title}
        description={`${className ?? "Exersare globală"} · ${plural(quiz.questions.length, "întrebare", "întrebări")}`}
        back={{ href: "/mentor/quiz", label: "Quiz-uri" }}
        meta={<DifficultyBadge level={quiz.difficulty} />}
      />
      <QuizForm
        draft={quizDraft(quiz)}
        classes={classes}
        readOnlyReason={
          canEditContent(me.id, quiz)
            ? undefined
            : `Acest quiz de exersare a fost creat de ${author?.displayName ?? "alt mentor"}. Îl poți consulta, dar doar autorul îl poate modifica.`
        }
      />
    </div>
  );
}

import { Archive, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatusBadge } from "@/components/common/status";
import { LiveQuizStart } from "@/components/mentor-content/live-quiz-start";
import { QuizArchiveButton } from "@/components/mentor-content/quiz-archive-button";
import { QuizDeleteButton } from "@/components/mentor-content/quiz-delete-button";
import { QuizForm } from "@/components/mentor-content/quiz-form";
import { FormSkeleton } from "@/components/mentor-content/skeletons";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { getMentorLessons } from "@/lib/db/lessons";
import { getQuizForEditor } from "@/lib/db/quizzes";
import { plural } from "@/lib/format";

type Props = PageProps<"/mentor/quiz/[id]">;

export const metadata: Metadata = { title: "Editează quiz-ul" };

export function generateStaticParams() {
  return placeholderParams("id");
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
  const me = await requireUser("mentor");
  const [quiz, lessons, classes] = await Promise.all([
    getQuizForEditor(me.id, id),
    getMentorLessons(me.id),
    getMentorClasses(me.id),
  ]);
  if (!quiz) notFound();

  return (
    <div className="grid gap-6">
      <PageHeader
        back={
          quiz.live
            ? { href: "/mentor/quiz/live/quiz-uri", label: "Quiz-uri live" }
            : { href: "/mentor/quiz/clase", label: "Quiz-uri pentru clase" }
        }
        title={quiz.title}
        description={`${quiz.live ? "Quiz live" : quiz.kind === "recap" ? "Recapitulare" : "Quiz de lecție"} · ${plural(quiz.questions.length, "întrebare", "întrebări")}`}
        actions={
          <>
            {quiz.archived ? (
              <StatusBadge icon={Archive} tone="warning">
                Arhivat
              </StatusBadge>
            ) : null}
            <QuizArchiveButton
              quizId={quiz.id}
              title={quiz.title}
              archived={quiz.archived}
            />
            <QuizDeleteButton
              quizId={quiz.id}
              title={quiz.title}
              icon={<Trash2 />}
            />
            {quiz.live && !quiz.archived ? (
              <LiveQuizStart
                quizId={quiz.id}
                questionCount={quiz.questions.length}
                classes={classes.active.map((c) => ({
                  id: c.id,
                  name: c.name,
                }))}
                size="lg"
                label="Deschide o sesiune live"
              />
            ) : null}
          </>
        }
      />
      {quiz.archived ? (
        <p className="flex items-start gap-2 bg-warning-soft px-4 py-3 text-sm">
          <Archive className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {quiz.live
            ? "Quiz-ul e arhivat: nu se mai poate juca live. Clasamentele sesiunilor de până acum rămân."
            : "Quiz-ul e arhivat: elevii nu-l mai pot rezolva, dar își văd rezultatele de până acum."}
        </p>
      ) : null}
      <QuizForm
        draft={{
          id: quiz.id,
          live: quiz.live,
          title: quiz.title,
          description: quiz.description,
          lessonIds: quiz.lessonIds,
          xp: quiz.xp,
          timeLimitSec: quiz.timeLimitSec,
          classIds: quiz.classIds,
          questions: quiz.questions.map((q) => ({
            prompt: q.prompt,
            code: q.code,
            options: q.options,
            multi: q.multi,
            correct: q.correct,
            explanation: q.explanation,
            lessonId: q.lessonId,
            timeSec: q.timeSec,
          })),
        }}
        lessons={lessons.map((l) => ({ id: l.id, title: l.title }))}
        classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

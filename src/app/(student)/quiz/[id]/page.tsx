import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { QuizPlayer, type QuizPlayerData } from "@/components/quiz/quiz-player";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth";
import { placeholderParams } from "@/lib/db/core";
import { getQuizForPlayer } from "@/lib/db/quizzes";

type Props = PageProps<"/quiz/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const me = await requireUser("student");
  const quiz = await getQuizForPlayer(me.id, id);
  return { title: quiz?.title ?? "Quiz" };
}

export default function QuizPage({ params }: Props) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("student");
  const quiz = await getQuizForPlayer(me.id, id);
  if (!quiz) notFound();

  const back =
    quiz.course && quiz.kind !== "practice"
      ? { href: "/invatare?tab=quiz", label: "Învățare" }
      : { href: "/quiz", label: "Quiz-uri" };
  const scope =
    quiz.kind === "practice"
      ? "Exersare · noțiuni de bază de Python"
      : quiz.kind === "recap"
        ? "Recapitulare"
        : "Quiz de lecție";
  // Doar datele sigure ajung în browser: întrebările vin deja fără răspunsuri.
  const data: QuizPlayerData = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    label:
      quiz.lessons.length > 0 ? `${scope} · ${quiz.lessons.join(", ")}` : scope,
    className: quiz.className,
    timeLimitSec: quiz.timeLimitSec,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      code: q.code,
      options: q.options,
      multi: q.multi,
    })),
    xp: quiz.xp,
    used: quiz.attempts.count,
    best: quiz.attempts.best,
    archived: quiz.archived,
    backHref: back.href,
    backLabel: `Înapoi la ${back.label}`,
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        back={back}
        title={quiz.title}
        description={
          quiz.course
            ? `Exersare · ${quiz.course.title}`
            : quiz.className
              ? `Quiz dat clasei · ${quiz.className}`
              : undefined
        }
      />
      <QuizPlayer quiz={data} />
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
      <Skeleton className="mx-auto h-96 w-full max-w-2xl" />
    </div>
  );
}

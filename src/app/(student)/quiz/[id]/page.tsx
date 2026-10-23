import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { QuizPlayer, type QuizPlayerData } from "@/components/quiz/quiz-player";
import { Skeleton } from "@/components/ui/skeleton";
import { demoIds, getViewer } from "@/lib/data/queries";
import { getQuizForPlayer } from "@/lib/data/student-activity-queries";
import { formatDateTime, formatDay, relativeDays } from "@/lib/format";

type Props = PageProps<"/quiz/[id]">;

export function generateStaticParams() {
  return demoIds.quizzes();
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const me = await getViewer("student");
  const quiz = await getQuizForPlayer(me, id);
  return { title: quiz?.title ?? "Quiz" };
}

export default function QuizPage({ params }: Props) {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

const CLOSED: Record<string, string> = {
  not_open: "Quiz-ul nu este încă deschis.",
  closed: "Termenul quiz-ului a trecut.",
  no_attempts: "Ai folosit toate încercările pentru acest quiz.",
};

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("student");
  const quiz = await getQuizForPlayer(me, id);
  if (!quiz) notFound();

  const { availability: av, assignment } = quiz;
  // Doar datele sigure ajung în browser: întrebările sunt deja fără răspunsuri.
  const data: QuizPlayerData = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    className: quiz.className,
    timeLimitSec: quiz.timeLimitSec,
    questions: quiz.questions,
    mode: av.mode,
    isLiveQuiz: quiz.isLiveQuiz,
    assigned: assignment
      ? {
          deadlineLabel: `${formatDateTime(assignment.deadline)} (${relativeDays(assignment.deadline)})`,
          maxAttempts: assignment.maxAttempts,
          used: av.used,
          xp: assignment.xp,
          open: av.open,
          closedReason:
            av.reason === "not_open"
              ? `Quiz-ul se deschide pe ${formatDay(assignment.opensAt)}.`
              : av.reason
                ? CLOSED[av.reason]
                : undefined,
        }
      : undefined,
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        back={{ href: "/quiz", label: "Quiz-uri" }}
        title={quiz.title}
        description={
          assignment
            ? `Dat de mentor · ${quiz.className}`
            : quiz.classId
              ? `Quiz de clasă · ${quiz.className}`
              : "Quiz de exersare"
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
      <Skeleton className="mx-auto h-96 w-full max-w-2xl rounded-xl" />
    </div>
  );
}

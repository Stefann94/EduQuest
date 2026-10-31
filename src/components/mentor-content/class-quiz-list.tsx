import { Archive, ChevronRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge, XpBadge } from "@/components/common/status";
import type { MentorQuiz } from "@/lib/db/quizzes";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { QuizArchiveButton } from "./quiz-archive-button";

/**
 * Quiz-urile pentru clase: titlu, lecții, întrebări, clase (opțional), rezolvări și XP.
 * Cele arhivate stau separat, la final, în grupul „Arhivate”.
 */
export function ClassQuizList({
  quizzes,
  showClasses,
  empty,
}: {
  quizzes: MentorQuiz[];
  showClasses?: boolean;
  empty: { title: string; description: string; action?: React.ReactNode };
}) {
  const active = quizzes.filter((q) => !q.archived);
  const archived = quizzes.filter((q) => q.archived);
  return (
    <div className="grid gap-6">
      {active.length > 0 ? (
        <Rows quizzes={active} showClasses={showClasses} />
      ) : (
        <EmptyState icon={ListChecks} {...empty} />
      )}
      {archived.length > 0 ? (
        <section aria-labelledby="quiz-arhivate" className="grid gap-2">
          <h2
            id="quiz-arhivate"
            className="flex items-center gap-2 font-bold font-heading text-muted-foreground text-sm uppercase tracking-wide"
          >
            <Archive className="size-4" aria-hidden="true" />
            Arhivate ({archived.length})
          </h2>
          <Rows quizzes={archived} showClasses={showClasses} />
        </section>
      ) : null}
    </div>
  );
}

function Rows({
  quizzes,
  showClasses,
}: {
  quizzes: MentorQuiz[];
  showClasses?: boolean;
}) {
  return (
    <ul className="stagger grid gap-2">
      {quizzes.map((q) => (
        <li
          key={q.id}
          className={cn(
            "flex cut-sm flex-wrap items-center gap-x-2 gap-y-1 bg-card pr-2",
            q.archived && "bg-card/60",
          )}
        >
          <Link
            href={`/mentor/quiz/${q.id}`}
            className="group flex min-w-0 flex-1 basis-72 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-10 shrink-0 cut-xs place-items-center",
                q.archived
                  ? "bg-secondary text-muted-foreground"
                  : "bg-cyan text-cyan-foreground",
              )}
            >
              <ListChecks className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1 basis-56">
              <p className="truncate font-bold font-heading text-lg uppercase tracking-wide">
                {q.title}
              </p>
              <p className="truncate text-muted-foreground text-sm">
                {plural(q.questionCount, "întrebare", "întrebări")} ·{" "}
                {q.kind === "recap" ? "Recapitulare" : "Lecție"}
                {q.lessons.length
                  ? `: ${q.lessons.map((l) => l.title).join(", ")}`
                  : ""}
                {showClasses
                  ? ` · ${
                      q.classes.length
                        ? q.classes.map((c) => c.name).join(", ")
                        : "nedat niciunei clase"
                    }`
                  : ""}
              </p>
            </div>
            <span className="text-muted-foreground text-sm tabular-nums">
              {plural(q.attempts, "rezolvare", "rezolvări")}
            </span>
            {q.archived ? (
              <StatusBadge icon={Archive} tone="neutral">
                Arhivat
              </StatusBadge>
            ) : (
              <XpBadge amount={q.xp} />
            )}
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
          <QuizArchiveButton
            quizId={q.id}
            title={q.title}
            archived={q.archived}
            size="sm"
          />
        </li>
      ))}
    </ul>
  );
}

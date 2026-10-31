import { ChevronRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { XpBadge } from "@/components/common/status";
import type { MentorQuiz } from "@/lib/db/quizzes";
import { plural } from "@/lib/format";

/** Quiz-urile pentru clase: titlu, lecții, întrebări, clase (opțional), rezolvări și XP. */
export function ClassQuizList({
  quizzes,
  showClasses,
  empty,
}: {
  quizzes: MentorQuiz[];
  showClasses?: boolean;
  empty: { title: string; description: string; action?: React.ReactNode };
}) {
  if (quizzes.length === 0) return <EmptyState icon={ListChecks} {...empty} />;
  return (
    <ul className="stagger grid gap-2">
      {quizzes.map((q) => (
        <li key={q.id}>
          <Link
            href={`/mentor/quiz/${q.id}`}
            className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 cut-xs place-items-center bg-cyan text-cyan-foreground"
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
            <XpBadge amount={q.xp} />
            <ChevronRight
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

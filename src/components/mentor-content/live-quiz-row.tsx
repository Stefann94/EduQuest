import { Archive, Pencil, Radio } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import type { LiveSession, MentorQuiz } from "@/lib/db/quizzes";
import { formatDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LiveQuizStart } from "./live-quiz-start";
import { QuizArchiveButton } from "./quiz-archive-button";

/**
 * Un quiz live în listă: întrebările, lecțiile, sesiunile jucate și acțiunile (editare,
 * arhivare, deschiderea unei sesiuni; cel arhivat nu se mai poate juca).
 */
export function LiveQuizRow({
  quiz: q,
  sessions,
  classes,
}: {
  quiz: MentorQuiz;
  /** Sesiunile acestui quiz, cele mai noi primele. */
  sessions: LiveSession[];
  classes: { id: string; name: string }[];
}) {
  const last = sessions[0];
  return (
    <li className="flex cut-sm flex-wrap items-center gap-x-4 gap-y-3 bg-card px-4 py-3">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 shrink-0 cut-xs place-items-center",
          q.archived
            ? "bg-secondary text-muted-foreground"
            : "bg-quiz-red text-white",
        )}
      >
        <Radio className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <Link
          href={`/mentor/quiz/${q.id}`}
          className="block truncate font-bold font-heading text-lg uppercase tracking-wide outline-none hover:text-primary focus-visible:underline"
        >
          {q.title}
        </Link>
        <p className="truncate text-muted-foreground text-sm">
          {plural(q.questionCount, "întrebare", "întrebări")}
          {q.lessons.length
            ? ` · ${q.lessons.map((l) => l.title).join(", ")}`
            : ""}
          {" · "}
          {last
            ? `${plural(sessions.length, "sesiune", "sesiuni")}, ultima pe ${formatDate(last.createdAt)}`
            : "nejucat încă"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {q.archived ? (
          <StatusBadge icon={Archive} tone="neutral">
            Arhivat
          </StatusBadge>
        ) : null}
        <Link
          href={`/mentor/quiz/${q.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <Pencil aria-hidden="true" /> Editează
        </Link>
        <QuizArchiveButton
          quizId={q.id}
          title={q.title}
          archived={q.archived}
          size="sm"
        />
        {q.archived ? null : (
          <LiveQuizStart
            quizId={q.id}
            questionCount={q.questionCount}
            classes={classes}
            size="sm"
          />
        )}
      </div>
    </li>
  );
}

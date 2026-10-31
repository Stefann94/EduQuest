import {
  Archive,
  CheckCircle2,
  ChevronRight,
  ListChecks,
  PlayCircle,
  Radio,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, XpBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import { xpOutlook } from "@/lib/db/quiz-rules";
import type { LiveSession, PracticeQuiz, StudentQuiz } from "@/lib/db/quizzes";
import { formatDateTime, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

function QuizStateBadge({ quiz: q }: { quiz: StudentQuiz }) {
  if (q.archived)
    return (
      <StatusBadge icon={Archive} tone="neutral">
        Arhivat de mentor
      </StatusBadge>
    );
  if (q.attempts.count === 0)
    return (
      <StatusBadge icon={PlayCircle} tone="primary">
        Nou
      </StatusBadge>
    );
  if (q.attempts.best === q.attempts.total)
    return (
      <StatusBadge icon={CheckCircle2} tone="success">
        Perfect
      </StatusBadge>
    );
  return (
    <StatusBadge icon={RotateCcw} tone="neutral">
      Rezolvat
    </StatusBadge>
  );
}

/**
 * Un quiz dat clasei: lecțiile pe care le verifică, rezultatul și XP-ul rămas. Unul
 * arhivat de mentor nu se mai poate rezolva; pagina lui arată doar rezultatul.
 */
export function AssignedQuizRow({ quiz: q }: { quiz: StudentQuiz }) {
  const outlook = q.archived ? { max: 0 } : xpOutlook(q.xp, q.attempts.count);
  return (
    <Link
      href={`/quiz/${q.id}`}
      className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70 focus-visible:ring-inset"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 cut-xs place-items-center bg-primary-soft text-primary"
      >
        <ListChecks className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-bold font-heading text-lg uppercase leading-tight tracking-wide">
          {q.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          <span>
            {q.kind === "recap" ? "Recapitulare" : "Lecție"}
            {q.lessons.length > 0 ? `: ${q.lessons.join(", ")}` : ""}
          </span>
          <span aria-hidden="true">·</span>
          <span>{plural(q.questionCount, "întrebare", "întrebări")}</span>
          {q.attempts.best !== null ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Cel mai bun rezultat: {q.attempts.best}/{q.attempts.total}
              </span>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {outlook.max > 0 ? <XpBadge amount={outlook.max} /> : null}
        <QuizStateBadge quiz={q} />
      </div>
      <ChevronRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

/** O sesiune live deschisă acum: elevul intră cu codul primit de la mentor. */
export function OpenSessionCard({ session: s }: { session: LiveSession }) {
  return (
    <div className="flex cut-sm flex-wrap items-center gap-x-4 gap-y-3 bg-primary-soft p-4">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 hex place-items-center bg-primary text-primary-foreground"
      >
        <Radio className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-bold font-heading text-lg uppercase leading-tight tracking-wide">
          {s.title}
        </p>
        <p className="mt-0.5 text-muted-foreground text-sm">
          {s.status === "running" ? "În desfășurare" : "Se așteaptă jucătorii"}{" "}
          · cere-i mentorului codul
        </p>
      </div>
      <Link
        href="/live"
        className={cn(buttonVariants({ variant: "cta", size: "sm" }))}
      >
        Intră în joc
      </Link>
    </div>
  );
}

/** O sesiune live încheiată, cu locul și XP-ul elevului. */
export function PastSessionRow({
  session: s,
  studentId,
}: {
  session: LiveSession;
  studentId: string;
}) {
  const r = s.results.find((x) => x.student.id === studentId);
  return (
    <div className="flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 hex place-items-center bg-secondary text-muted-foreground"
      >
        <Trophy className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">{s.title}</p>
        <p className="mt-0.5 text-muted-foreground text-sm">
          {formatDateTime(s.endedAt ?? s.createdAt)}
        </p>
      </div>
      {r ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Locul <span className="font-semibold tabular-nums">{r.rank}</span>{" "}
            <span className="text-muted-foreground">
              din {s.results.length}
            </span>
          </span>
          <XpBadge amount={r.xp} />
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">
          Nu ai participat la această sesiune
        </span>
      )}
    </div>
  );
}

/**
 * Un quiz de exersare: întrebările, cel mai bun rezultat și ce XP mai aduce. Dacă l-a
 * rezolvat deja, elevul vede clar „Rezolvat”; îl poate repeta oricând.
 */
export function PracticeQuizRow({
  quiz: q,
  index,
}: {
  quiz: PracticeQuiz;
  index: number;
}) {
  const outlook = xpOutlook(q.xp, q.attempts.count);
  const solved = q.attempts.count > 0;
  return (
    <Link
      href={`/quiz/${q.id}`}
      className="group flex h-full cut-sm items-center gap-3 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-10 shrink-0 hex place-items-center font-extrabold font-heading tabular-nums",
          solved ? "bg-success text-white" : "bg-secondary text-foreground",
        )}
      >
        {solved ? <CheckCircle2 className="size-5" /> : index}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {q.title.replace(/^Exersare:\s*/, "")}
        </span>
        <span className="block text-muted-foreground text-sm">
          {plural(q.questionCount, "întrebare", "întrebări")}
          {solved
            ? ` · cel mai bun: ${q.attempts.best}/${q.attempts.total}`
            : ""}
        </span>
      </span>
      {solved ? (
        <StatusBadge icon={CheckCircle2} tone="success">
          Rezolvat
        </StatusBadge>
      ) : null}
      {outlook.max > 0 ? <XpBadge amount={outlook.max} /> : null}
    </Link>
  );
}

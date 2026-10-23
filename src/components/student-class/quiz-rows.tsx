import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  ListChecks,
  Lock,
  PlayCircle,
  Radio,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge, XpBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import type {
  AssignedQuiz,
  PastLiveSession,
  UpcomingLiveSession,
} from "@/lib/data/student-class-queries";
import { formatDateTime, formatDay, isPast, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

function quizState(q: AssignedQuiz) {
  const a = q.assignment;
  if (!a) return "open" as const;
  if (q.attempts.length >= a.maxAttempts) return "done" as const;
  if (isPast(a.deadline)) return "closed" as const;
  if (!isPast(a.opensAt)) return "soon" as const;
  return "open" as const;
}

function QuizStateBadge({ quiz }: { quiz: AssignedQuiz }) {
  switch (quizState(quiz)) {
    case "done":
      return (
        <StatusBadge icon={CheckCircle2} tone="success">
          Finalizat
        </StatusBadge>
      );
    case "closed":
      return (
        <StatusBadge icon={Lock} tone="neutral">
          Închis
        </StatusBadge>
      );
    case "soon":
      return (
        <StatusBadge icon={Clock} tone="info">
          Se deschide în curând
        </StatusBadge>
      );
    default:
      return quiz.attempts.length > 0 ? (
        <StatusBadge icon={PlayCircle} tone="primary">
          Încă o încercare
        </StatusBadge>
      ) : (
        <StatusBadge icon={PlayCircle} tone="primary">
          Disponibil
        </StatusBadge>
      );
  }
}

/** Un quiz dat în clasă: termen, încercări folosite și XP. */
export function AssignedQuizRow({ quiz: q }: { quiz: AssignedQuiz }) {
  const a = q.assignment;
  const best = q.attempts.reduce(
    (m, x) => (x.correct > (m?.correct ?? -1) ? x : m),
    undefined as (typeof q.attempts)[number] | undefined,
  );
  return (
    <Link
      href={`/quiz/${q.id}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3 outline-none transition-colors hover:border-foreground/15 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
      >
        <ListChecks className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-medium group-hover:text-primary">{q.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
          {a ? (
            <>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Termen {formatDay(a.deadline)} ({relativeDays(a.deadline)})
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {q.attempts.length} din {a.maxAttempts}{" "}
                {a.maxAttempts === 1 ? "încercare" : "încercări"} folosite
              </span>
            </>
          ) : (
            <span>{q.topic}</span>
          )}
          {best ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Cel mai bun rezultat: {best.correct}/{best.total}
              </span>
            </>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {a ? <XpBadge amount={a.xp} /> : null}
        <QuizStateBadge quiz={q} />
      </div>
      <ChevronRight
        className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </Link>
  );
}

/** O sesiune live programată: data și intrarea cu codul sesiunii. */
export function UpcomingSessionCard({
  session: s,
}: {
  session: UpcomingLiveSession;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border bg-card p-4">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary"
      >
        <Radio className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">{s.title}</p>
        <p className="mt-0.5 flex items-center gap-1 text-muted-foreground text-sm">
          <CalendarClock className="size-3.5" aria-hidden="true" />
          {formatDateTime(s.startsAt)} ({relativeDays(s.startsAt)})
        </p>
      </div>
      <Link
        href="/live"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Intră cu codul sesiunii
      </Link>
    </div>
  );
}

/** O sesiune live încheiată, cu locul și XP-ul elevului. */
export function PastSessionRow({ session: s }: { session: PastLiveSession }) {
  const r = s.myResult;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"
      >
        <Trophy className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="font-medium">{s.title}</p>
        <p className="mt-0.5 text-muted-foreground text-sm">
          {formatDateTime(s.startsAt)}
        </p>
      </div>
      {r ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Locul <span className="font-semibold tabular-nums">{r.rank}</span>{" "}
            <span className="text-muted-foreground">din {s.participants}</span>
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

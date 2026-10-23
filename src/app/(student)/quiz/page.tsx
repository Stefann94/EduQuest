import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock,
  Info,
  Lock,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { StatusBadge, XpBadge } from "@/components/common/status";
import {
  type PracticeQuizItem,
  PracticeQuizList,
} from "@/components/quiz/practice-quiz-list";
import { buttonVariants } from "@/components/ui/button";
import {
  getLiveSessions,
  getStudentQuizzes,
  getViewer,
} from "@/lib/data/queries";
import { quizAvailability } from "@/lib/data/student-activity-queries";
import { formatDateTime, formatDay, relativeDays } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Quiz-uri" };

const minutes = (sec: number) =>
  sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} s`;

export default async function QuizzesPage() {
  const me = await getViewer("student");
  const [{ assigned, practice }, sessions] = await Promise.all([
    getStudentQuizzes(me.id),
    getLiveSessions(me),
  ]);
  const upcoming = sessions.filter((s) => s.status !== "ended").reverse();

  const practiceItems: PracticeQuizItem[] = practice.map((q) => {
    const last = [...q.attempts].sort((a, b) => b.at.localeCompare(a.at))[0];
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      topic: q.topic,
      difficulty: q.difficulty,
      questionCount: q.questions.length,
      timeLimitLabel: q.timeLimitSec ? minutes(q.timeLimitSec) : undefined,
      lastResult: last
        ? `Ultimul rezultat: ${last.correct} din ${last.total} · ${formatDay(last.at)}`
        : undefined,
    };
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Quiz-uri"
        description="Quiz-urile date de mentori, exersare liberă pe subiecte și sesiunile live ale claselor tale."
        actions={
          <Link href="/live" className={buttonVariants()}>
            <Radio /> Intră într-un quiz live
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Date de mentori"
          description="Quiz-uri pentru clasele tale, cu termen și număr de încercări"
          className="lg:col-span-2"
          bodyClassName="p-3"
        >
          {assigned.length > 0 ? (
            <ul className="stagger grid gap-2">
              {assigned.map((q) => {
                const a = q.assignment;
                if (!a) return null;
                const av = quizAvailability(q, me.id);
                return (
                  <li key={q.id}>
                    <Link
                      href={`/quiz/${q.id}`}
                      className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3 outline-none transition-colors hover:border-foreground/15 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <div className="min-w-0 flex-1 basis-60">
                        <p className="font-medium group-hover:text-primary">
                          {q.title}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
                          <span>{q.className}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1",
                              av.reason === "closed" && "text-destructive",
                            )}
                          >
                            <CalendarClock
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            Termen {formatDateTime(a.deadline)} (
                            {relativeDays(a.deadline)})
                          </span>
                        </p>
                        <p className="mt-1 text-muted-foreground text-sm">
                          Încercări: {av.used} din {a.maxAttempts}
                          {q.timeLimitSec
                            ? ` · ${minutes(q.timeLimitSec)}`
                            : ""}{" "}
                          · {q.questions.length} întrebări
                        </p>
                      </div>
                      <XpBadge amount={a.xp} />
                      <AssignedStatus
                        reason={av.reason}
                        used={av.used}
                        opensAt={a.opensAt}
                      />
                      <ChevronRight
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Niciun quiz de la mentori"
              description="Când un mentor îți dă un quiz, îl vei vedea aici."
              className="border-0"
            />
          )}
        </Section>

        <Section title="Quiz-uri live programate" bodyClassName="p-3">
          {upcoming.length > 0 ? (
            <ul className="grid gap-2">
              {upcoming.map((s) => (
                <li key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <Radio className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {s.className}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-sm">
                        <CalendarClock
                          className="size-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {formatDateTime(s.startsAt)}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/live"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-3 w-full",
                    )}
                  >
                    Intră cu codul sesiunii
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-4 text-center text-muted-foreground text-sm">
              Niciun quiz live programat.
            </p>
          )}
          <p className="mt-2 px-2 pb-1 text-muted-foreground text-xs">
            Codul sesiunii îl primești de la mentor, la începutul quiz-ului.
          </p>
        </Section>
      </div>

      <section aria-labelledby="exersare-title" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="exersare-title" className="font-semibold text-base">
              Exersare
            </h2>
            <p className="text-muted-foreground text-sm">
              Quiz-uri deschise tuturor, pe subiecte. Le poți relua oricând.
            </p>
          </div>
          <p className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
            <Info className="size-3.5" aria-hidden="true" />
            Exersarea nu oferă XP
          </p>
        </div>
        <PracticeQuizList items={practiceItems} />
      </section>
    </div>
  );
}

function AssignedStatus({
  reason,
  used,
  opensAt,
}: {
  reason?: "not_open" | "closed" | "no_attempts";
  used: number;
  opensAt: string;
}) {
  if (reason === "not_open")
    return (
      <StatusBadge icon={Lock} tone="neutral">
        Se deschide {formatDay(opensAt)}
      </StatusBadge>
    );
  if (reason === "closed")
    return used > 0 ? (
      <StatusBadge icon={CheckCircle2} tone="success">
        Finalizat
      </StatusBadge>
    ) : (
      <StatusBadge icon={CircleAlert} tone="danger">
        Termen depășit
      </StatusBadge>
    );
  if (reason === "no_attempts")
    return (
      <StatusBadge icon={CheckCircle2} tone="success">
        Finalizat
      </StatusBadge>
    );
  if (used > 0)
    return (
      <StatusBadge icon={CheckCircle2} tone="success">
        Rezolvat · mai poți încerca
      </StatusBadge>
    );
  return (
    <StatusBadge icon={Clock} tone="info">
      De rezolvat
    </StatusBadge>
  );
}

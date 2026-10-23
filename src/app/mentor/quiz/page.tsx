import {
  CalendarClock,
  ChevronRight,
  Globe2,
  ListChecks,
  Plus,
  Radio,
  RotateCcw,
  Timer,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { DifficultyBadge, XpBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import { getMentorQuizzes, getViewer } from "@/lib/data/queries";
import type { Quiz } from "@/lib/data/types";
import { formatDateTime, isPast, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Quiz-uri" };

function formatLimit(sec?: number) {
  if (!sec) return "Fără limită de timp";
  if (sec % 60 === 0) return `${plural(sec / 60, "minut", "minute")}`;
  return `${sec} secunde`;
}

export default async function MentorQuizzesPage() {
  const me = await getViewer("mentor");
  const quizzes = await getMentorQuizzes(me.id);
  const assigned = quizzes.filter((q) => q.classId !== null);
  const practice = quizzes.filter((q) => q.classId === null);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Quiz-uri"
        description="Quiz-uri de exersare pentru toți elevii și quiz-uri date claselor tale, cu termen, încercări și XP."
        actions={
          <>
            <Link
              href="/mentor/live"
              className={buttonVariants({ variant: "outline" })}
            >
              <Radio aria-hidden="true" /> Sesiuni live
            </Link>
            <Link href="/mentor/quiz/nou" className={buttonVariants()}>
              <Plus aria-hidden="true" /> Quiz nou
            </Link>
          </>
        }
      />

      <Section
        card={false}
        title={`Date claselor (${assigned.length})`}
        description="Elevii le văd în clasă, cu fereastra de disponibilitate și termenul."
      >
        {assigned.length > 0 ? (
          <ul className="stagger grid gap-3 md:grid-cols-2">
            {assigned.map((q) => (
              <li key={q.id}>
                <QuizCard quiz={q} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Users}
            title="Niciun quiz dat unei clase"
            description="Creează un quiz și alege „O clasă” ca să le dai elevilor un termen și XP."
          />
        )}
      </Section>

      <Section
        card={false}
        title={`Exersare globală (${practice.length})`}
        description="Disponibile tuturor elevilor, indiferent de clasă."
      >
        {practice.length > 0 ? (
          <ul className="stagger grid gap-3 md:grid-cols-2">
            {practice.map((q) => (
              <li key={q.id}>
                <QuizCard quiz={q} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Globe2}
            title="Niciun quiz de exersare"
            description="Quiz-urile globale îi ajută pe elevi să exerseze în ritmul lor."
            action={
              <Link
                href="/mentor/quiz/nou"
                className={buttonVariants({ variant: "outline" })}
              >
                Quiz nou
              </Link>
            }
          />
        )}
      </Section>
    </div>
  );
}

function QuizCard({ quiz: q }: { quiz: Quiz & { className?: string } }) {
  const a = q.assignment;
  return (
    <Link
      href={`/mentor/quiz/${q.id}`}
      className="group grid h-full gap-3 rounded-xl border bg-card p-5 shadow-xs outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold group-hover:text-primary">{q.title}</p>
          <p className="mt-0.5 text-muted-foreground text-sm">
            {q.className ?? "Exersare globală"} · {q.topic}
          </p>
        </div>
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
        <DifficultyBadge level={q.difficulty} />
        <span className="inline-flex items-center gap-1">
          <ListChecks className="size-4" aria-hidden="true" />
          {plural(q.questions.length, "întrebare", "întrebări")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Timer className="size-4" aria-hidden="true" />
          {formatLimit(q.timeLimitSec)}
        </span>
      </div>
      {a ? (
        <dl className="grid gap-1.5 border-t pt-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Disponibil</dt>
            <CalendarClock
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <dd>
              {isPast(a.deadline) ? "Încheiat" : "Termen"}:{" "}
              {formatDateTime(a.deadline)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Încercări</dt>
            <RotateCcw
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <dd>
              {plural(a.maxAttempts, "încercare", "încercări")} · de la{" "}
              {formatDateTime(a.opensAt)}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Recompensă</dt>
            <dd>
              <XpBadge amount={a.xp} />
            </dd>
          </div>
        </dl>
      ) : q.classId ? (
        <p className="border-t pt-3 text-muted-foreground text-sm">
          Folosit în sesiunile live ale clasei.
        </p>
      ) : null}
    </Link>
  );
}

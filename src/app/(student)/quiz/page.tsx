import { ArrowRight, BookOpen, ClipboardList, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import {
  AssignedQuizRow,
  OpenSessionCard,
  PracticeQuizRow,
} from "@/components/student-class/quiz-rows";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import {
  getLiveSessions,
  getPracticeQuizzes,
  getStudentQuizzes,
} from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz-uri" };

export default function QuizzesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Quiz-uri"
        description="Quiz-urile date claselor tale, exersarea pe capitole și sesiunile live. Prima rezolvare aduce XP după scor, o repetare încă 1 XP."
        actions={
          <Link href="/live" className={buttonVariants()}>
            <Radio /> Intră într-un quiz live
          </Link>
        }
      />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const me = await requireUser("student");
  const [quizzes, sessions, practice] = await Promise.all([
    getStudentQuizzes(me.id),
    getLiveSessions(),
    getPracticeQuizzes(me.id),
  ]);
  const practiceDone = practice.filter((q) => q.attempts.count > 0).length;
  const open = sessions.filter((s) => s.status !== "ended");
  // Un quiz arhivat de mentor nu mai e de rezolvat; cel rezolvat deja rămâne cu rezultatul.
  const todo = quizzes.filter((q) => q.attempts.count === 0 && !q.archived);
  const done = quizzes.filter((q) => q.attempts.count > 0);

  return (
    <div className="grid gap-6">
      {open.length > 0 ? (
        <ul className="grid gap-2">
          {open.map((s) => (
            <li key={s.id}>
              <OpenSessionCard session={s} />
            </li>
          ))}
        </ul>
      ) : null}

      <Section
        title="De rezolvat"
        description="Quiz-uri date claselor tale, pe care nu le-ai încercat încă"
        bodyClassName="p-3"
      >
        {todo.length > 0 ? (
          <ul className="stagger grid gap-2">
            {todo.map((q) => (
              <li key={q.id}>
                <AssignedQuizRow quiz={q} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="Nimic de rezolvat"
            description="Când mentorul dă un quiz clasei tale, îl vei vedea aici."
            className="border-0"
          />
        )}
      </Section>

      {done.length > 0 ? (
        <Section
          title="Rezolvate"
          description="Le poți reface oricând ca să exersezi; prima refacere mai aduce 1 XP."
          bodyClassName="p-3"
        >
          <ul className="stagger grid gap-2">
            {done.map((q) => (
              <li key={q.id}>
                <AssignedQuizRow quiz={q} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {practice.length > 0 ? (
        <Section
          title="Exersare: noțiuni de bază de Python"
          description={`${practiceDone} din ${practice.length} rezolvate. Prima rezolvare aduce XP după scor, o repetare încă 1 XP, apoi doar exersare.`}
          bodyClassName="p-3"
        >
          <ul className="stagger grid gap-2 md:grid-cols-2">
            {practice.map((q, i) => (
              <li key={q.id}>
                <PracticeQuizRow quiz={q} index={i + 1} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Link
        href="/invatare"
        className="group flex cut items-center gap-4 bg-card p-5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
      >
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 hex place-items-center bg-info-soft text-info"
        >
          <BookOpen className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold font-heading text-lg uppercase tracking-wide">
            Exersează cu quiz-urile din Învățare
          </span>
          <span className="block text-muted-foreground text-sm">
            Câte un quiz de recapitulare pentru fiecare lecție din „Introducere
            în Python”.
          </span>
        </span>
        <ArrowRight
          className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

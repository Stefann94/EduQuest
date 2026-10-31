import { Plus, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveQuizRow } from "@/components/mentor-content/live-quiz-row";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz-uri live" };

export default function LiveQuizzesPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const [quizzes, sessions, classes] = await Promise.all([
    getMentorQuizzes(me.id),
    getLiveSessions(),
    getMentorClasses(me.id),
  ]);
  // Cele arhivate sunt în „Arhivate”.
  const live = quizzes.filter((q) => q.live && !q.archived);
  const classOptions = classes.active.map((c) => ({ id: c.id, name: c.name }));

  if (live.length === 0)
    return (
      <EmptyState
        icon={Radio}
        title="Niciun quiz live activ"
        description="Un quiz live se joacă împreună, în timpul orei: fiecare întrebare are timpul ei, iar elevii intră cu un cod. Quiz-urile arhivate sunt în „Arhivate”."
        action={
          <Link
            href="/mentor/quiz/nou?mod=live"
            className={buttonVariants({ variant: "cta" })}
          >
            <Plus aria-hidden="true" /> Quiz live nou
          </Link>
        }
      />
    );

  return (
    <ul className="stagger grid gap-2">
      {live.map((q) => (
        <LiveQuizRow
          key={q.id}
          quiz={q}
          sessions={sessions.filter((s) => s.quizId === q.id)}
          classes={classOptions}
        />
      ))}
    </ul>
  );
}

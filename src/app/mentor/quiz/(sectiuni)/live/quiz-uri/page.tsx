import { Pencil, Plus, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveQuizStart } from "@/components/mentor-content/live-quiz-start";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";
import { formatDate, plural } from "@/lib/format";

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
  const live = quizzes.filter((q) => q.live);
  const classOptions = classes.active.map((c) => ({ id: c.id, name: c.name }));

  if (live.length === 0)
    return (
      <EmptyState
        icon={Radio}
        title="Niciun quiz live încă"
        description="Un quiz live se joacă împreună, în timpul orei: fiecare întrebare are timpul ei, iar elevii intră cu un cod."
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
      {live.map((q) => {
        const played = sessions.filter((s) => s.quizId === q.id);
        const last = played[0];
        return (
          <li
            key={q.id}
            className="flex cut-sm flex-wrap items-center gap-x-4 gap-y-3 bg-card px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 cut-xs place-items-center bg-quiz-red text-white"
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
                {played.length
                  ? `${plural(played.length, "sesiune", "sesiuni")}, ultima pe ${formatDate(last.createdAt)}`
                  : "nejucat încă"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/mentor/quiz/${q.id}`}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <Pencil aria-hidden="true" /> Editează
              </Link>
              <LiveQuizStart
                quizId={q.id}
                questionCount={q.questionCount}
                classes={classOptions}
                size="sm"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

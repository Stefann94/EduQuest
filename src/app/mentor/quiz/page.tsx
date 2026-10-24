import { ChevronRight, ListChecks, Plus, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { XpBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveSessionList } from "@/components/mentor-content/live-session-list";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Quiz-uri" };

export default function MentorQuizzesPage() {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Quiz-uri"
        description="Sesiunile live din timpul întâlnirilor și quiz-urile date claselor, pe una sau mai multe lecții."
        actions={
          <>
            <Link
              href="/mentor/quiz/nou"
              className={buttonVariants({ variant: "outline" })}
            >
              <Plus aria-hidden="true" /> Quiz nou
            </Link>
            <Link
              href="/mentor/live"
              className={buttonVariants({ variant: "cta" })}
            >
              <Radio aria-hidden="true" /> Pornește un quiz live
            </Link>
          </>
        }
      />
      <Suspense fallback={<SectionSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const [quizzes, sessions] = await Promise.all([
    getMentorQuizzes(me.id),
    getLiveSessions(),
  ]);
  // Sesiunile din clasele mentorului (RLS le arată doar pe ale lui).
  const mine = sessions;

  return (
    <Tabs defaultValue="live">
      <TabsList>
        <TabsTrigger value="live">Sesiuni live ({mine.length})</TabsTrigger>
        <TabsTrigger value="quizzes">
          Quiz-uri date claselor ({quizzes.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-4">
        <LiveSessionList sessions={mine} showClass />
      </TabsContent>

      <TabsContent value="quizzes" className="mt-4">
        {quizzes.length > 0 ? (
          <ul className="stagger grid gap-2">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link
                  href={`/mentor/quiz/${q.id}`}
                  className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-2 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 cut-xs place-items-center bg-primary-soft text-primary"
                  >
                    <ListChecks className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="truncate font-bold font-heading text-lg uppercase tracking-wide">
                      {q.title}
                    </p>
                    <p className="truncate text-muted-foreground text-sm">
                      {q.kind === "recap" ? "Recapitulare" : "Lecție"}
                      {q.lessons.length
                        ? `: ${q.lessons.map((l) => l.title).join(", ")}`
                        : ""}{" "}
                      · {plural(q.questionCount, "întrebare", "întrebări")} ·{" "}
                      {q.classes.length
                        ? q.classes.map((c) => c.name).join(", ")
                        : "nedat niciunei clase"}
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
        ) : (
          <EmptyState
            icon={ListChecks}
            title="Niciun quiz încă"
            description="Creează un quiz pe una sau mai multe lecții. Îl dai claselor sau îl folosești într-o sesiune live."
            action={
              <Link href="/mentor/quiz/nou" className={buttonVariants()}>
                <Plus /> Quiz nou
              </Link>
            }
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

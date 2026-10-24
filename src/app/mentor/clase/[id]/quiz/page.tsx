import { BarChart3, ChevronRight, ListChecks, Plus, Radio } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { XpBadge } from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveSessionList } from "@/components/mentor-content/live-session-list";
import { MasteryTable } from "@/components/mentor-content/mastery-table";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { placeholderParams } from "@/lib/db/core";
import {
  getClassMastery,
  getLiveSessions,
  getMentorQuizzes,
} from "@/lib/db/quizzes";
import { plural } from "@/lib/format";
import { loadMentorClass } from "../load-class";

export const metadata: Metadata = { title: "Quiz-urile clasei" };

type Props = PageProps<"/mentor/clase/[id]/quiz">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassQuizzesPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Quizzes params={params} />
    </Suspense>
  );
}

async function Quizzes({ params }: { params: Props["params"] }) {
  const { me, classRoom: c } = await loadMentorClass(params);
  const [allQuizzes, allSessions, mastery] = await Promise.all([
    getMentorQuizzes(me.id),
    getLiveSessions(),
    getClassMastery(c.id),
  ]);
  const quizzes = allQuizzes.filter((q) =>
    q.classes.some((x) => x.id === c.id),
  );
  const sessions = allSessions.filter((s) => s.classId === c.id);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl">Quiz-uri</h2>
          <p className="text-muted-foreground text-sm">
            Sesiunile live, quiz-urile date clasei și ce au înțeles elevii din
            fiecare lecție.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/mentor/quiz/nou"
            className={buttonVariants({ variant: "outline" })}
          >
            <Plus aria-hidden="true" /> Quiz nou
          </Link>
          <Link
            href={`/mentor/live?clasa=${c.id}`}
            className={buttonVariants({ variant: "cta" })}
          >
            <Radio aria-hidden="true" /> Pornește un quiz live
          </Link>
        </div>
      </div>

      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">
            Sesiuni live ({sessions.length})
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            Quiz-uri date clasei ({quizzes.length})
          </TabsTrigger>
          <TabsTrigger value="mastery">Înțelegere pe lecții</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <LiveSessionList sessions={sessions} />
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
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate font-medium">{q.title}</p>
                      <p className="truncate text-muted-foreground text-sm">
                        {q.kind === "recap" ? "Recapitulare" : "Lecție"}
                        {q.lessons.length
                          ? `: ${q.lessons.map((l) => l.title).join(", ")}`
                          : ""}{" "}
                        · {plural(q.questionCount, "întrebare", "întrebări")}
                      </p>
                    </div>
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
              title="Niciun quiz dat clasei"
              description="Creează un quiz pe una sau mai multe lecții și dă-l clasei. Elevii îl găsesc în Quiz-uri."
            />
          )}
        </TabsContent>

        <TabsContent value="mastery" className="mt-4">
          {mastery.students.length > 0 ? (
            <div className="grid cut gap-3 bg-card p-4">
              <p className="text-muted-foreground text-sm">
                Din ultima încercare a fiecărui elev la quiz-urile date clasei.
                Întrebările sunt etichetate pe lecții, așa că vezi exact ce
                trebuie reluat.
              </p>
              <MasteryTable
                lessons={mastery.lessons}
                students={mastery.students}
              />
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              title="Încă nu există răspunsuri"
              description="După ce elevii rezolvă quiz-urile date clasei, aici vezi cât au înțeles din fiecare lecție."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

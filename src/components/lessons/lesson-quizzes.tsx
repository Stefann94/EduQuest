import { ChevronRight, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { AssignedQuizRow } from "@/components/student-class/quiz-rows";
import { buttonVariants } from "@/components/ui/button";
import type { MentorQuiz, StudentQuiz } from "@/lib/db/quizzes";
import { plural } from "@/lib/format";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-2xl">
        <ListChecks className="size-5 text-primary" aria-hidden="true" />
        Quiz-uri pe această lecție
      </h2>
      {children}
    </div>
  );
}

/** Elevul: quiz-urile date clasei care verifică lecția deschisă. */
export function StudentLessonQuizzes({ quizzes }: { quizzes: StudentQuiz[] }) {
  if (quizzes.length === 0) return null;
  return (
    <section className="grid gap-3">
      <Heading>{null}</Heading>
      <ul className="stagger grid gap-2">
        {quizzes.map((q) => (
          <li key={q.id}>
            <AssignedQuizRow quiz={q} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Mentorul: quiz-urile legate de lecție și unul nou, direct pe ea și pe clasa ei. */
export function MentorLessonQuizzes({
  quizzes,
  classId,
  lessonId,
}: {
  quizzes: MentorQuiz[];
  classId: string;
  lessonId: string;
}) {
  return (
    <section className="grid gap-3">
      <Heading>
        <Link
          href={`/mentor/quiz/nou?mod=clase&clasa=${classId}&lectie=${lessonId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Plus aria-hidden="true" /> Quiz nou pe lecția asta
        </Link>
      </Heading>
      {quizzes.length > 0 ? (
        <ul className="stagger grid gap-2">
          {quizzes.map((q) => {
            const inClass = q.classes.some((c) => c.id === classId);
            return (
              <li key={q.id}>
                <Link
                  href={`/mentor/quiz/${q.id}`}
                  className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-1 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                >
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium">{q.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {q.required ? "Obligatoriu" : "Opțional"} ·{" "}
                      {plural(q.questionCount, "întrebare", "întrebări")} ·{" "}
                      {inClass ? "dat acestei clase" : "nedat acestei clase"}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="cut-sm border border-dashed px-4 py-4 text-muted-foreground text-sm">
          Niciun quiz pe lecția asta încă. Creează unul: elevii clasei îl văd
          aici, în lecție, și în Quiz-uri.
        </p>
      )}
    </section>
  );
}

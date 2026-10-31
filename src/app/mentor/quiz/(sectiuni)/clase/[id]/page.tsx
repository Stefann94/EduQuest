import { BarChart3, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { ClassQuizList } from "@/components/mentor-content/class-quiz-list";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { placeholderParams } from "@/lib/db/core";
import { getMentorQuizzes } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz-urile clasei" };

type Props = PageProps<"/mentor/quiz/clase/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassQuizzesForClassPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await requireUser("mentor");
  const [classes, quizzes] = await Promise.all([
    getMentorClasses(me.id),
    getMentorQuizzes(me.id),
  ]);
  const c = [...classes.active, ...classes.archived].find((x) => x.id === id);
  if (!c) notFound();
  const given = quizzes.filter(
    (q) => !q.live && q.classes.some((x) => x.id === c.id),
  );

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">
          Quiz-urile date clasei {c.name}. Elevii le găsesc în Quiz-uri.
        </p>
        <Link
          href={`/mentor/clase/${c.id}/quiz`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <BarChart3 aria-hidden="true" /> Înțelegere pe lecții
        </Link>
      </div>
      <ClassQuizList
        quizzes={given}
        empty={{
          title: "Niciun quiz dat clasei",
          description:
            "Creează un quiz pe una sau mai multe lecții și dă-l clasei. Elevii primesc o notificare.",
          action: (
            <Link
              href={`/mentor/quiz/nou?mod=clase&clasa=${c.id}`}
              className={buttonVariants()}
            >
              <Plus aria-hidden="true" /> Quiz nou pentru {c.name}
            </Link>
          ),
        }}
      />
    </div>
  );
}

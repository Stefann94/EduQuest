import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { ClassQuizList } from "@/components/mentor-content/class-quiz-list";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorQuizzes } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz-uri pentru clase" };

export default function ClassQuizzesPage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const quizzes = (await getMentorQuizzes(me.id)).filter((q) => !q.live);
  return (
    <ClassQuizList
      quizzes={quizzes}
      showClasses
      empty={{
        title: "Niciun quiz pentru clase",
        description:
          "Creează un quiz pe una sau mai multe lecții și dă-l claselor. Elevii îl rezolvă când vor și primesc XP.",
        action: (
          <Link href="/mentor/quiz/nou?mod=clase" className={buttonVariants()}>
            <Plus aria-hidden="true" /> Quiz nou
          </Link>
        ),
      }}
    />
  );
}

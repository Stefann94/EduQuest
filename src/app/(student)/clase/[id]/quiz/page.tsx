import { History, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import {
  AssignedQuizRow,
  OpenSessionCard,
  PastSessionRow,
} from "@/components/student-class/quiz-rows";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { getLiveSessions, getStudentQuizzes } from "@/lib/db/quizzes";
import { loadStudentClass } from "../load-class";

type Props = PageProps<"/clase/[id]/quiz">;

export const metadata: Metadata = { title: "Quiz-urile clasei" };

export default function ClassQuizzesPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { viewer, classRoom: c } = await loadStudentClass(params);
  const [quizzes, sessions] = await Promise.all([
    getStudentQuizzes(viewer.id),
    getLiveSessions(),
  ]);
  // Cele arhivate de mentor rămân doar dacă elevul le-a rezolvat (cu rezultatul lui).
  const assigned = quizzes.filter(
    (q) => q.classIds.includes(c.id) && (!q.archived || q.attempts.count > 0),
  );
  const mine = sessions.filter((s) => s.classId === c.id);
  const open = mine.filter((s) => s.status !== "ended");
  const past = mine.filter((s) => s.status === "ended");

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
        title="Quiz-uri date de mentor"
        description="Prima rezolvare aduce XP după scor; o refacere mai aduce 1 XP."
        bodyClassName="p-3"
      >
        {assigned.length > 0 ? (
          <ul className="stagger grid gap-2">
            {assigned.map((q) => (
              <li key={q.id}>
                <AssignedQuizRow quiz={q} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="Niciun quiz dat în această clasă"
            description="Între timp, poți exersa cu quiz-urile din Învățare."
            className="border-0"
          />
        )}
      </Section>

      <Section title="Quiz-uri live încheiate" bodyClassName="p-3">
        {past.length > 0 ? (
          <ul className="stagger grid gap-2">
            {past.map((s) => (
              <li key={s.id}>
                <PastSessionRow session={s} studentId={viewer.id} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={History}
            title="Niciun quiz live încă"
            description="Mentorul pornește quiz-urile live în timpul întâlnirilor. După fiecare, aici vezi locul și XP-ul tău."
            className="border-0"
          />
        )}
      </Section>
    </div>
  );
}

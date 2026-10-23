import { History, ListChecks, Radio } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import {
  AssignedQuizRow,
  PastSessionRow,
  UpcomingSessionCard,
} from "@/components/student-class/quiz-rows";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { getClassQuizzesForStudent } from "@/lib/data/student-class-queries";
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
  const { assigned, upcoming, past } = await getClassQuizzesForStudent(
    viewer,
    c.id,
  );

  return (
    <div className="grid gap-6">
      <Section
        title="Quiz-uri date de mentor"
        description="Le poți rezolva până la termen, în limita încercărilor."
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
            description="Între timp, poți exersa cu quiz-urile din secțiunea Quiz-uri."
            className="border-0"
          />
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Quiz-uri live programate" bodyClassName="p-3">
          {upcoming.length > 0 ? (
            <ul className="stagger grid gap-2">
              {upcoming.map((s) => (
                <li key={s.id}>
                  <UpcomingSessionCard session={s} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Radio}
              title="Niciun quiz live programat"
              description="Mentorul pornește quiz-urile live în timpul întâlnirilor. Vei primi o notificare."
              className="border-0"
            />
          )}
        </Section>

        <Section title="Quiz-uri live încheiate" bodyClassName="p-3">
          {past.length > 0 ? (
            <ul className="stagger grid gap-2">
              {past.map((s) => (
                <li key={s.id}>
                  <PastSessionRow session={s} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={History}
              title="Niciun quiz live încă"
              description="După fiecare sesiune, aici vei vedea locul tău și XP-ul primit."
              className="border-0"
            />
          )}
        </Section>
      </div>
    </div>
  );
}

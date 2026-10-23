import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { quizDraft } from "@/components/mentor-content/drafts";
import { QuizForm } from "@/components/mentor-content/quiz-form";
import { getMentorClasses, getViewer } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Quiz nou" };

export default async function NewQuizPage() {
  const me = await getViewer("mentor");
  const { active } = await getMentorClasses(me.id);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Quiz nou"
        description="Un quiz de exersare pentru toți elevii sau un quiz dat unei clase, cu termen și XP. Îl poți folosi și într-o sesiune live."
        back={{ href: "/mentor/quiz", label: "Quiz-uri" }}
      />
      <QuizForm
        draft={quizDraft()}
        classes={active.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}

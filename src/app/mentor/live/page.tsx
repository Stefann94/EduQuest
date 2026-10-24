import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveSessionList } from "@/components/mentor-content/live-session-list";
import { LiveStartForm } from "@/components/mentor-content/live-start-form";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Sesiuni live" };

export default function MentorLivePage({
  searchParams,
}: PageProps<"/mentor/live">) {
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Sesiuni live"
        description="Quiz-uri jucate împreună, în timpul orei. Tu controlezi întrebările; elevii răspund de pe dispozitivele lor, iar primii primesc mai mult XP."
      />
      <Suspense fallback={<SectionSkeleton rows={4} />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({
  searchParams,
}: {
  searchParams: PageProps<"/mentor/live">["searchParams"];
}) {
  const { clasa } = await searchParams;
  const me = await requireUser("mentor");
  const [sessions, classes, quizzes] = await Promise.all([
    getLiveSessions(),
    getMentorClasses(me.id),
    getMentorQuizzes(me.id),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <Section title="Sesiunile tale" card={false}>
        <LiveSessionList sessions={sessions} showClass />
      </Section>
      <Section title="Pornește un quiz live" className="lg:sticky lg:top-20">
        <LiveStartForm
          classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
          quizzes={quizzes.map((q) => ({
            id: q.id,
            title: q.title,
            questions: q.questionCount,
            classIds: q.classes.map((c) => c.id),
          }))}
          defaultClassId={typeof clasa === "string" ? clasa : undefined}
        />
      </Section>
    </div>
  );
}

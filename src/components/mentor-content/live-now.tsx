import { Section } from "@/components/common/section";
import { getMentorClasses } from "@/lib/db/classes";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";
import { LiveSessionList } from "./live-session-list";
import { LiveStartForm } from "./live-start-form";

/** „Live acum”: sesiunile deschise sau în joc și formularul pentru o sesiune nouă. */
export async function LiveNow({
  mentorId,
  defaultClassId,
}: {
  mentorId: string;
  defaultClassId?: string;
}) {
  const [sessions, classes, quizzes] = await Promise.all([
    getLiveSessions(),
    getMentorClasses(mentorId),
    getMentorQuizzes(mentorId),
  ]);
  const open = sessions.filter((s) => s.status !== "ended");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <Section
        title="Sesiuni deschise"
        description="Dă-le elevilor codul; ei intră din pagina Live."
        card={false}
      >
        <LiveSessionList
          sessions={open}
          showClass
          empty={{
            title: "Nicio sesiune deschisă",
            description:
              "Deschide o sesiune dintr-un quiz live: primești un cod de 6 cifre, iar jocul începe când apeși „Începe”.",
          }}
        />
      </Section>
      <Section title="Deschide o sesiune" className="lg:sticky lg:top-20">
        <LiveStartForm
          classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
          quizzes={quizzes
            .filter((q) => q.live)
            .map((q) => ({
              id: q.id,
              title: q.title,
              questions: q.questionCount,
            }))}
          defaultClassId={defaultClassId}
        />
      </Section>
    </div>
  );
}

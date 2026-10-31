import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { LiveQuizRow } from "@/components/mentor-content/live-quiz-row";
import { LiveSessionList } from "@/components/mentor-content/live-session-list";
import { requireUser } from "@/lib/auth";
import { getLiveSessions, getMentorQuizzes } from "@/lib/db/quizzes";

export const metadata: Metadata = { title: "Quiz-uri live arhivate" };

export default function ArchivedLivePage() {
  return (
    <Suspense fallback={<SectionSkeleton rows={5} />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const me = await requireUser("mentor");
  const [quizzes, sessions] = await Promise.all([
    getMentorQuizzes(me.id),
    // Sesiunile din clasele mentorului (RLS le arată doar pe ale lui), cele mai noi primele.
    getLiveSessions(),
  ]);
  const archived = quizzes.filter((q) => q.live && q.archived);
  const ended = sessions.filter((s) => s.status === "ended");
  return (
    <div className="grid gap-8">
      {archived.length > 0 ? (
        <section aria-labelledby="quiz-live-arhivate" className="grid gap-3">
          <div>
            <h2
              id="quiz-live-arhivate"
              className="font-bold font-heading text-lg uppercase tracking-wide"
            >
              Quiz-uri arhivate ({archived.length})
            </h2>
            <p className="text-muted-foreground text-sm">
              Nu se mai pot juca. Scoate unul din arhivă ca să deschizi din nou
              sesiuni cu el.
            </p>
          </div>
          <ul className="stagger grid gap-2">
            {archived.map((q) => (
              <LiveQuizRow
                key={q.id}
                quiz={q}
                sessions={sessions.filter((s) => s.quizId === q.id)}
                classes={[]}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="sesiuni-incheiate" className="grid gap-3">
        <div>
          <h2
            id="sesiuni-incheiate"
            className="font-bold font-heading text-lg uppercase tracking-wide"
          >
            Sesiuni încheiate
          </h2>
          <p className="text-muted-foreground text-sm">
            Cu data, clasa și câți au jucat. Deschide una ca să vezi clasamentul
            final.
          </p>
        </div>
        <LiveSessionList
          sessions={ended}
          showClass
          empty={{
            title: "Nicio sesiune încheiată",
            description:
              "După ce închei o sesiune live, o găsești aici, cu clasamentul final.",
          }}
        />
      </section>
    </div>
  );
}

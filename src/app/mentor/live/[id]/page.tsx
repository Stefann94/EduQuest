import { CalendarClock, CheckCircle2, Radio, Users } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CodeBlock } from "@/components/common/code-block";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { StatusBadge } from "@/components/common/status";
import {
  LiveControl,
  type LiveQuestion,
} from "@/components/mentor-content/live-control";
import {
  formatPoints,
  LiveResults,
} from "@/components/mentor-content/live-results";
import { DetailSkeleton } from "@/components/mentor-content/skeletons";
import {
  codeLanguageForClass,
  getLiveSessionForMentor,
  liveSessionParams,
} from "@/lib/data/mentor-content-queries";
import { getViewer } from "@/lib/data/queries";
import { formatDateTime, plural } from "@/lib/format";

type Props = PageProps<"/mentor/live/[id]">;

export const metadata: Metadata = { title: "Sesiune live" };

export function generateStaticParams() {
  return liveSessionParams();
}

export default function LiveSessionPage({ params }: Props) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const data = await getLiveSessionForMentor(me.id, id);
  if (!data) notFound();
  const { session, quiz, className, students, results } = data;
  const ended = session.status === "ended";

  const header = (
    <PageHeader
      title={session.title}
      description={`${className} · quiz „${quiz.title}” · ${plural(quiz.questions.length, "întrebare", "întrebări")}`}
      back={{ href: "/mentor/live", label: "Sesiuni live" }}
      meta={
        <>
          {ended ? (
            <StatusBadge icon={CheckCircle2} tone="success">
              Încheiată
            </StatusBadge>
          ) : (
            <StatusBadge icon={Radio} tone="primary">
              Programată
            </StatusBadge>
          )}
          <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
            <CalendarClock className="size-4" aria-hidden="true" />
            {formatDateTime(session.startsAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
            <Users className="size-4" aria-hidden="true" />
            {plural(students.length, "elev", "elevi")} în clasă
          </span>
        </>
      }
    />
  );

  if (ended) {
    const totalXp = results.reduce((s, r) => s + r.xp, 0);
    const best = results[0];
    return (
      <div className="grid gap-6">
        {header}
        <ul className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat
            label="Participanți"
            value={`${results.length} din ${students.length}`}
          />
          <Stat label="XP acordat în total" value={`${totalXp} XP`} />
          <Stat
            label="Cel mai bun punctaj"
            value={
              best
                ? `${formatPoints(best.score)} · ${best.student.displayName.split(" ")[0]}`
                : "—"
            }
          />
        </ul>
        <Section
          title="Clasament final"
          description="Rezultatele salvate la încheierea sesiunii."
        >
          <LiveResults
            rows={results.map((r) => ({
              studentId: r.studentId,
              name: r.student.displayName,
              avatar: r.student.avatar,
              score: r.score,
              rank: r.rank,
              xp: r.xp,
            }))}
          />
        </Section>
      </div>
    );
  }

  const language = codeLanguageForClass(session.classId);
  const questions: LiveQuestion[] = quiz.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation,
    code: q.code ? <CodeBlock code={q.code} language={language} /> : undefined,
  }));
  // În sesiunile live, limita de timp se aplică fiecărei întrebări.
  const seconds =
    quiz.timeLimitSec && quiz.timeLimitSec <= 120 ? quiz.timeLimitSec : 30;

  return (
    <div className="grid gap-6">
      {header}
      <LiveControl
        sessionId={session.id}
        code={session.code}
        quizTitle={quiz.title}
        questions={questions}
        secondsPerQuestion={seconds}
        students={students.map((s) => ({
          id: s.id,
          name: s.displayName,
          avatar: s.avatar,
        }))}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-xl border bg-card p-4 shadow-xs">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 font-semibold text-xl tabular-nums">{value}</p>
    </li>
  );
}

import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock,
  ListChecks,
  Plus,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import {
  DifficultyBadge,
  StatusBadge,
  XpBadge,
} from "@/components/common/status";
import { SectionSkeleton } from "@/components/mentor-classes/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  demoIds,
  getClass,
  getLiveSessions,
  getMentorQuizzes,
  getViewer,
} from "@/lib/data/queries";
import type { LiveSessionStatus } from "@/lib/data/types";
import { formatDateTime, formatDay, isPast, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Quiz-urile clasei" };

type Props = PageProps<"/mentor/clase/[id]/quiz">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassQuizzesPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton />}>
      <Quizzes params={params} />
    </Suspense>
  );
}

const SESSION_STATUS: Record<
  LiveSessionStatus,
  { label: string; icon: typeof Clock; tone: "info" | "primary" | "success" }
> = {
  scheduled: { label: "Programată", icon: CalendarClock, tone: "info" },
  lobby: { label: "Sala de așteptare", icon: Clock, tone: "primary" },
  running: { label: "În desfășurare", icon: CircleDot, tone: "primary" },
  ended: { label: "Încheiată", icon: CheckCircle2, tone: "success" },
};

const rowClass =
  "group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40";

async function Quizzes({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();
  const [allQuizzes, allSessions] = await Promise.all([
    getMentorQuizzes(me.id),
    getLiveSessions(me),
  ]);
  const quizzes = allQuizzes.filter((q) => q.classId === c.id);
  const sessions = allSessions.filter((s) => s.classId === c.id);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Quiz-uri</h2>
          <p className="text-muted-foreground text-sm">
            Quiz-urile date clasei și sesiunile live.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/mentor/quiz/nou"
            className={buttonVariants({ variant: "outline" })}
          >
            <Plus aria-hidden="true" /> Quiz nou
          </Link>
          <Link href="/mentor/live" className={buttonVariants()}>
            <Radio aria-hidden="true" /> Pornește un quiz live
          </Link>
        </div>
      </div>

      <Section title="Quiz-uri date clasei" bodyClassName="p-2">
        {quizzes.length > 0 ? (
          <ul className="stagger">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Link href={`/mentor/quiz/${q.id}`} className={rowClass}>
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
                  >
                    <ListChecks className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate font-medium group-hover:text-primary">
                      {q.title}
                    </p>
                    <p className="truncate text-muted-foreground text-sm">
                      {plural(q.questions.length, "întrebare", "întrebări")}
                      {q.assignment
                        ? ` · ${isPast(q.assignment.deadline) ? "încheiat" : "deschis până"} ${formatDay(q.assignment.deadline)}`
                        : " · folosit în sesiuni live"}
                    </p>
                  </div>
                  <DifficultyBadge level={q.difficulty} />
                  {q.assignment ? <XpBadge amount={q.assignment.xp} /> : null}
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={ListChecks}
            title="Niciun quiz dat clasei"
            description="Creează un quiz cu termen sau folosește unul într-o sesiune live."
            className="m-3"
          />
        )}
      </Section>

      <Section
        title="Sesiuni live"
        bodyClassName="p-2"
        actions={
          <Link
            href="/mentor/live"
            className="font-medium text-primary text-sm hover:underline"
          >
            Controlul sesiunilor
          </Link>
        }
      >
        {sessions.length > 0 ? (
          <ul className="stagger">
            {sessions.map((s) => {
              const st = SESSION_STATUS[s.status];
              return (
                <li key={s.id}>
                  <Link href="/mentor/live" className={rowClass}>
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"
                    >
                      <Radio className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="truncate font-medium group-hover:text-primary">
                        {s.title}
                      </p>
                      <p className="truncate text-muted-foreground text-sm">
                        {formatDateTime(s.startsAt)}
                        {s.status === "ended"
                          ? ` · ${plural(s.results?.length ?? 0, "participant", "participanți")}`
                          : ` · cod ${s.code}`}
                      </p>
                    </div>
                    <StatusBadge icon={st.icon} tone={st.tone}>
                      {st.label}
                    </StatusBadge>
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
          <EmptyState
            icon={Radio}
            title="Nicio sesiune live"
            description="Pornește un quiz live în timpul întâlnirii: elevii intră cu un cod, iar primii primesc XP în plus."
            className="m-3"
          />
        )}
      </Section>
    </div>
  );
}

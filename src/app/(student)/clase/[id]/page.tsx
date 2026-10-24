import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleCheckBig,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { HomeworkRow } from "@/components/homework/homework-row";
import { LessonNumber, LessonTitle } from "@/components/lessons/lesson-card";
import { OpenSessionCard } from "@/components/student-class/quiz-rows";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import { getClassAttendanceForStudent } from "@/lib/db/attendance";
import { getStudentHomework } from "@/lib/db/homework";
import { getClassLessons } from "@/lib/db/lessons";
import { getLiveSessions } from "@/lib/db/quizzes";
import { getClassStanding } from "@/lib/db/xp";
import { formatDay, formatWeekday, relativeDays } from "@/lib/format";
import { getNextMeeting } from "@/lib/meetings";
import { loadStudentClass } from "./load-class";

type Props = PageProps<"/clase/[id]">;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const metadata: Metadata = { title: "Prezentare clasă" };

export default function ClassOverviewPage({ params }: Props) {
  return (
    <Suspense fallback={<SectionSkeleton rows={4} />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Props["params"] }) {
  const { viewer, classRoom: c } = await loadStudentClass(params);
  const [homework, lessons, standing, sessions, attendance] = await Promise.all(
    [
      getStudentHomework(viewer.id),
      getClassLessons(c.id),
      getClassStanding(c.id, viewer.id),
      getLiveSessions(),
      getClassAttendanceForStudent(viewer.id, c.id),
    ],
  );

  const archived = c.status === "archived";
  const todo = archived
    ? []
    : homework.filter(
        (h) =>
          h.classId === c.id &&
          ((!h.complete && !h.overdue) ||
            h.problems.some((p) => p.state === "needs_changes")),
      );
  const latest = [...lessons].reverse().slice(0, 3);
  const next = getNextMeeting(c);
  const lastMeeting = attendance.meetings[0];
  const live = sessions.find((s) => s.classId === c.id && s.status !== "ended");
  const base = `/clase/${c.id}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="grid content-start gap-6 lg:col-span-2">
        <Section
          title="De făcut în această clasă"
          description="Teme cu probleme netrimise sau de refăcut"
          actions={
            <Link
              href={`${base}/teme`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate temele <ArrowRight />
            </Link>
          }
          bodyClassName="p-3"
        >
          {todo.length > 0 ? (
            <ul className="stagger grid gap-2">
              {todo.map((h) => (
                <li key={h.id}>
                  <HomeworkRow homework={h} showClass={false} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CircleCheckBig}
              title={archived ? "Clasa s-a încheiat" : "Ești la zi"}
              description={
                archived
                  ? "Temele nu mai pot fi trimise, dar le poți reciti oricând."
                  : "Nicio temă nu așteaptă după tine în această clasă."
              }
              className="border-0"
            />
          )}
        </Section>

        <Section
          title="Ultimele lecții"
          actions={
            <Link
              href={`${base}/lectii`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate lecțiile <ArrowRight />
            </Link>
          }
          bodyClassName="p-2"
        >
          {latest.length > 0 ? (
            <ul className="stagger grid gap-1">
              {latest.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`${base}/lectii/${l.id}`}
                    className="group flex items-center gap-4 px-3 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                  >
                    <LessonNumber lesson={l} className="size-10 text-base" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        <LessonTitle lesson={l} />
                      </span>
                      <span className="block text-muted-foreground text-sm">
                        {l.items.length === 1
                          ? "1 material"
                          : `${l.items.length} materiale`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Nicio lecție încă"
              description="Când mentorul publică o lecție pentru clasă, o găsești aici."
              className="border-0"
            />
          )}
        </Section>
      </div>

      <div className="grid content-start gap-6">
        <section className="rounded-xl border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">XP-ul tău în clasă</h2>
            <Link
              href={`${base}/clasament`}
              className="font-medium text-primary text-sm hover:underline"
            >
              Clasament
            </Link>
          </div>
          <p className="mt-3 flex items-baseline gap-2">
            <Star
              className="size-6 self-center fill-xp text-xp"
              aria-hidden="true"
            />
            <span className="font-semibold text-4xl tabular-nums tracking-tight">
              {standing.xp}
            </span>
            <span className="text-muted-foreground">XP</span>
          </p>
          {standing.rank ? (
            <p className="mt-2 text-muted-foreground text-sm">
              Ești pe locul{" "}
              <span className="font-medium text-foreground">
                {standing.rank}
              </span>{" "}
              din {standing.size} în clasament.
            </p>
          ) : null}
        </section>

        <Section title={archived ? "Program" : "Următoarea întâlnire"}>
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground"
            >
              <CalendarDays className="size-[18px]" />
            </span>
            <div className="min-w-0 text-sm">
              {next ? (
                <>
                  <p className="font-medium">
                    {formatWeekday(next.iso)}
                    {next.time ? `, ${next.time}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {capitalize(relativeDays(next.iso))} · întâlnire săptămânală
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium">{c.schedule}</p>
                  <p className="text-muted-foreground">
                    {archived
                      ? "Clasa nu mai are întâlniri programate."
                      : "Programul obișnuit al clasei."}
                  </p>
                </>
              )}
              {lastMeeting ? (
                <p className="mt-2 text-muted-foreground">
                  Ultima întâlnire: {formatDay(lastMeeting.date)},{" "}
                  {lastMeeting.topic}
                </p>
              ) : null}
            </div>
          </div>
        </Section>

        {live ? (
          <Section title="Quiz live deschis" bodyClassName="p-3">
            <OpenSessionCard session={live} />
          </Section>
        ) : null}
      </div>
    </div>
  );
}

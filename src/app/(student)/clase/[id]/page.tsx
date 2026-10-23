import {
  ArrowRight,
  CalendarDays,
  CircleCheckBig,
  FolderOpen,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AssignmentRow } from "@/components/assignments/assignment-row";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { MaterialRow } from "@/components/learning/material-row";
import { UpcomingSessionCard } from "@/components/student-class/quiz-rows";
import { SectionSkeleton } from "@/components/student-class/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  getClassAssignmentsForStudent,
  getClassAttendance,
  getClassMaterials,
} from "@/lib/data/queries";
import {
  getClassQuizzesForStudent,
  getClassStanding,
  getNextMeeting,
} from "@/lib/data/student-class-queries";
import { formatDay, formatWeekday, relativeDays } from "@/lib/format";
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
  const [assignments, content, standing, quizzes, meetings] = await Promise.all(
    [
      getClassAssignmentsForStudent(c.id, viewer.id),
      getClassMaterials(c.id),
      getClassStanding(c.id, viewer.id),
      getClassQuizzesForStudent(viewer, c.id),
      getClassAttendance(c.id),
    ],
  );

  const archived = c.status === "archived";
  const todo = archived
    ? []
    : assignments.filter(
        (a) =>
          a.submissionState === "not_started" ||
          a.submissionState === "needs_changes",
      );
  const latest = [...content.materials]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  const next = getNextMeeting(c);
  const lastMeeting = meetings[0];
  const live = quizzes.upcoming[0];
  const base = `/clase/${c.id}`;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="grid content-start gap-6 lg:col-span-2">
        <Section
          title="De făcut în această clasă"
          description="Teme neîncepute sau care au nevoie de corecturi"
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
              {todo.map((a) => (
                <li key={a.id}>
                  <AssignmentRow assignment={a} showClass={false} />
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
          title="Materiale recente"
          actions={
            <Link
              href={`${base}/materiale`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate materialele <ArrowRight />
            </Link>
          }
          bodyClassName="p-2"
        >
          {latest.length > 0 ? (
            <ul className="stagger">
              {latest.map((m) => (
                <li key={m.id}>
                  <MaterialRow
                    material={m}
                    href={`/invatare/materiale/${m.id}`}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="Niciun material încă"
              description="Când mentorul publică un material pentru clasă, îl vei găsi aici."
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
          <Section title="Quiz live programat" bodyClassName="p-3">
            <UpcomingSessionCard session={live} />
          </Section>
        ) : null}
      </div>
    </div>
  );
}

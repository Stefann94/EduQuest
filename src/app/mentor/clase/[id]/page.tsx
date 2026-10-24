import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  Inbox,
  Radio,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { InviteCodeCard } from "@/components/mentor-classes/invite-code-card";
import { OverviewSkeleton } from "@/components/mentor-classes/skeletons";
import { StatCard } from "@/components/mentor-classes/stat-card";
import { SubmissionRow } from "@/components/mentor-classes/submission-row";
import { buttonVariants } from "@/components/ui/button";
import { getClassMeetings } from "@/lib/db/attendance";
import { placeholderParams } from "@/lib/db/core";
import { getReviewQueue } from "@/lib/db/homework";
import { getLiveSessions } from "@/lib/db/quizzes";
import {
  formatDay,
  formatWeekday,
  now,
  plural,
  relativeDays,
} from "@/lib/format";
import { nextMeetingFromSchedule } from "@/lib/meetings";
import { loadMentorClass } from "./load-class";

export const metadata: Metadata = { title: "Prezentarea clasei" };

type Props = PageProps<"/mentor/clase/[id]">;

export function generateStaticParams() {
  return placeholderParams("id");
}

export default function ClassOverviewPage({ params }: Props) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: { params: Props["params"] }) {
  const { me, classRoom: c } = await loadMentorClass(params);
  const [queue, meetings, sessions] = await Promise.all([
    getReviewQueue(me.id),
    getClassMeetings(c.id),
    getLiveSessions(),
  ]);
  const toReview = queue.filter((r) => r.className === c.name);
  const last = meetings[0];
  const lastPresent = last
    ? Object.values(last.records).filter((s) => s !== "absent").length
    : 0;
  const lastTotal = last ? Object.keys(last.records).length : 0;
  const openLive = sessions.find(
    (s) => s.classId === c.id && s.status !== "ended",
  );
  const nextMeeting =
    c.status === "active"
      ? nextMeetingFromSchedule(c.schedule, now())
      : undefined;
  const base = `/mentor/clase/${c.id}`;

  return (
    <div className="grid gap-6">
      {c.description ? (
        <p className="max-w-3xl text-muted-foreground">{c.description}</p>
      ) : null}

      <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <li>
          <StatCard
            icon={Users}
            label="Elevi înscriși"
            value={c.studentIds.length}
            detail="Vezi lista de membri"
            href={`${base}/membri`}
          />
        </li>
        <li>
          <StatCard
            icon={ClipboardCheck}
            tone={toReview.length > 0 ? "primary" : "neutral"}
            label="De evaluat"
            value={toReview.length}
            detail={
              toReview.length > 0
                ? plural(
                    toReview.length,
                    "problemă trimisă",
                    "probleme trimise",
                  )
                : "Ești la zi cu evaluările"
            }
            href={`${base}/teme`}
          />
        </li>
        <li>
          <StatCard
            icon={CalendarCheck}
            tone="success"
            label="Ultima întâlnire"
            value={last ? `${lastPresent} din ${lastTotal}` : "—"}
            detail={
              last
                ? `prezenți sau recuperat · ${formatDay(last.date)}, ${last.lessonTitle ?? last.topic}`
                : "Nicio prezență înregistrată"
            }
            href={`${base}/prezenta`}
          />
        </li>
        <li>
          <StatCard
            icon={Radio}
            tone="info"
            label="Quiz live"
            value={openLive ? openLive.code : "—"}
            detail={
              openLive
                ? `Deschis acum · ${openLive.title}`
                : "Pornește unul din Quiz-uri"
            }
            href={openLive ? `/mentor/live/${openLive.id}` : `${base}/quiz`}
          />
        </li>
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="De evaluat"
          description="Problemele trimise de elevii clasei, cele mai vechi primele"
          className="lg:col-span-2"
          bodyClassName="p-2"
          actions={
            <Link
              href={`${base}/teme`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate temele <ArrowRight />
            </Link>
          }
        >
          {toReview.length > 0 ? (
            <ul className="stagger">
              {toReview.slice(0, 8).map((r) => (
                <li key={r.submissionId}>
                  <SubmissionRow
                    href={`/mentor/teme/${r.homeworkId}/${r.assignmentId}/${r.student.id}`}
                    student={r.student}
                    title={r.title}
                    problemTitle={r.problemTitle}
                    at={r.at}
                    isResubmission={r.isResubmission}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Nimic de evaluat"
              description="Când elevii trimit probleme din teme, le vei vedea aici."
              className="m-3"
            />
          )}
        </Section>

        <div className="grid content-start gap-6">
          <InviteCodeCard
            classId={c.id}
            code={c.inviteCode}
            active={c.inviteCodeActive}
            archived={c.status === "archived"}
          />
          <section className="cut bg-card p-5">
            <h2 className="text-xl">Următoarea întâlnire</h2>
            {nextMeeting ? (
              <p className="mt-3 flex items-center gap-2 text-sm">
                <CalendarDays
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {formatWeekday(nextMeeting)} ({relativeDays(nextMeeting)})
              </p>
            ) : (
              <p className="mt-3 text-muted-foreground text-sm">
                {c.status === "archived"
                  ? "Clasa este arhivată."
                  : "Programul clasei nu are o zi fixă."}
              </p>
            )}
            <p className="mt-1 text-muted-foreground text-sm">{c.schedule}</p>
            {c.status === "active" ? (
              <Link
                href={`${base}/prezenta`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-4 w-full",
                })}
              >
                <CalendarCheck /> Înregistrează prezența
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

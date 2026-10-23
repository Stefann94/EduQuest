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
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { Section } from "@/components/common/section";
import { InviteCodeCard } from "@/components/mentor-classes/invite-code-card";
import { OverviewSkeleton } from "@/components/mentor-classes/skeletons";
import { StatCard } from "@/components/mentor-classes/stat-card";
import { SubmissionRow } from "@/components/mentor-classes/submission-row";
import { buttonVariants } from "@/components/ui/button";
import {
  getClassRecentSubmissions,
  nextMeetingFromSchedule,
} from "@/lib/data/mentor-class-queries";
import {
  demoIds,
  getClass,
  getClassAttendance,
  getLiveSessions,
  getReviewQueue,
  getViewer,
} from "@/lib/data/queries";
import {
  formatDateTime,
  formatDay,
  formatWeekday,
  now,
  plural,
  relativeDays,
} from "@/lib/format";

export const metadata: Metadata = { title: "Prezentarea clasei" };

type Props = PageProps<"/mentor/clase/[id]">;

export function generateStaticParams() {
  return demoIds.classes();
}

export default function ClassOverviewPage({ params }: Props) {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const me = await getViewer("mentor");
  const c = await getClass(me, id);
  if (!c) notFound();

  const [queue, meetings, sessions, recent] = await Promise.all([
    getReviewQueue(me.id),
    getClassAttendance(c.id),
    getLiveSessions(me),
    getClassRecentSubmissions(me.id, c.id, 6),
  ]);
  const toReview = queue.filter((r) => r.assignment.classId === c.id);
  const last = meetings[0];
  const lastPresent = last
    ? Object.values(last.records).filter(Boolean).length
    : 0;
  const lastTotal = last ? Object.keys(last.records).length : 0;
  const nextLive = sessions
    .filter((s) => s.classId === c.id && s.status !== "ended")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
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
            label="De revizuit"
            value={toReview.length}
            detail={
              toReview.length > 0
                ? plural(toReview.length, "trimitere nouă", "trimiteri noi")
                : "Ești la zi cu review-urile"
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
                ? `prezenți · ${formatDay(last.date)}, ${last.topic}`
                : "Nicio prezență înregistrată"
            }
            href={`${base}/prezenta`}
          />
        </li>
        <li>
          <StatCard
            icon={Radio}
            tone="info"
            label="Următorul quiz live"
            value={nextLive ? relativeDays(nextLive.startsAt) : "—"}
            detail={
              nextLive
                ? `${formatDateTime(nextLive.startsAt)} · ${nextLive.title}`
                : "Niciun quiz live programat"
            }
            href={`${base}/quiz`}
          />
        </li>
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Trimiteri recente"
          description="Cele mai noi teme trimise de elevii clasei"
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
          {recent.length > 0 ? (
            <ul className="stagger">
              {recent.map((r) => (
                <li key={r.submission.id}>
                  <SubmissionRow
                    student={r.student}
                    assignmentId={r.assignment.id}
                    assignmentTitle={r.assignment.title}
                    submissionId={r.submission.id}
                    at={r.lastAt}
                    status={r.submission.status}
                    isResubmission={r.isResubmission}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Nicio trimitere încă"
              description="Când elevii trimit teme, le vei vedea aici."
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
          <section className="rounded-xl border bg-card p-5 shadow-xs">
            <h2 className="font-semibold">Următoarea întâlnire</h2>
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

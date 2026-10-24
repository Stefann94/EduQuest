import {
  ArrowRight,
  BookPlus,
  CalendarCheck,
  CalendarDays,
  ClipboardPlus,
  Inbox,
  Radio,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClassCard } from "@/components/classes/class-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { CreateClassDialog } from "@/components/mentor-classes/create-class-dialog";
import { SubmissionRow } from "@/components/mentor-classes/submission-row";
import { NotificationIcon } from "@/components/shell/notification-icon";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMentorClasses } from "@/lib/db/classes";
import { getReviewQueue } from "@/lib/db/homework";
import { getNotifications } from "@/lib/db/notifications";
import { getLiveSessions } from "@/lib/db/quizzes";
import {
  formatDateTime,
  formatDay,
  formatTime,
  formatWeekday,
  now,
  plural,
  relativeDays,
} from "@/lib/format";
import { upcomingMeetings } from "@/lib/meetings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Panou" };

type AgendaItem = {
  key: string;
  kind: "meeting" | "live";
  at: string;
  title: string;
  className: string;
  href: string;
  extra?: string;
};

export default async function MentorDashboardPage() {
  const me = await requireUser("mentor");
  const today = now();
  const [queue, classes, sessions, notifications] = await Promise.all([
    getReviewQueue(me.id),
    getMentorClasses(me.id),
    getLiveSessions(),
    getNotifications(me.id),
  ]);
  const meetings = upcomingMeetings(classes.active, today);

  const agenda: AgendaItem[] = [
    ...meetings.map((m) => ({
      key: `m-${m.classId}`,
      kind: "meeting" as const,
      at: m.at,
      title: "Întâlnire de clasă",
      className: m.className,
      href: `/mentor/clase/${m.classId}/prezenta`,
    })),
    ...sessions
      .filter((s) => s.status !== "ended")
      .map((s) => ({
        key: `l-${s.id}`,
        kind: "live" as const,
        at: s.createdAt,
        title: `Quiz live deschis: ${s.title}`,
        className: s.className,
        href: `/mentor/live/${s.id}`,
        extra: `Cod ${s.code}`,
      })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  const firstName = me.displayName.split(" ")[0];
  const firstClass = classes.active[0]?.id;

  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Bună, ${firstName}!`}
        description={
          <>
            {formatWeekday(today.toISOString())} ·{" "}
            {queue.length > 0
              ? `Ai ${plural(queue.length, "problemă trimisă", "probleme trimise")} de evaluat.`
              : "Ești la zi cu evaluările."}
          </>
        }
      />

      <section aria-label="Acțiuni rapide" className="flex flex-wrap gap-2">
        <CreateClassDialog variant="outline" />
        <Link
          href="/mentor/materiale/nou"
          className={buttonVariants({ variant: "outline" })}
        >
          <BookPlus aria-hidden="true" /> Lecție nouă
        </Link>
        <Link
          href="/mentor/teme/nou"
          className={buttonVariants({ variant: "outline" })}
        >
          <ClipboardPlus aria-hidden="true" /> Creează temă
        </Link>
        {firstClass ? (
          <Link
            href={`/mentor/clase/${firstClass}/prezenta`}
            className={buttonVariants({ variant: "outline" })}
          >
            <CalendarCheck aria-hidden="true" /> Înregistrează prezența
          </Link>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="De evaluat"
          description="Problemele trimise care așteaptă feedback, cele mai vechi primele"
          className="content-start lg:col-span-2"
          bodyClassName="p-2"
          actions={
            <Link
              href="/mentor/teme"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Toate temele <ArrowRight />
            </Link>
          }
        >
          {queue.length > 0 ? (
            <ul className="stagger">
              {queue.map((r) => (
                <li key={r.submissionId}>
                  <SubmissionRow
                    href={`/mentor/teme/${r.homeworkId}/${r.assignmentId}/${r.student.id}`}
                    student={r.student}
                    title={r.title}
                    problemTitle={r.problemTitle}
                    className={r.className}
                    at={r.at}
                    isResubmission={r.isResubmission}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Nicio trimitere în așteptare"
              description="Când elevii trimit teme, le găsești aici, în ordinea în care au sosit."
              className="m-3"
            />
          )}
        </Section>

        <div className="grid content-start gap-6">
          <Section title="Program apropiat" bodyClassName="p-3">
            {agenda.length > 0 ? (
              <ul className="stagger grid gap-2">
                {agenda.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="flex items-start gap-3 rounded-lg border p-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full",
                          item.kind === "live"
                            ? "bg-primary-soft text-primary"
                            : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {item.kind === "live" ? (
                          <Radio className="size-4" />
                        ) : (
                          <CalendarDays className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-sm">
                          {item.title}
                        </span>
                        <span className="block truncate text-muted-foreground text-xs">
                          {item.className}
                          {item.extra ? ` · ${item.extra}` : null}
                        </span>
                        <span className="mt-1 block text-sm">
                          {formatDateTime(item.at)}{" "}
                          <span className="text-muted-foreground">
                            ({relativeDays(item.at)})
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-4 text-center text-muted-foreground text-sm">
                Nicio întâlnire în următoarele zile.
              </p>
            )}
          </Section>

          <Section
            title="Activitate recentă"
            actions={
              <Link
                href="/mentor/notificari"
                className="font-medium text-primary text-sm hover:underline"
              >
                Toate
              </Link>
            }
            bodyClassName="p-2"
          >
            {notifications.length > 0 ? (
              <ul>
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      className="flex gap-3 rounded-lg p-2.5 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
                    >
                      <NotificationIcon kind={n.kind} className="size-8" />
                      <span className="min-w-0">
                        <span
                          className={cn(
                            "block text-sm leading-snug",
                            !n.read && "font-medium",
                          )}
                        >
                          {n.title}
                          {!n.read ? (
                            <span className="sr-only"> (necitită)</span>
                          ) : null}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDay(n.at)}, {formatTime(n.at)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-4 text-center text-muted-foreground text-sm">
                Nicio activitate nouă.
              </p>
            )}
          </Section>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-base">Clasele tale</h2>
          <Link
            href="/mentor/clase"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Clasele mele <ArrowRight />
          </Link>
        </div>
        {classes.active.length > 0 ? (
          <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {classes.active.map((c) => (
              <li key={c.id}>
                <ClassCard
                  classRoom={c}
                  href={`/mentor/clase/${c.id}`}
                  viewAs="mentor"
                />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="Nu ai nicio clasă activă"
            description="Creează prima clasă și invită elevii cu un cod."
            action={<CreateClassDialog />}
          />
        )}
      </section>
    </div>
  );
}

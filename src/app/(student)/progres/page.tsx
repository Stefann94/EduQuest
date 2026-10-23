import {
  CalendarCheck,
  CalendarX,
  ChevronRight,
  ListChecks,
  Lock,
  Radio,
  Star,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import {
  StatusBadge,
  SUBMISSION_STATUS,
  XpBadge,
} from "@/components/common/status";
import { XpHistoryTable } from "@/components/student-activity/xp-history-table";
import { XP_RULES } from "@/components/student-activity/xp-source";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getLeaderboard,
  getLiveSessions,
  getStudentAssignments,
  getStudentAttendance,
  getStudentClasses,
  getStudentQuizzes,
  getViewer,
  getXpHistory,
  getXpTotal,
} from "@/lib/data/queries";
import type { SubmissionStatus } from "@/lib/data/types";
import { daysUntil, formatDay, formatShortDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Progresul meu" };

const STATES: SubmissionStatus[] = [
  "not_started",
  "submitted",
  "needs_changes",
  "reviewed",
];

export default async function ProgressPage() {
  const me = await getViewer("student");
  const [
    totalXp,
    history,
    classes,
    attendance,
    assignments,
    quizzes,
    sessions,
  ] = await Promise.all([
    getXpTotal(me.id),
    getXpHistory(me.id),
    getStudentClasses(me.id),
    getStudentAttendance(me.id),
    getStudentAssignments(me.id),
    getStudentQuizzes(me.id),
    getLiveSessions(me),
  ]);

  const allClasses = [...classes.active, ...classes.archived];
  const perClass = await Promise.all(
    allClasses.map(async (c) => {
      const board = await getLeaderboard(c.id);
      const row = board.find((r) => r.student.id === me.id);
      return {
        classRoom: c,
        xp: row?.xp ?? 0,
        rank: row?.rank,
        size: board.length,
      };
    }),
  );

  const classNames = new Map(allClasses.map((c) => [c.id, c.name]));
  const rows = history.map((t) => ({
    id: t.id,
    dateLabel: formatShortDate(t.at),
    label: t.label,
    source: t.source,
    classId: t.classId,
    className: t.classId ? classNames.get(t.classId) : undefined,
    amount: t.amount,
  }));
  const filterClasses = allClasses
    .filter((c) => history.some((t) => t.classId === c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  const counts = Object.fromEntries(
    STATES.map((s) => [
      s,
      assignments.filter((a) => a.submissionState === s).length,
    ]),
  ) as Record<SubmissionStatus, number>;
  const recent = history
    .filter((t) => daysUntil(t.at) >= -30)
    .reduce((s, t) => s + t.amount, 0);

  const practiceAttempts = [...quizzes.practice, ...quizzes.assigned]
    .flatMap((q) =>
      q.attempts.map((a) => ({ ...a, title: q.title, quizId: q.id })),
    )
    .sort((a, b) => b.at.localeCompare(a.at));
  const liveResults = sessions
    .filter((s) => s.status === "ended")
    .map((s) => ({
      ...s,
      mine: s.results?.find((r) => r.studentId === me.id),
      participants: s.results?.length ?? 0,
    }))
    .filter((s) => s.mine);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Progresul meu"
        description="O privire de ansamblu asupra activității tale. Pagina este privată: o vezi doar tu."
        meta={
          <StatusBadge icon={Lock} tone="neutral">
            Privat
          </StatusBadge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 shadow-xs">
          <h2 className="font-semibold">XP total</h2>
          <p className="mt-3 flex items-baseline gap-2">
            <Star
              className="size-6 self-center fill-xp text-xp"
              aria-hidden="true"
            />
            <span className="font-semibold text-4xl tabular-nums tracking-tight">
              {totalXp}
            </span>
            <span className="text-muted-foreground">XP</span>
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            {recent > 0
              ? `Ai strâns ${recent} XP în ultimele 30 de zile. Continuă tot așa.`
              : "Fiecare întâlnire și fiecare temă trimisă te aduc mai aproape de următorul pas."}
          </p>
          <p className="mt-4 border-t pt-4 text-muted-foreground text-xs">
            XP-ul răsplătește participarea și efortul. Nu este o notă.
          </p>
        </section>

        <Section
          title="Progres pe clase"
          description="XP-ul tău și locul în clasamentul fiecărei clase"
          className="lg:col-span-2"
          bodyClassName="p-3"
        >
          <ul className="stagger grid gap-2">
            {perClass.map((p) => (
              <li key={p.classRoom.id}>
                <Link
                  href={`/clase/${p.classRoom.id}/clasament`}
                  className="group flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-4 py-3 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/40"
                >
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block font-medium group-hover:text-primary">
                      {p.classRoom.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {p.classRoom.status === "archived"
                        ? "Clasă arhivată"
                        : p.classRoom.mentor.displayName}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Trophy
                      className={cn(
                        "size-4",
                        p.rank && p.rank <= 3
                          ? "text-xp"
                          : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {p.rank
                      ? `Locul ${p.rank} din ${p.size}`
                      : "Fără clasament"}
                  </span>
                  <span className="w-20 text-right font-semibold tabular-nums">
                    {p.xp} XP
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section
        title="Istoricul XP"
        description="Fiecare recompensă, cu sursa ei. XP-ul se acordă o singură dată pentru fiecare activitate."
      >
        <XpHistoryTable rows={rows} classes={filterClasses} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Prezența"
          description="Întâlnirile la care ai participat"
        >
          {attendance.length > 0 ? (
            <ul className="stagger grid gap-5">
              {attendance.map((a) => {
                const rate = Math.round((a.attended / a.total) * 100);
                return (
                  <li key={a.classRoom.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 truncate font-medium text-sm">
                        {a.classRoom.name}
                      </span>
                      <span className="shrink-0 text-muted-foreground text-sm tabular-nums">
                        {a.attended} din {a.total} · {rate}%
                      </span>
                    </div>
                    <Progress
                      value={rate}
                      aria-label={`Prezență ${a.classRoom.name}: ${rate}%`}
                      className="mt-2 [&_[data-slot=progress-indicator]]:bg-success [&_[data-slot=progress-track]]:h-2"
                    />
                    <details className="group mt-2">
                      <summary className="w-fit rounded text-muted-foreground text-xs outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
                        Vezi întâlnirile
                      </summary>
                      <ul className="mt-2 grid gap-1.5">
                        {a.meetings.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="min-w-0 truncate">
                              <span className="text-muted-foreground tabular-nums">
                                {formatDay(m.date)}
                              </span>{" "}
                              · {m.topic}
                            </span>
                            {m.present ? (
                              <StatusBadge icon={CalendarCheck} tone="success">
                                Prezent
                              </StatusBadge>
                            ) : (
                              <StatusBadge icon={CalendarX} tone="neutral">
                                Absent
                              </StatusBadge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              Încă nu s-a înregistrat nicio întâlnire.
            </p>
          )}
        </Section>

        <Section
          title="Activitatea la teme"
          description="Temele din clasele tale active"
        >
          <ul className="grid grid-cols-2 gap-3">
            {STATES.map((s) => {
              const st = SUBMISSION_STATUS[s];
              return (
                <li key={s} className="rounded-lg border p-3">
                  <StatusBadge icon={st.icon} tone={st.tone}>
                    {st.label}
                  </StatusBadge>
                  <p className="mt-2 font-semibold text-2xl tabular-nums">
                    {counts[s]}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-muted-foreground text-sm">
            {counts.reviewed > 0
              ? `${plural(counts.reviewed, "temă a primit", "teme au primit")} feedback de la mentor.`
              : "Feedback-ul mentorului apare aici după primul review."}{" "}
            {counts.needs_changes > 0
              ? `${plural(counts.needs_changes, "temă așteaptă", "teme așteaptă")} o variantă nouă.`
              : null}
          </p>
        </Section>
      </div>

      <Section
        title="Quiz-uri"
        description="Exersarea și sesiunile live la care ai participat"
        actions={
          <Link
            href="/quiz"
            className="font-medium text-primary text-sm hover:underline"
          >
            Toate quiz-urile
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-medium text-sm">
              <ListChecks
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Încercări individuale
            </h3>
            {practiceAttempts.length > 0 ? (
              <ul className="stagger mt-3 grid gap-2">
                {practiceAttempts.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/quiz/${a.quizId}`}
                      className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {a.title}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDay(a.at)}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {a.correct} din {a.total} corecte
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted-foreground text-sm">
                Încă nu ai rezolvat niciun quiz.
              </p>
            )}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-medium text-sm">
              <Radio
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Sesiuni live
            </h3>
            {liveResults.length > 0 ? (
              <ul className="stagger mt-3 grid gap-2">
                {liveResults.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {s.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {s.className} · {formatDay(s.startsAt)} · locul{" "}
                        {s.mine?.rank} din {s.participants}
                      </span>
                    </span>
                    <XpBadge amount={s.mine?.xp ?? 0} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Radio}
                title="Nicio sesiune live încă"
                className="mt-3"
              />
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Cum câștigi XP"
        description="Aceleași reguli în toate clasele. Exersarea individuală nu oferă XP."
      >
        <div className="max-w-xl rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Activitate</TableHead>
                <TableHead className="pr-4 text-right">XP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {XP_RULES.map((r) => (
                <TableRow key={r.activity} className="hover:bg-transparent">
                  <TableCell className="whitespace-normal pl-4">
                    {r.activity}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-semibold tabular-nums">
                    {r.xp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-muted-foreground text-sm">
          Oricine participă la un quiz live primește cel puțin +1 XP, chiar dacă
          nu răspunde corect. La punctaj egal, locul și XP-ul se împart.
        </p>
      </Section>
    </div>
  );
}

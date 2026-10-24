import {
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock,
  ListChecks,
  Lock,
  Radio,
  RotateCcw,
  Star,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import {
  AttendanceBadge,
  StatusBadge,
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
import { requireUser } from "@/lib/auth";
import { getStudentAttendance, MAX_ABSENCES } from "@/lib/db/attendance";
import { getStudentClasses } from "@/lib/db/classes";
import { getStudentHomework } from "@/lib/db/homework";
import { getLiveSessions, getStudentQuizzes } from "@/lib/db/quizzes";
import { getLeaderboard, getXpHistory } from "@/lib/db/xp";
import { daysUntil, formatDay, formatShortDate, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Progresul meu" };

const STATES = [
  { key: "missing", label: "De trimis", icon: CircleDashed, tone: "neutral" },
  { key: "waiting", label: "Așteaptă evaluarea", icon: Clock, tone: "info" },
  { key: "changes", label: "De refăcut", icon: RotateCcw, tone: "warning" },
  { key: "accepted", label: "Acceptate", icon: CheckCircle2, tone: "success" },
] as const;

export default async function ProgressPage() {
  const me = await requireUser("student");
  const [history, classes, attendanceByClass, homework, quizzes, sessions] =
    await Promise.all([
      getXpHistory(me.id),
      getStudentClasses(me.id),
      getStudentAttendance(me.id),
      getStudentHomework(me.id),
      getStudentQuizzes(me.id),
      getLiveSessions(),
    ]);
  const totalXp = history.reduce((s, t) => s + t.amount, 0);

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

  const attendance = allClasses.flatMap((c) => {
    const a = attendanceByClass.get(c.id);
    return a && a.total > 0 ? [{ classRoom: c, ...a }] : [];
  });
  const stateOf = (h: (typeof homework)[number]) =>
    h.problems.some((p) => p.state === "needs_changes")
      ? "changes"
      : !h.complete
        ? "missing"
        : h.problems.every(
              (p) => p.state === "accepted" || p.state === "not_started",
            )
          ? "accepted"
          : "waiting";
  const counts = Object.fromEntries(
    STATES.map((s) => [
      s.key,
      homework.filter((h) => stateOf(h) === s.key).length,
    ]),
  ) as Record<(typeof STATES)[number]["key"], number>;
  const recent = history
    .filter((t) => daysUntil(t.at) >= -30)
    .reduce((s, t) => s + t.amount, 0);

  const solved = quizzes.filter((q) => q.attempts.count > 0);
  const liveResults = sessions
    .filter((s) => s.status === "ended")
    .map((s) => ({
      ...s,
      mine: s.results.find((r) => r.student.id === me.id),
      participants: s.results.length,
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
        <section className="cut bg-card p-5">
          <h2 className="text-xl">XP total</h2>
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
                  className="group flex cut-sm flex-wrap items-center gap-x-4 gap-y-1 bg-muted/50 px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
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
          description={`Prezent sau recuperat. Cu mai mult de ${MAX_ABSENCES} absențe nu poți termina cursul.`}
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
                        {a.blocked ? (
                          <span className="ml-2 text-destructive">
                            · {a.absent} absențe
                          </span>
                        ) : null}
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
                            <AttendanceBadge status={m.status} />
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
          description="Temele din clasele tale"
        >
          <ul className="grid grid-cols-2 gap-3">
            {STATES.map((s) => (
              <li key={s.key} className="cut-sm bg-muted/50 p-3">
                <StatusBadge icon={s.icon} tone={s.tone}>
                  {s.label}
                </StatusBadge>
                <p className="mt-2 font-bold font-heading text-3xl tabular-nums">
                  {counts[s.key]}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-muted-foreground text-sm">
            {counts.accepted > 0
              ? `${plural(counts.accepted, "temă a fost acceptată", "teme au fost acceptate")} de mentor.`
              : "Feedbackul mentorului apare la fiecare problemă, după evaluare."}{" "}
            {counts.changes > 0
              ? `${plural(counts.changes, "temă are", "teme au")} probleme de refăcut.`
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
              Quiz-uri rezolvate
            </h3>
            {solved.length > 0 ? (
              <ul className="stagger mt-3 grid gap-2">
                {solved.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/quiz/${q.id}`}
                      className="flex cut-sm items-center justify-between gap-3 bg-muted/50 px-3 py-2.5 text-sm hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {q.title}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {plural(q.attempts.count, "încercare", "încercări")}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">
                        Cel mai bun: {q.attempts.best} din {q.attempts.total}
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
                    className="flex cut-sm items-center justify-between gap-3 bg-muted/50 px-3 py-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {s.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {s.className} · {formatDay(s.endedAt ?? s.createdAt)} ·
                        locul {s.mine?.rank} din {s.participants}
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
        description="Aceleași reguli în toate clasele. XP-ul se acordă de baza de date, o singură dată pentru fiecare activitate."
      >
        <div className="max-w-xl cut-sm bg-muted/40">
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

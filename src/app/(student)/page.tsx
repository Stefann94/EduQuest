import { ArrowRight, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { LeaderboardCard } from "@/components/student-home/leaderboard-card";
import { MissionRow } from "@/components/student-home/mission-row";
import { PlayerCard } from "@/components/student-home/player-card";
import { TeamCard } from "@/components/student-home/team-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth";
import { getStudentAttendance } from "@/lib/db/attendance";
import { getStudentClasses } from "@/lib/db/classes";
import { getStudentHomework, type StudentHomework } from "@/lib/db/homework";
import { getClassLessons, lessonLabel } from "@/lib/db/lessons";
import { getLiveSessions } from "@/lib/db/quizzes";
import { getLeaderboard, getXpTotal } from "@/lib/db/xp";
import { formatWeekday, now, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Acasă" };

function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 font-extrabold text-[28px] leading-none">
        <span aria-hidden="true" className="size-3.5 rotate-45 bg-primary" />
        {children}
      </h2>
      {action}
    </div>
  );
}

function SectionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 font-bold font-heading text-cyan text-sm uppercase tracking-wide hover:underline"
    >
      {children} <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function MissionList({
  items,
  empty,
}: {
  items: StudentHomework[];
  empty: string;
}) {
  if (items.length === 0)
    return (
      <EmptyState
        icon={PartyPopper}
        title={empty}
        description="Când mentorul dă o temă nouă, apare aici."
      />
    );
  return (
    <ul className="stagger grid gap-2.5">
      {items.map((h) => (
        <li key={h.id}>
          <MissionRow homework={h} />
        </li>
      ))}
    </ul>
  );
}

function StudentHomeSkeleton() {
  return (
    <div className="grid gap-8" aria-hidden="true">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StudentHomePage() {
  return (
    <Suspense fallback={<StudentHomeSkeleton />}>
      <StudentHomeContent />
    </Suspense>
  );
}

async function StudentHomeContent() {
  const me = await requireUser("student");
  const [homework, classes, sessions, totalXp, attendance] = await Promise.all([
    getStudentHomework(me.id),
    getStudentClasses(me.id),
    getLiveSessions(),
    getXpTotal(me.id),
    getStudentAttendance(me.id),
  ]);

  const needsChanges = (h: StudentHomework) =>
    h.problems.some((p) => p.state === "needs_changes");
  const active = homework.filter(
    (h) => needsChanges(h) || (!h.complete && !h.overdue),
  );
  const submitted = homework.filter((h) => h.complete && !needsChanges(h));
  const done = homework.filter(
    (h) => h.complete && h.problems.every((p) => p.state === "accepted"),
  );

  const perClass = await Promise.all(
    classes.active.map(async (c, index) => {
      const board = await getLeaderboard(c.id);
      const mine = board.find((r) => r.student.id === me.id);
      const classmates = [
        ...c.students.filter((s) => s.id === me.id),
        ...c.students.filter((s) => s.id !== me.id),
      ].slice(0, 3);
      return {
        classRoom: c,
        index,
        board,
        rank: mine?.rank ?? 0,
        xp: mine?.xp ?? 0,
        classmates,
        attendance: attendance.get(c.id),
      };
    }),
  );

  // Clasa în care elevul stă cel mai bine, pentru card și pentru „rivalul” de deasupra.
  const best = [...perClass].sort((a, b) => a.rank - b.rank || b.xp - a.xp)[0];
  // Cel mai apropiat elev care are mai mult XP (la egalitate nu e „în fața ta”).
  const rival = best?.board.filter((r) => r.xp > best.xp).at(-1);

  const all = [...attendance.values()];
  const attended = all.reduce((s, x) => s + x.attended, 0);
  const meetings = all.reduce((s, x) => s + x.total, 0);

  const live = sessions.find((s) => s.status !== "ended");
  const firstClass = classes.active[0];
  const newest = firstClass
    ? (await getClassLessons(firstClass.id)).at(-1)
    : undefined;

  const firstName = me.displayName.split(" ")[0];

  return (
    <div className="grid gap-8">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <header>
          <p className="font-bold font-heading text-cyan text-sm uppercase tracking-[0.12em]">
            {formatWeekday(now().toISOString())}
          </p>
          <h1 className="mt-2 font-extrabold text-6xl leading-[0.9] sm:text-[84px]">
            Bună, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            {active.length > 0 ? (
              <>
                Ai{" "}
                <b className="text-foreground">
                  {plural(active.length, "misiune activă", "misiuni active")}
                </b>
              </>
            ) : (
              "Ești la zi cu toate misiunile"
            )}
            {live ? <> și un quiz live deschis chiar acum.</> : "."}{" "}
            {rival ? (
              <>
                {rival.student.displayName.split(" ")[0]} e doar la{" "}
                <b className="text-foreground">{rival.xp - best.xp} XP</b> în
                fața ta.
              </>
            ) : best?.rank === 1 ? (
              <>Ești pe primul loc la {best.classRoom.name}.</>
            ) : null}
          </p>
        </header>
        <PlayerCard
          name={me.displayName}
          avatar={me.avatar}
          rankLine={
            best ? `Locul ${best.rank} · ${best.classRoom.name}` : undefined
          }
          stats={[
            { value: String(totalXp), label: "XP total" },
            {
              value:
                meetings > 0
                  ? `${Math.round((attended / meetings) * 100)}%`
                  : "–",
              label: "prezență",
            },
            { value: String(done.length), label: "teme acceptate" },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section>
          <SectionTitle
            action={<SectionLink href="/clase">Toate clasele</SectionLink>}
          >
            Misiuni
          </SectionTitle>
          <Tabs defaultValue="active">
            <TabsList className="mb-1">
              <TabsTrigger value="active">Active · {active.length}</TabsTrigger>
              <TabsTrigger value="submitted">
                Trimise · {submitted.length}
              </TabsTrigger>
              <TabsTrigger value="done">Acceptate · {done.length}</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <MissionList items={active} empty="Nicio misiune activă" />
            </TabsContent>
            <TabsContent value="submitted">
              <MissionList items={submitted} empty="Nimic trimis încă" />
            </TabsContent>
            <TabsContent value="done">
              <MissionList items={done} empty="Nicio temă acceptată încă" />
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid content-start gap-5">
          {best ? (
            <LeaderboardCard
              title="Clasament"
              subtitle={best.classRoom.name}
              href={`/clase/${best.classRoom.id}/clasament`}
              rows={best.board}
              meId={me.id}
            />
          ) : null}
        </div>
      </div>

      <section>
        <SectionTitle
          action={<SectionLink href="/clase">Clasele mele</SectionLink>}
        >
          Echipele tale
        </SectionTitle>
        <ul className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perClass.map((p) => (
            <li key={p.classRoom.id}>
              <TeamCard
                href={`/clase/${p.classRoom.id}`}
                index={p.index}
                badge={p.classRoom.schedule}
                title={p.classRoom.name}
                subtitle={`Mentor: ${p.classRoom.mentor.displayName}`}
                members={p.classmates.map((u) => ({
                  name: u.displayName,
                  avatar: u.avatar,
                }))}
                memberCount={p.classRoom.studentIds.length}
                progress={
                  p.attendance
                    ? {
                        done: p.attendance.attended,
                        total: p.attendance.total,
                        label: `Prezență: ${p.attendance.attended} din ${p.attendance.total} întâlniri`,
                      }
                    : undefined
                }
              />
            </li>
          ))}
          {newest && firstClass ? (
            <li>
              <TeamCard
                href={`/clase/${firstClass.id}/lectii/${newest.id}`}
                index={3}
                badge="Ultima lecție"
                title={lessonLabel(newest)}
                subtitle={`${firstClass.name} · ${plural(newest.items.length, "material", "materiale")}`}
              />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

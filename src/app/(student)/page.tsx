import { ArrowRight, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { MATERIAL_KIND } from "@/components/learning/material-kind";
import { ArenaCard } from "@/components/student-home/arena-card";
import { LeaderboardCard } from "@/components/student-home/leaderboard-card";
import { MissionRow } from "@/components/student-home/mission-row";
import { PlayerCard } from "@/components/student-home/player-card";
import { TeamCard } from "@/components/student-home/team-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLeaderboard,
  getLiveSessions,
  getStudentAssignments,
  getStudentAttendance,
  getStudentClasses,
  getStudentMaterials,
  getUser,
  getViewer,
  getXpTotal,
  type StudentAssignment,
} from "@/lib/data/queries";
import {
  formatDay,
  formatTime,
  formatWeekday,
  now,
  plural,
  relativeDays,
} from "@/lib/format";

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
  items: StudentAssignment[];
  empty: string;
}) {
  if (items.length === 0)
    return (
      <EmptyState
        icon={PartyPopper}
        title={empty}
        description="Când mentorul publică o temă nouă, apare aici."
      />
    );
  return (
    <ul className="stagger grid gap-2.5">
      {items.map((a) => (
        <li key={a.id}>
          <MissionRow assignment={a} />
        </li>
      ))}
    </ul>
  );
}

export default async function StudentHomePage() {
  const me = await getViewer("student");
  const [assignments, classes, materials, sessions, totalXp, attendance] =
    await Promise.all([
      getStudentAssignments(me.id),
      getStudentClasses(me.id),
      getStudentMaterials(me.id),
      getLiveSessions(me),
      getXpTotal(me.id),
      getStudentAttendance(me.id),
    ]);

  const active = assignments.filter(
    (a) =>
      a.submissionState === "not_started" ||
      a.submissionState === "needs_changes",
  );
  const submitted = assignments.filter(
    (a) => a.submissionState === "submitted",
  );
  const done = assignments.filter((a) => a.submissionState === "reviewed");

  const perClass = await Promise.all(
    classes.active.map(async (c, index) => {
      const board = await getLeaderboard(c.id);
      const mine = board.find((r) => r.student.id === me.id);
      const classmates = await Promise.all(
        [me.id, ...c.studentIds.filter((id) => id !== me.id)]
          .slice(0, 3)
          .map((id) => getUser(id)),
      );
      return {
        classRoom: c,
        index,
        board,
        rank: mine?.rank ?? 0,
        xp: mine?.xp ?? 0,
        classmates: classmates.filter((u) => u !== undefined),
        attendance: attendance.find((x) => x.classRoom.id === c.id),
      };
    }),
  );

  // Clasa în care elevul stă cel mai bine, pentru card și pentru „rivalul” de deasupra.
  const best = [...perClass].sort((a, b) => a.rank - b.rank || b.xp - a.xp)[0];
  // Cel mai apropiat elev care are mai mult XP (la egalitate nu e „în fața ta”).
  const rival = best?.board.filter((r) => r.xp > best.xp).at(-1);

  const attended = attendance.reduce((s, x) => s + x.attended, 0);
  const meetings = attendance.reduce((s, x) => s + x.total, 0);

  const next = sessions
    .filter((s) => s.status !== "ended")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
  const newest = [...materials].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  )[0];
  const newestAuthor = newest ? await getUser(newest.authorId) : undefined;

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
            {next ? (
              <>
                {" "}
                și o arenă live {relativeDays(next.startsAt)} la{" "}
                {formatTime(next.startsAt)}.
              </>
            ) : (
              "."
            )}{" "}
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
            { value: String(done.length), label: "teme evaluate" },
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
              <TabsTrigger value="done">Terminate · {done.length}</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <MissionList items={active} empty="Nicio misiune activă" />
            </TabsContent>
            <TabsContent value="submitted">
              <MissionList items={submitted} empty="Nimic trimis încă" />
            </TabsContent>
            <TabsContent value="done">
              <MissionList items={done} empty="Nicio temă evaluată încă" />
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid content-start gap-5">
          <ArenaCard
            session={
              next
                ? {
                    title: next.title,
                    className: next.className,
                    startsAt: next.startsAt,
                    players:
                      classes.active.find((c) => c.id === next.classId)
                        ?.studentIds.length ?? 0,
                    live: next.status === "lobby" || next.status === "running",
                  }
                : undefined
            }
          />
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
          {newest ? (
            <li>
              <TeamCard
                href={`/invatare/materiale/${newest.id}`}
                index={3}
                badge="Material nou"
                title={newest.title}
                subtitle={`${MATERIAL_KIND[newest.kind].label}${newestAuthor ? ` de la ${newestAuthor.displayName}` : ""} · ${formatDay(newest.publishedAt)}`}
              />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

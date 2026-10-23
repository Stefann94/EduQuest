import {
  ArrowRight,
  CalendarClock,
  PartyPopper,
  Radio,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentRow } from "@/components/assignments/assignment-row";
import { ClassCard } from "@/components/classes/class-card";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { MaterialRow } from "@/components/learning/material-row";
import { NotificationIcon } from "@/components/shell/notification-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  getLeaderboard,
  getLiveSessions,
  getNotifications,
  getStudentAssignments,
  getStudentClasses,
  getStudentMaterials,
  getViewer,
  getXpTotal,
} from "@/lib/data/queries";
import {
  formatDateTime,
  formatDay,
  formatWeekday,
  now,
  plural,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Acasă" };

export default async function StudentHomePage() {
  const me = await getViewer("student");
  const [assignments, classes, materials, sessions, notifications, totalXp] =
    await Promise.all([
      getStudentAssignments(me.id),
      getStudentClasses(me.id),
      getStudentMaterials(me.id),
      getLiveSessions(me),
      getNotifications(me.id),
      getXpTotal(me.id),
    ]);

  const todo = assignments.filter(
    (a) =>
      a.submissionState === "not_started" ||
      a.submissionState === "needs_changes",
  );
  const upcoming = sessions.filter((s) => s.status !== "ended").reverse();
  const perClass = await Promise.all(
    classes.active.map(async (c) => {
      const board = await getLeaderboard(c.id);
      const row = board.find((r) => r.student.id === me.id);
      return {
        classRoom: c,
        xp: row?.xp ?? 0,
        rank: row?.rank ?? 0,
        size: board.length,
      };
    }),
  );
  const firstName = me.displayName.split(" ")[0];

  return (
    <div className="grid gap-8">
      <PageHeader
        title={`Bună, ${firstName}!`}
        description={
          <>
            {formatWeekday(now().toISOString())} ·{" "}
            {todo.length > 0
              ? `Ai ${plural(todo.length, "temă", "teme")} de lucru.`
              : "Ești la zi cu toate temele."}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid content-start gap-6 lg:col-span-2">
          <Section
            title="De făcut"
            description="Teme neîncepute sau care au nevoie de corecturi"
            actions={
              <Link
                href="/clase"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Toate clasele <ArrowRight />
              </Link>
            }
            bodyClassName="p-3"
          >
            {todo.length > 0 ? (
              <ul className="stagger grid gap-2">
                {todo.map((a) => (
                  <li key={a.id}>
                    <AssignmentRow assignment={a} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={PartyPopper}
                title="Nicio temă în așteptare"
                description="Când mentorul publică o temă nouă, o vei vedea aici."
                className="border-0"
              />
            )}
          </Section>

          <Section
            title="Materiale noi"
            actions={
              <Link
                href="/invatare"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Învățare <ArrowRight />
              </Link>
            }
            bodyClassName="p-2"
          >
            <ul className="stagger">
              {materials.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <MaterialRow
                    material={m}
                    href={`/invatare/materiale/${m.id}`}
                  />
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-xl border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">XP-ul tău</h2>
              <Link
                href="/progres"
                className="font-medium text-primary text-sm hover:underline"
              >
                Detalii
              </Link>
            </div>
            <p className="mt-3 flex items-baseline gap-2">
              <Star
                className="size-6 self-center fill-xp text-xp"
                aria-hidden="true"
              />
              <span className="font-semibold text-4xl tabular-nums tracking-tight">
                {totalXp}
              </span>
              <span className="text-muted-foreground">XP în total</span>
            </p>
            <ul className="mt-4 grid gap-3 border-t pt-4">
              {perClass.map((p) => (
                <li
                  key={p.classRoom.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="min-w-0 truncate">{p.classRoom.name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {p.xp} XP · locul {p.rank} din {p.size}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <Section title="Quiz-uri programate" bodyClassName="p-3">
            {upcoming.length > 0 ? (
              <ul className="grid gap-2">
                {upcoming.map((s) => (
                  <li key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                        <Radio className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {s.className}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm">
                          <CalendarClock
                            className="size-3.5 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {formatDateTime(s.startsAt)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/live"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mt-3 w-full",
                      )}
                    >
                      Intră cu codul sesiunii
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 py-4 text-center text-muted-foreground text-sm">
                Niciun quiz live programat.
              </p>
            )}
          </Section>

          <Section
            title="Notificări recente"
            actions={
              <Link
                href="/notificari"
                className="font-medium text-primary text-sm hover:underline"
              >
                Toate
              </Link>
            }
            bodyClassName="p-2"
          >
            <ul>
              {notifications.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    className="flex gap-3 rounded-lg p-2.5 hover:bg-muted/60"
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
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDay(n.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-base">Clasele tale</h2>
          <Link
            href="/clase"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Clasele mele <ArrowRight />
          </Link>
        </div>
        <ul className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.active.map((c) => (
            <li key={c.id}>
              <ClassCard
                classRoom={c}
                href={`/clase/${c.id}`}
                viewAs="student"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

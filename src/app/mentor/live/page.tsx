import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Radio,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { StatusBadge, XpBadge } from "@/components/common/status";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatSessionCode } from "@/components/mentor-content/live-ranking";
import { LiveStartForm } from "@/components/mentor-content/live-start-form";
import { buttonVariants } from "@/components/ui/button";
import { getLiveSessionForMentor } from "@/lib/data/mentor-content-queries";
import {
  getLiveSessions,
  getMentorClasses,
  getMentorQuizzes,
  getViewer,
} from "@/lib/data/queries";
import { formatDateTime, plural, relativeDays } from "@/lib/format";

export const metadata: Metadata = { title: "Sesiuni live" };

export default async function MentorLivePage() {
  const me = await getViewer("mentor");
  const [sessions, classes, quizzes] = await Promise.all([
    getLiveSessions(me),
    getMentorClasses(me.id),
    getMentorQuizzes(me.id),
  ]);
  const upcoming = sessions
    .filter((s) => s.status !== "ended")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = await Promise.all(
    sessions
      .filter((s) => s.status === "ended")
      .map(async (s) => ({
        ...s,
        detail: await getLiveSessionForMentor(me.id, s.id),
      })),
  );

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Sesiuni live"
        description="Quiz-uri jucate împreună, în timpul orei. Tu controlezi întrebările, elevii răspund de pe dispozitivele lor."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="grid gap-8">
          <Section
            card={false}
            title={`Programate (${upcoming.length})`}
            description="Deschide panoul de control când începe ora."
          >
            {upcoming.length > 0 ? (
              <ul className="stagger grid gap-3">
                {upcoming.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/mentor/live/${s.id}`}
                      className="group flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card p-4 shadow-xs outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-5"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
                      >
                        <Radio className="size-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1 basis-56">
                        <p className="font-semibold group-hover:text-primary">
                          {s.title}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-muted-foreground text-sm">
                          <span>{s.className}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            {formatDateTime(s.startsAt)} (
                            {relativeDays(s.startsAt)})
                          </span>
                        </p>
                        <p className="mt-0.5 text-muted-foreground text-sm">
                          Quiz: {s.quiz.title} ·{" "}
                          {plural(
                            s.quiz.questions.length,
                            "întrebare",
                            "întrebări",
                          )}
                        </p>
                      </div>
                      <span className="text-right">
                        <span className="block text-muted-foreground text-xs">
                          Cod
                        </span>
                        <span className="font-mono font-semibold tabular-nums">
                          {formatSessionCode(s.code)}
                        </span>
                      </span>
                      <span
                        className={buttonVariants({ size: "sm" })}
                        aria-hidden="true"
                      >
                        Panou de control
                        <ChevronRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Radio}
                title="Nicio sesiune programată"
                description="Alege o clasă și un quiz din dreapta ca să deschizi lobby-ul."
              />
            )}
          </Section>

          <Section
            card={false}
            title={`Încheiate (${past.length})`}
            description="Rezultatele și XP-ul acordat, salvate la finalul fiecărei sesiuni."
          >
            {past.length > 0 ? (
              <ul className="stagger grid gap-3">
                {past.map((s) => {
                  const results = s.detail?.results ?? [];
                  const totalXp = results.reduce((t, r) => t + r.xp, 0);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/mentor/live/${s.id}`}
                        className="group grid gap-3 rounded-xl border bg-card p-4 shadow-xs outline-none transition-colors hover:border-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold group-hover:text-primary">
                              {s.title}
                            </p>
                            <p className="mt-0.5 text-muted-foreground text-sm">
                              {s.className} · {formatDateTime(s.startsAt)}
                            </p>
                          </div>
                          <StatusBadge icon={CheckCircle2} tone="success">
                            Încheiată
                          </StatusBadge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Users className="size-4" aria-hidden="true" />
                            {plural(
                              results.length,
                              "participant",
                              "participanți",
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="text-muted-foreground">
                              Podium:
                            </span>
                            {results.slice(0, 3).map((r) => (
                              <span
                                key={r.studentId}
                                className="inline-flex items-center gap-1"
                              >
                                <UserAvatar
                                  name={r.student.displayName}
                                  avatar={r.student.avatar}
                                  size="xs"
                                />
                                <span>
                                  {r.rank}.{" "}
                                  {r.student.displayName.split(" ")[0]}
                                </span>
                              </span>
                            ))}
                          </span>
                          <span className="inline-flex items-center gap-1.5 sm:ml-auto">
                            <span className="text-muted-foreground">
                              XP acordat:
                            </span>
                            <XpBadge amount={totalXp} />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="Nicio sesiune încheiată"
                description="După prima sesiune live, rezultatele apar aici."
              />
            )}
          </Section>
        </div>

        <Section
          title="Pornește o sesiune"
          description="Alege clasa și quiz-ul. Elevii intră cu un cod."
          className="lg:sticky lg:top-20"
        >
          <LiveStartForm
            classes={classes.active.map((c) => ({ id: c.id, name: c.name }))}
            quizzes={quizzes.map((q) => ({
              id: q.id,
              title: q.title,
              classId: q.classId,
              questions: q.questions.length,
            }))}
            scheduled={upcoming.map((s) => ({
              id: s.id,
              classId: s.classId,
              quizId: s.quizId,
            }))}
            demoSessionId={upcoming[0]?.id}
          />
        </Section>
      </div>
    </div>
  );
}

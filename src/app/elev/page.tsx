import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  KeyRound,
  Lock,
  Play,
  Star,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  demoBadges,
  demoGames,
  demoHomework,
  demoLeaderboard,
  demoStudent,
  type HomeworkStatus,
} from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Acasă" };

const statusLabel: Record<HomeworkStatus, { text: string; className: string }> =
  {
    "de-facut": {
      text: "De făcut",
      className: "bg-warning/15 text-amber-700 dark:text-warning",
    },
    predata: {
      text: "Predată",
      className: "bg-quiz-blue/12 text-quiz-blue",
    },
    corectata: {
      text: "Corectată",
      className: "bg-success/12 text-success",
    },
  };

export default function StudentHomePage() {
  const s = demoStudent;
  const xpPercent = Math.round((s.xp / s.xpNextLevel) * 100);

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-25" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="lg:flex-1">
            <p className="opacity-80">Salut, {s.firstName}! 👋</p>
            <h1 className="mt-1 font-bold text-3xl tracking-tight">
              Ești la nivelul {s.level}
            </h1>
            <div className="mt-5 w-full max-w-sm">
              <div className="mb-2 flex justify-between gap-4 text-sm">
                <span className="opacity-80">
                  Până la nivelul {s.level + 1}
                </span>
                <span className="font-semibold tabular-nums">
                  {s.xp} / {s.xpNextLevel} XP
                </span>
              </div>
              <Progress
                value={xpPercent}
                aria-label="Progres către nivelul următor"
                className="[&_[data-slot=progress-indicator]]:bg-xp [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-primary-foreground/20"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Stat icon={Flame} value={`${s.streakDays} zile`} label="la rând" />
            <Stat icon={Trophy} value={`#${s.rank}`} label="în grupă" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Temele mele</CardTitle>
            <CardDescription>Ce ai de lucru săptămâna asta</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3">
              {demoHomework.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border p-4"
                >
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-lg",
                      statusLabel[h.status].className,
                    )}
                  >
                    {h.status === "corectata" ? (
                      <CheckCircle2 className="size-5" />
                    ) : (
                      <Clock className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{h.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {h.topic} · termen {h.due}
                    </p>
                  </div>
                  {h.grade !== undefined ? (
                    <span className="font-bold text-lg text-success tabular-nums">
                      {h.grade}
                    </span>
                  ) : null}
                  <Badge
                    className={cn(
                      "h-6 px-2.5",
                      statusLabel[h.status].className,
                    )}
                  >
                    {statusLabel[h.status].text}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 border-dashed bg-secondary/40 ring-0">
          <CardHeader>
            <CardTitle className="text-lg">Quiz live</CardTitle>
            <CardDescription>
              Mentorul pornește quiz-ul în timpul orei. Ține PIN-ul pregătit!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-end gap-6">
            <div
              aria-hidden="true"
              className="grid flex-1 grid-cols-2 place-content-center gap-2"
            >
              {ANSWER_STYLES.map((style, i) => (
                <span
                  key={style.shape}
                  className={cn(
                    "grid h-12 place-items-center rounded-xl",
                    style.bg,
                    i % 3 === 0 ? "rotate-2" : "-rotate-2",
                  )}
                >
                  <AnswerShape shape={style.shape} className="size-5" />
                </span>
              ))}
            </div>
            <Link
              href="/intra"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full gap-2 text-base",
              )}
            >
              <KeyRound /> Intră cu PIN
            </Link>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="font-semibold text-lg">Jocuri rapide</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demoGames.map((g) => (
            <Link
              key={g.id}
              href="/live"
              className="group rounded-2xl border bg-card p-5 outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl text-white",
                    g.color,
                  )}
                >
                  <Play className="size-4 fill-current" />
                </span>
                <span className="text-muted-foreground text-xs">
                  ~{g.minutes} min
                </span>
              </div>
              <p className="mt-4 font-semibold">{g.title}</p>
              <p className="mt-1 text-muted-foreground text-sm">
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clasamentul grupei</CardTitle>
            <CardDescription>{s.group} · săptămâna asta</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-1.5">
              {demoLeaderboard.map((p, i) => (
                <li
                  key={p.name}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2",
                    p.isMe && "bg-secondary font-semibold",
                  )}
                >
                  <span className="w-5 text-muted-foreground text-sm tabular-nums">
                    {i + 1}
                  </span>
                  <span className="grid size-8 place-items-center rounded-full bg-muted font-semibold text-xs">
                    {p.initials}
                  </span>
                  <span className="flex-1">
                    {p.name}
                    {p.isMe ? " (tu)" : ""}
                  </span>
                  <span className="flex items-center gap-1 text-sm tabular-nums">
                    <Star className="size-3.5 fill-xp text-xp" />
                    {p.xp}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insignele mele</CardTitle>
            <CardDescription>
              {demoBadges.filter((b) => b.earned).length} din{" "}
              {demoBadges.length} câștigate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
              {demoBadges.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <span
                    className={cn(
                      "grid size-14 place-items-center rounded-2xl",
                      b.earned
                        ? "bg-xp/20 text-xp"
                        : "bg-muted text-muted-foreground/50",
                    )}
                  >
                    {b.earned ? (
                      <Award className="size-7" />
                    ) : (
                      <Lock className="size-6" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-tight",
                      !b.earned && "text-muted-foreground",
                    )}
                  >
                    {b.title}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-primary-foreground/12 px-4 py-3 backdrop-blur">
      <Icon className="size-5 text-xp" />
      <p className="mt-1 font-bold text-xl">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}

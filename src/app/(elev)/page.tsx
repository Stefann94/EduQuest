import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  HOMEWORK_STATUS,
  HomeworkBadge,
} from "@/components/app/homework-status";
import { LevelStars } from "@/components/app/level-stars";
import { SectionTitle } from "@/components/app/section-title";
import { Mascot } from "@/components/brand/mascot";
import { PinJoin } from "@/components/quiz/pin-join";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { demoExercises, demoHomework, demoStudent } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Acasă" };

export default function StudentHomePage() {
  const s = demoStudent;
  const xpPercent = Math.round((s.xp / s.xpNextLevel) * 100);
  const openCount = demoHomework.filter((h) => h.status === "de-facut").length;
  const nextExercises = demoExercises.filter((e) => !e.done).slice(0, 3);

  return (
    <div className="grid gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_6px_0_0_var(--primary-shadow)] sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-40 [--primary:var(--primary-foreground)]" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="hidden size-32 shrink-0 place-items-center rounded-full bg-card shadow-[0_5px_0_0_var(--primary-shadow)] sm:grid">
            <Mascot className="size-24 animate-float" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg opacity-90">
              Salut, {s.firstName}! 👋
            </p>
            <h1 className="mt-1 font-bold text-4xl">Nivelul {s.level} 🚀</h1>
            <div className="mt-4 max-w-md">
              <div className="mb-2 flex justify-between gap-4 font-bold text-sm">
                <span className="opacity-90">
                  Încă puțin până la nivelul {s.level + 1}!
                </span>
                <span className="tabular-nums">
                  {s.xp} / {s.xpNextLevel} XP
                </span>
              </div>
              <Progress
                value={xpPercent}
                aria-label="Progres către nivelul următor"
                className="[&_[data-slot=progress-indicator]]:bg-primary-foreground [&_[data-slot=progress-track]]:h-4 [&_[data-slot=progress-track]]:bg-primary-foreground/25"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Stat emoji="🔥" value={`${s.streakDays} zile`} label="la rând" />
            <Stat emoji="🏆" value={`#${s.rank}`} label="în grupă" />
          </div>
        </div>
      </section>

      <section className="sticker grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <SectionTitle
          emoji="⚡"
          title="Quiz live"
          hint="Mentorul îți arată PIN-ul în timpul orei."
        />
        <PinJoin />
      </section>

      <div className="groups grid gap-6 lg:grid-cols-2">
        <section className="sticker p-5 sm:p-6">
          <SectionTitle
            emoji="📚"
            title="Temele mele"
            hint={`${openCount} ${openCount === 1 ? "temă de făcut" : "teme de făcut"}`}
            action={<SeeAll href="/teme" />}
          />
          <ul className="stagger-slide mt-5 grid gap-3">
            {demoHomework.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/exercitii/${h.exerciseId}`}
                  className="flex items-center gap-3 rounded-2xl border-2 bg-background p-4 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl"
                  >
                    {HOMEWORK_STATUS[h.status].emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold font-heading text-lg">{h.title}</p>
                    <p className="font-semibold text-muted-foreground text-sm">
                      până {h.due}
                    </p>
                  </div>
                  <HomeworkBadge status={h.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sticker p-5 sm:p-6">
          <SectionTitle
            emoji="💻"
            title="Exerciții pentru tine"
            hint="Continuă de unde ai rămas"
            action={<SeeAll href="/exercitii" />}
          />
          <ul className="stagger-slide mt-5 grid gap-3">
            {nextExercises.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/exercitii/${e.id}`}
                  className="flex items-center gap-3 rounded-2xl border-2 bg-background p-4 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl"
                  >
                    {e.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold font-heading text-lg">{e.title}</p>
                    <p className="font-semibold text-muted-foreground text-sm">
                      {e.topic} · +{e.xp} XP
                    </p>
                  </div>
                  <LevelStars level={e.level} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "shrink-0",
      )}
    >
      Vezi tot <ArrowRight />
    </Link>
  );
}

function Stat({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <div className="min-w-24 rounded-3xl bg-primary-foreground/20 px-4 py-3 text-center">
      <span aria-hidden="true" className="text-2xl">
        {emoji}
      </span>
      <p className="font-bold font-heading text-2xl leading-tight">{value}</p>
      <p className="font-bold text-xs opacity-90">{label}</p>
    </div>
  );
}

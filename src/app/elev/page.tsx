import type { Metadata } from "next";
import Link from "next/link";
import { SectionTitle } from "@/components/app/section-title";
import { Mascot } from "@/components/brand/mascot";
import {
  AvatarPicker,
  ColorPicker,
} from "@/components/personalize/theme-picker";
import { UserAvatar } from "@/components/personalize/user-avatar";
import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { buttonVariants } from "@/components/ui/button";
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

const status: Record<
  HomeworkStatus,
  { text: string; emoji: string; className: string }
> = {
  "de-facut": {
    text: "De făcut",
    emoji: "⏰",
    className: "bg-fun-yellow/30 text-amber-800",
  },
  predata: {
    text: "Trimisă",
    emoji: "📨",
    className: "bg-fun-blue/15 text-sky-800",
  },
  corectata: {
    text: "Corectată",
    emoji: "✅",
    className: "bg-fun-green/20 text-emerald-800",
  },
};

export default function StudentHomePage() {
  const s = demoStudent;
  const xpPercent = Math.round((s.xp / s.xpNextLevel) * 100);

  return (
    <div className="grid gap-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_6px_0_0_var(--primary-shadow)] sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="hidden size-32 shrink-0 animate-float place-items-center rounded-full bg-white shadow-[0_5px_0_0_var(--primary-shadow)] sm:grid">
            <Mascot className="size-24" />
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
                className="[&_[data-slot=progress-indicator]]:bg-fun-yellow [&_[data-slot=progress-track]]:h-4 [&_[data-slot=progress-track]]:bg-white/25"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Stat emoji="🔥" value={`${s.streakDays} zile`} label="la rând" />
            <Stat emoji="🏆" value={`#${s.rank}`} label="în grupă" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="sticker p-5 sm:p-6 lg:col-span-2">
          <SectionTitle
            emoji="📚"
            title="Misiunile mele"
            hint="Temele de săptămâna asta"
          />
          <ul className="mt-5 grid gap-3">
            {demoHomework.map((h) => (
              <li
                key={h.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border-2 bg-background p-4 transition-transform hover:-translate-y-0.5"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-2xl text-2xl",
                    status[h.status].className,
                  )}
                >
                  {status[h.status].emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold font-heading text-lg">{h.title}</p>
                  <p className="font-semibold text-muted-foreground text-sm">
                    {h.topic} · până {h.due}
                  </p>
                </div>
                {h.grade !== undefined ? (
                  <span className="-rotate-6 rounded-xl bg-fun-green px-2.5 py-1 font-bold font-heading text-white text-xl">
                    {h.grade}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "rounded-full px-3 py-1 font-bold text-sm",
                    status[h.status].className,
                  )}
                >
                  {status[h.status].text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="sticker flex flex-col border-primary/40 border-dashed bg-primary-soft p-5 sm:p-6">
          <SectionTitle
            emoji="⚡"
            title="Quiz live"
            hint="Ține PIN-ul pregătit!"
          />
          <div
            aria-hidden="true"
            className="my-6 grid flex-1 grid-cols-2 place-content-center gap-3"
          >
            {ANSWER_STYLES.map((style, i) => (
              <span
                key={style.shape}
                className={cn(
                  "grid h-14 place-items-center rounded-2xl",
                  style.bg,
                  style.shadow,
                  i % 3 === 0 ? "rotate-3" : "-rotate-3",
                )}
              >
                <AnswerShape shape={style.shape} className="size-6" />
              </span>
            ))}
          </div>
          <Link
            href="/intra"
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Intră cu PIN 🎟️
          </Link>
        </section>
      </div>

      <section>
        <SectionTitle
          emoji="🎮"
          title="Jocuri rapide"
          hint="2–5 minute fiecare"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demoGames.map((g, i) => (
            <Link
              key={g.id}
              href="/live"
              className={cn(
                "sticker group p-5 outline-none transition-transform hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-ring/40",
                i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl text-3xl transition-transform group-hover:scale-110",
                    g.tile,
                  )}
                >
                  {g.emoji}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 font-bold text-secondary-foreground text-xs">
                  ⏱ {g.minutes} min
                </span>
              </div>
              <p className="mt-4 font-bold font-heading text-xl">{g.title}</p>
              <p className="mt-1 font-semibold text-muted-foreground text-sm">
                {g.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="sticker p-5 sm:p-6">
          <SectionTitle
            emoji="🏆"
            title="Clasamentul grupei"
            hint={`${s.group} · săptămâna asta`}
          />
          <ol className="mt-5 grid gap-2">
            {demoLeaderboard.map((p, i) => (
              <li
                key={p.name}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-3 py-2",
                  p.isMe
                    ? "border-primary bg-primary-soft shadow-[0_3px_0_0_var(--primary)]"
                    : "border-transparent bg-background",
                )}
              >
                <span className="w-7 text-center font-bold font-heading text-lg">
                  {["🥇", "🥈", "🥉"][i] ?? i + 1}
                </span>
                {p.isMe ? (
                  <UserAvatar className="size-10 text-xl" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-2xl bg-secondary text-xl"
                  >
                    {p.avatar}
                  </span>
                )}
                <span className="flex-1 font-bold">
                  {p.name}
                  {p.isMe ? " (tu)" : ""}
                </span>
                <span className="font-bold font-heading tabular-nums">
                  ⭐ {p.xp}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="sticker p-5 sm:p-6">
          <SectionTitle
            emoji="🏅"
            title="Insignele mele"
            hint={`${demoBadges.filter((b) => b.earned).length} din ${demoBadges.length} câștigate`}
          />
          <ul className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
            {demoBadges.map((b, i) => (
              <li
                key={b.id}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-16 place-items-center rounded-full border-4 text-3xl",
                    b.earned
                      ? "border-fun-yellow bg-fun-yellow/20 shadow-[0_4px_0_0_var(--fun-orange)]"
                      : "border-dashed border-border bg-muted opacity-60 grayscale",
                    b.earned && (i % 2 === 0 ? "-rotate-6" : "rotate-6"),
                  )}
                >
                  {b.earned ? b.emoji : "🔒"}
                </span>
                <span
                  className={cn(
                    "font-bold text-xs leading-tight",
                    !b.earned && "text-muted-foreground",
                  )}
                >
                  {b.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="sticker grid gap-6 p-5 sm:p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <SectionTitle
            emoji="✨"
            title="Personalizează"
            hint="Alege-ți culoarea și avatarul. Le poți schimba oricând!"
          />
        </div>
        <ColorPicker className="max-w-sm" />
        <AvatarPicker className="max-w-md" />
      </section>
    </div>
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
    <div className="min-w-24 rounded-3xl bg-white/20 px-4 py-3 text-center">
      <span aria-hidden="true" className="text-2xl">
        {emoji}
      </span>
      <p className="font-bold font-heading text-2xl leading-tight">{value}</p>
      <p className="font-bold text-xs opacity-90">{label}</p>
    </div>
  );
}

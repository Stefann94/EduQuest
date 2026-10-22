import { Play } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { SectionTitle } from "@/components/app/section-title";
import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { PinJoin } from "@/components/quiz/pin-join";
import { buttonVariants } from "@/components/ui/button";
import { demoPracticeQuizzes, demoQuizHistory } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Quiz-uri" };

export default function QuizPage() {
  return (
    <div className="grid gap-8">
      <PageHeader
        emoji="⚡"
        title="Quiz-uri"
        description="Joacă live cu grupa sau exersează singur."
      />

      <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-primary-foreground shadow-[0_6px_0_0_var(--primary-shadow)] sm:p-8">
        <div className="bg-dots absolute inset-0 opacity-40 [--primary:var(--primary-foreground)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="font-bold text-3xl">Intră într-un quiz live 🎟️</h2>
            <p className="mt-1 font-semibold text-lg opacity-90">
              Scrie PIN-ul pe care ți-l arată mentorul pe ecran.
            </p>
            <PinJoin onColor className="mt-5 max-w-lg" />
          </div>
          <div aria-hidden="true" className="hidden grid-cols-2 gap-3 lg:grid">
            {ANSWER_STYLES.map((style, i) => (
              <span
                key={style.shape}
                className={cn(
                  "grid size-20 place-items-center rounded-3xl",
                  style.bg,
                  style.shadow,
                  i % 3 === 0 ? "rotate-6" : "-rotate-6",
                )}
              >
                <AnswerShape shape={style.shape} className="size-8" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle
          emoji="🏋️"
          title="Exersează singur"
          hint="Quiz-uri scurte, fără cronometru pentru clasament"
        />
        <ul className="mt-5 grid gap-4 sm:grid-cols-3">
          {demoPracticeQuizzes.map((q, i) => (
            <li key={q.id}>
              <Link
                href="/live"
                className={cn(
                  "sticker group flex h-full flex-col gap-4 p-5 transition-transform hover:-translate-y-1",
                  i % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1",
                )}
              >
                <span
                  aria-hidden="true"
                  className="grid size-14 place-items-center rounded-2xl bg-secondary text-3xl transition-transform group-hover:scale-110"
                >
                  {q.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-bold font-heading text-xl">{q.title}</p>
                  <p className="font-semibold text-muted-foreground text-sm">
                    {q.questions} întrebări
                  </p>
                </div>
                <span
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "w-full",
                  )}
                >
                  <Play className="fill-current" /> Joacă
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="sticker p-5 sm:p-6">
        <SectionTitle
          emoji="📜"
          title="Quiz-urile mele"
          hint="Rezultatele de la ore"
        />
        <ul className="mt-5 grid gap-3">
          {demoQuizHistory.map((q) => (
            <li
              key={q.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border-2 bg-background p-4"
            >
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-secondary font-bold font-heading text-2xl"
              >
                {["🥇", "🥈", "🥉"][q.place - 1] ?? `#${q.place}`}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold font-heading text-lg">{q.title}</p>
                <p className="font-semibold text-muted-foreground text-sm">
                  {q.date} · locul {q.place} din {q.players}
                </p>
              </div>
              <span className="font-bold font-heading text-xl tabular-nums">
                ⭐ {q.points}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

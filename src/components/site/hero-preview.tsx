import { Users } from "lucide-react";
import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { cn } from "@/lib/utils";

const answers = ["10", "8", "12", "2 + 3 * 2"];
const players = ["MI", "LD", "AP", "SR", "DM"];

// Ilustrația din hero: un ecran de quiz live, desenat din HTML (fără imagini de încărcat).
export function HeroPreview() {
  return (
    <div className="relative mb-6" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />
      <div className="rotate-1 rounded-3xl border bg-card p-5 shadow-primary/10 shadow-xl sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground">
            Întrebarea 3 din 10
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-4" /> 18 elevi
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-lg">Ce afișează programul?</p>
            <pre className="mt-3 rounded-xl bg-code px-4 py-3 font-mono text-code-foreground text-sm">
              <span className="text-quiz-yellow">print</span>(2 + 3 * 2)
            </pre>
          </div>
          <div className="relative grid size-16 shrink-0 place-items-center">
            <svg
              viewBox="0 0 36 36"
              aria-hidden="true"
              className="absolute inset-0 -rotate-90"
            >
              <circle
                cx="18"
                cy="18"
                r="15.5"
                className="fill-none stroke-muted"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                className="fill-none stroke-primary"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="97.4"
                strokeDashoffset="34"
              />
            </svg>
            <span className="font-bold text-xl tabular-nums">13</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {ANSWER_STYLES.map((style, i) => (
            <div
              key={style.shape}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3.5 font-semibold text-white shadow-sm",
                style.bg,
                i === 1 &&
                  "ring-4 ring-primary/40 ring-offset-2 ring-offset-card",
              )}
            >
              <AnswerShape shape={style.shape} className="size-5" />
              <span className="font-mono">{answers[i]}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-1">
            {players.map((p, i) => (
              <span
                key={p}
                className={cn(
                  "grid size-8 place-items-center rounded-full font-semibold text-white text-xs ring-2 ring-card",
                  ANSWER_STYLES[i % 4].bg,
                )}
              >
                {p}
              </span>
            ))}
          </div>
          <span className="text-muted-foreground text-sm">12 au răspuns</span>
        </div>
      </div>

      <div className="absolute -bottom-12 left-4 -rotate-3 rounded-2xl border bg-card px-4 py-3 shadow-lg sm:-left-6">
        <p className="text-muted-foreground text-xs">Corect! Răspuns rapid</p>
        <p className="font-bold text-success text-xl">+ 940 XP</p>
      </div>
    </div>
  );
}

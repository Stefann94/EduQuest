import { ANSWER_STYLES, AnswerShape } from "@/components/quiz/answer-shape";
import { cn } from "@/lib/utils";

const answers = ["10", "8", "12", "2 + 3 * 2"];
const players = ["🦊", "🐼", "🐸", "🦄", "🐙"];

// Ilustrația din hero: un ecran de quiz live, desenat din HTML (fără imagini de încărcat).
export function HeroPreview() {
  return (
    <div className="relative mb-8" aria-hidden="true">
      <div className="sticker rotate-2 p-5 sm:p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-secondary px-3 py-1 font-bold text-secondary-foreground">
            Întrebarea 3 / 10
          </span>
          <span className="font-bold text-muted-foreground">👥 18 elevi</span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-bold font-heading text-xl">
              Ce afișează programul?
            </p>
            <pre className="mt-3 rounded-2xl bg-code px-4 py-3 font-mono text-code-foreground text-sm">
              <span className="text-fun-yellow">print</span>(2 + 3 * 2)
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
                className="fill-none stroke-secondary"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                className="fill-none stroke-primary"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="97.4"
                strokeDashoffset="34"
              />
            </svg>
            <span className="font-bold font-heading text-2xl">13</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {ANSWER_STYLES.map((style, i) => (
            <div
              key={style.shape}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 font-bold text-white",
                style.bg,
                style.shadow,
                i === 1 && "ring-4 ring-foreground/70 ring-offset-2",
              )}
            >
              <AnswerShape shape={style.shape} className="size-5" />
              <span className="font-mono">{answers[i]}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex -space-x-2">
            {players.map((p) => (
              <span
                key={p}
                className="grid size-9 place-items-center rounded-full border-2 border-card bg-secondary text-lg"
              >
                {p}
              </span>
            ))}
          </div>
          <span className="font-bold text-muted-foreground text-sm">
            12 au răspuns
          </span>
        </div>
      </div>

      <div className="sticker absolute -bottom-12 left-4 -rotate-6 px-4 py-3 sm:-left-6">
        <p className="font-bold text-muted-foreground text-xs">
          Corect! Super rapid ⚡
        </p>
        <p className="font-bold font-heading text-2xl text-success">+940 XP</p>
      </div>
      <div className="sticker absolute -top-6 -right-2 rotate-12 px-3 py-2 font-bold font-heading text-lg sm:-right-6">
        🔥 3 la rând!
      </div>
    </div>
  );
}

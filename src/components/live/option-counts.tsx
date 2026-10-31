import { CheckCircle2, ListChecks, UserRound } from "lucide-react";
import { StatusBadge } from "@/components/common/status";
import { RichText } from "@/components/learning/rich-text";
import { isChosen } from "@/lib/quiz-answers";
import { cn } from "@/lib/utils";
import { LiveAnswerShape, liveAnswerStyle } from "./answer-styles";

/** Eticheta unei întrebări cu mai multe răspunsuri corecte. */
export function MultiAnswerLabel({
  className,
  children = "Mai multe răspunsuri corecte",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-1.5 bg-primary-soft px-2.5 py-1 font-bold font-heading text-primary text-xs uppercase tracking-wide",
        className,
      )}
    >
      <ListChecks className="size-4" aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * După dezvăluire: câți elevi au ales fiecare variantă, cu variantele corecte evidențiate
 * și (la elev) alegerea lui marcată. La o întrebare cu mai multe răspunsuri, `correct` și
 * `mine` sunt măști, iar procentele sunt din câți au răspuns.
 */
export function OptionCounts({
  options,
  counts,
  correct,
  mine,
  multi = false,
  answered,
  large = false,
}: {
  options: string[];
  counts: number[] | undefined;
  correct: number | undefined;
  mine?: number | null;
  multi?: boolean;
  /** Câți elevi au răspuns (numitorul procentelor la `multi`). */
  answered?: number;
  /** Pentru proiectarea în clasă: text și cifre mai mari. */
  large?: boolean;
}) {
  const values = options.map((_, i) => counts?.[i] ?? 0);
  const sum = values.reduce((a, b) => a + b, 0);
  const total = multi ? Math.max(answered ?? 0, ...values) : sum;
  const max = Math.max(1, ...values);

  return (
    <ul className="grid gap-2" aria-label="Câți au ales fiecare variantă">
      {options.map((opt, i) => {
        const style = liveAnswerStyle(i);
        const n = values[i];
        const isCorrect = isChosen(correct, multi, i);
        const isMine = isChosen(mine, multi, i);
        const pct = total ? Math.round((n / total) * 100) : 0;
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
            key={i}
            className={cn(
              "grid cut-sm gap-2 p-3",
              isCorrect ? "bg-success-soft" : "bg-card",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid shrink-0 cut-xs place-items-center",
                  large ? "size-11" : "size-9",
                  style.className,
                )}
              >
                <LiveAnswerShape index={i} className="size-5" />
              </span>
              <span className="sr-only">{style.shapeLabel}: </span>
              <span
                className={cn(
                  "min-w-0 flex-1 font-mono",
                  large ? "text-xl" : "text-base",
                  !isCorrect && "text-muted-foreground",
                )}
              >
                <RichText text={opt} />
              </span>
              <span className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {isCorrect ? (
                  <StatusBadge icon={CheckCircle2} tone="success">
                    Corect
                  </StatusBadge>
                ) : null}
                {isMine ? (
                  <StatusBadge icon={UserRound} tone="primary">
                    Alegerea ta
                  </StatusBadge>
                ) : null}
              </span>
              <span
                className={cn(
                  "w-14 shrink-0 text-right font-extrabold font-heading tabular-nums",
                  large ? "text-4xl" : "text-2xl",
                )}
              >
                {n}
                <span className="sr-only">
                  {n === 1 ? " elev" : " elevi"}, {pct}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3" aria-hidden="true">
              <div className="h-3 flex-1 bg-muted">
                <div
                  className={cn(
                    "h-full transition-[width] duration-700 ease-out motion-reduce:transition-none",
                    style.bar,
                    !isCorrect && "opacity-55",
                  )}
                  style={{ width: `${(n / max) * 100}%` }}
                />
              </div>
              <span className="w-10 text-right text-muted-foreground text-xs tabular-nums">
                {pct}%
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

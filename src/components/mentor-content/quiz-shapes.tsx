import { cn } from "@/lib/utils";

// Variantele de răspuns din quiz: fiecare are o culoare ȘI o formă,
// ca să poată fi recunoscută și fără să deosebești culorile.

export const ANSWER_STYLES = [
  {
    shape: "triangle",
    label: "Triunghi",
    bg: "bg-quiz-red",
    text: "text-white",
    soft: "bg-quiz-red/10",
    fill: "fill-quiz-red",
  },
  {
    shape: "diamond",
    label: "Romb",
    bg: "bg-quiz-blue",
    text: "text-white",
    soft: "bg-quiz-blue/10",
    fill: "fill-quiz-blue",
  },
  {
    shape: "circle",
    label: "Cerc",
    bg: "bg-quiz-yellow",
    // Pe galben, textul închis are contrast mai bun.
    text: "text-foreground",
    soft: "bg-quiz-yellow/15",
    fill: "fill-quiz-yellow",
  },
  {
    shape: "square",
    label: "Pătrat",
    bg: "bg-quiz-green",
    text: "text-white",
    soft: "bg-quiz-green/10",
    fill: "fill-quiz-green",
  },
] as const;

/** Forma unei variante de răspuns (decorativă; textul variantei rămâne alături). */
export function AnswerShape({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const shape = ANSWER_STYLES[index % 4].shape;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-5 shrink-0 fill-current", className)}
    >
      {shape === "triangle" ? <path d="M12 3 22 20H2Z" /> : null}
      {shape === "diamond" ? <path d="M12 2 22 12 12 22 2 12Z" /> : null}
      {shape === "circle" ? <circle cx="12" cy="12" r="10" /> : null}
      {shape === "square" ? (
        <rect x="3" y="3" width="18" height="18" rx="2" />
      ) : null}
    </svg>
  );
}

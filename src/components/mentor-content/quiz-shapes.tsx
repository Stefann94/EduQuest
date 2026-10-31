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
  {
    shape: "hexagon",
    label: "Hexagon",
    bg: "bg-violet-700",
    text: "text-white",
    soft: "bg-violet-700/10",
    fill: "fill-violet-700",
  },
  {
    shape: "star",
    label: "Stea",
    bg: "bg-pink-700",
    text: "text-white",
    soft: "bg-pink-700/10",
    fill: "fill-pink-700",
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
  const shape = ANSWER_STYLES[index % ANSWER_STYLES.length].shape;
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
      {shape === "hexagon" ? <path d="M7 3h10l5 9-5 9H7l-5-9Z" /> : null}
      {shape === "star" ? (
        <path d="m12 2 2.9 6.6 7.1.6-5.4 4.7 1.6 7.1L12 17.3 5.8 21l1.6-7.1L2 9.2l7.1-.6Z" />
      ) : null}
    </svg>
  );
}

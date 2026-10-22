import { cn } from "@/lib/utils";

// Fiecare variantă are culoare ȘI formă, ca să poată fi deosebită și de copiii daltoniști.
export const ANSWER_STYLES = [
  { shape: "triangle", label: "Triunghi", bg: "bg-quiz-red" },
  { shape: "diamond", label: "Romb", bg: "bg-quiz-blue" },
  { shape: "circle", label: "Cerc", bg: "bg-quiz-yellow" },
  { shape: "square", label: "Pătrat", bg: "bg-quiz-green" },
] as const;

export type AnswerShapeName = (typeof ANSWER_STYLES)[number]["shape"];

export function AnswerShape({
  shape,
  className,
}: {
  shape: AnswerShapeName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("size-6 shrink-0 fill-white", className)}
    >
      {shape === "triangle" && <path d="M12 3 22 20H2z" />}
      {shape === "diamond" && <path d="m12 2 10 10-10 10L2 12z" />}
      {shape === "circle" && <circle cx="12" cy="12" r="10" />}
      {shape === "square" && <rect x="3" y="3" width="18" height="18" rx="2" />}
    </svg>
  );
}

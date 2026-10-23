import {
  Circle,
  Diamond,
  type LucideIcon,
  Square,
  Triangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Variantele din quiz-ul live se deosebesc prin culoare ȘI formă,
// ca să poată fi recunoscute și fără să distingi culorile.
export const ANSWER_STYLES: {
  shape: LucideIcon;
  shapeLabel: string;
  className: string;
}[] = [
  {
    shape: Triangle,
    shapeLabel: "triunghi",
    className: "bg-quiz-red text-white",
  },
  {
    shape: Diamond,
    shapeLabel: "romb",
    className: "bg-quiz-blue text-white",
  },
  {
    shape: Circle,
    shapeLabel: "cerc",
    className: "bg-quiz-yellow text-foreground",
  },
  {
    shape: Square,
    shapeLabel: "pătrat",
    className: "bg-quiz-green text-white",
  },
];

export function AnswerShape({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const { shape: Icon } = ANSWER_STYLES[index % ANSWER_STYLES.length];
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-6 shrink-0 fill-current", className)}
      strokeWidth={1.5}
    />
  );
}

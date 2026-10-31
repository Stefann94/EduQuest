import {
  Circle,
  Diamond,
  Hexagon,
  type LucideIcon,
  Square,
  Star,
  Triangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Variantele din quiz-ul live (2–6) se deosebesc prin culoare ȘI formă,
// ca să poată fi recunoscute și fără să distingi culorile.
export const LIVE_ANSWER_STYLES: {
  shape: LucideIcon;
  shapeLabel: string;
  /** Fundalul și textul butonului. */
  className: string;
  /** Doar culoarea, pentru barele cu numărul de răspunsuri. */
  bar: string;
}[] = [
  {
    shape: Triangle,
    shapeLabel: "triunghi",
    className: "bg-quiz-red text-white",
    bar: "bg-quiz-red",
  },
  {
    shape: Diamond,
    shapeLabel: "romb",
    className: "bg-quiz-blue text-white",
    bar: "bg-quiz-blue",
  },
  {
    shape: Circle,
    shapeLabel: "cerc",
    // Pe galben, textul închis are contrast mai bun.
    className: "bg-quiz-yellow text-foreground",
    bar: "bg-quiz-yellow",
  },
  {
    shape: Square,
    shapeLabel: "pătrat",
    className: "bg-quiz-green text-white",
    bar: "bg-quiz-green",
  },
  {
    shape: Hexagon,
    shapeLabel: "hexagon",
    className: "bg-violet-700 text-white",
    bar: "bg-violet-700",
  },
  {
    shape: Star,
    shapeLabel: "stea",
    className: "bg-pink-700 text-white",
    bar: "bg-pink-700",
  },
];

export const liveAnswerStyle = (index: number) =>
  LIVE_ANSWER_STYLES[index % LIVE_ANSWER_STYLES.length];

export function LiveAnswerShape({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const { shape: Icon } = liveAnswerStyle(index);
  return (
    <Icon
      aria-hidden="true"
      className={cn("size-6 shrink-0 fill-current", className)}
      strokeWidth={1.5}
    />
  );
}

/**
 * Grila variantelor, după câte sunt: 2 și 4 pe două coloane, 3 pe trei,
 * 5 pe 3 + 2 (pe ecran lat), 6 pe trei coloane.
 */
export function optionGridClass(count: number) {
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  if (count === 5) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6";
  if (count >= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2";
}

/** Lățimea unei variante în grilă (contează doar la 5 variante). */
export function optionCellClass(count: number, index: number) {
  if (count !== 5) return undefined;
  if (index < 3) return "lg:col-span-2";
  return index === 4 ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-3";
}

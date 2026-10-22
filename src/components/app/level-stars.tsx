import { cn } from "@/lib/utils";

const LEVEL_LABEL = { 1: "Ușor", 2: "Mediu", 3: "Greu" } as const;

/** Dificultatea unui exercițiu: 1–3 steluțe. */
export function LevelStars({
  level,
  className,
}: {
  level: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 font-bold text-secondary-foreground text-xs",
        className,
      )}
    >
      <span aria-hidden="true">
        {"★".repeat(level)}
        <span className="opacity-30">{"★".repeat(3 - level)}</span>
      </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}

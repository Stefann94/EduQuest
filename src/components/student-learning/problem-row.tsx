import { ChevronRight, Puzzle } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/common/status";
import type { WorkedProblem } from "@/lib/data/types";
import { formatDay } from "@/lib/format";

/** Un rând de problemă rezolvată: titlu, temă, clasă (sau „Resursă globală”) și dificultate. */
export function ProblemRow({
  problem: p,
  showSource = true,
}: {
  problem: Pick<
    WorkedProblem,
    "id" | "title" | "topic" | "difficulty" | "publishedAt"
  > & { className?: string };
  showSource?: boolean;
}) {
  return (
    <Link
      href={`/invatare/probleme/${p.id}`}
      className="group flex items-center gap-4 rounded-lg px-3 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/40"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning"
      >
        <Puzzle className="size-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium group-hover:text-primary">
          {p.title}
        </p>
        <p className="truncate text-muted-foreground text-sm">
          {p.topic}
          {showSource ? ` · ${p.className ?? "Resursă globală"}` : ""} ·{" "}
          {formatDay(p.publishedAt)}
        </p>
      </div>
      <DifficultyBadge level={p.difficulty} />
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

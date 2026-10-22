import type { HomeworkStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const HOMEWORK_STATUS: Record<
  HomeworkStatus,
  { text: string; emoji: string }
> = {
  "de-facut": { text: "De făcut", emoji: "⏰" },
  predata: { text: "Trimisă", emoji: "📨" },
  corectata: { text: "Corectată", emoji: "✅" },
};

export function HomeworkBadge({ status }: { status: HomeworkStatus }) {
  return (
    <span
      className={cn(
        "anim-pop rounded-full px-3 py-1 font-bold text-sm",
        status === "de-facut"
          ? "bg-primary text-primary-foreground"
          : status === "corectata"
            ? "bg-success/15 text-success"
            : "bg-secondary text-secondary-foreground",
      )}
    >
      {HOMEWORK_STATUS[status].text}
    </span>
  );
}

import { cn } from "@/lib/utils";

export function SectionTitle({
  emoji,
  title,
  hint,
  className,
  action,
}: {
  emoji: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 -rotate-6 place-items-center rounded-2xl bg-secondary text-2xl"
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-2xl leading-tight">{title}</h2>
        {hint ? (
          <p className="font-semibold text-muted-foreground text-sm">{hint}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

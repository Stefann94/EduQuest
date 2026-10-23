import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mesaj pentru liste goale: iconiță, titlu, explicație și o acțiune. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-3 font-medium">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-muted-foreground text-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

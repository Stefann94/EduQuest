import { Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info-soft text-foreground [&>svg]:text-info",
  warning: "bg-warning-soft text-foreground [&>svg]:text-warning",
  primary: "bg-primary-soft text-foreground [&>svg]:text-primary",
} as const;

/** O notă discretă în pagină (fără rol de alertă): explicații, reguli, demo. */
export function Callout({
  icon: Icon = Info,
  tone = "neutral",
  className,
  children,
}: {
  icon?: LucideIcon;
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm",
        TONES[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

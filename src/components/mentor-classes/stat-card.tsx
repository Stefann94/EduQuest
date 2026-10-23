import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** O cifră cheie: iconiță, valoare, etichetă și (opțional) un detaliu sau un link. */
export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  href,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  href?: string;
  tone?: "neutral" | "primary" | "info" | "success" | "xp";
}) {
  const tones = {
    neutral: "bg-secondary text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    info: "bg-info-soft text-info",
    success: "bg-success-soft text-success",
    xp: "bg-xp-soft text-xp-foreground",
  } as const;

  const body = (
    <>
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            tones[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
      <p className="mt-3 font-semibold text-2xl tabular-nums tracking-tight">
        {value}
      </p>
      {detail ? (
        <p className="mt-0.5 truncate text-muted-foreground text-sm">
          {detail}
        </p>
      ) : null}
    </>
  );

  const className = "block h-full rounded-xl border bg-card p-5 shadow-xs";
  return href ? (
    <Link
      href={href}
      className={cn(
        className,
        "outline-none transition-[box-shadow,border-color] hover:border-foreground/15 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40",
      )}
    >
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

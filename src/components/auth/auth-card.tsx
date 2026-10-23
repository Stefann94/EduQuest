import { FlaskConical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cardul unei pagini de autentificare: titlu, descriere, conținut și subsol. */
export function AuthCard({
  title,
  description,
  footer,
  className,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border bg-card shadow-xs",
        className,
      )}
    >
      <div className="grid gap-6 p-6 sm:p-8">
        <header className="grid gap-1.5">
          <h1 className="text-balance font-semibold text-2xl tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </header>
        {children}
      </div>
      {footer ? (
        <div className="rounded-b-xl border-t bg-muted/40 px-6 py-4 text-center text-muted-foreground text-sm sm:px-8">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

/** Notă discretă pentru versiunea demo. */
export function DemoNote({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg bg-muted px-3 py-2.5 text-muted-foreground text-xs leading-relaxed",
        className,
      )}
    >
      <FlaskConical className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Ecranul de după o acțiune reușită: iconiță, titlu și explicație. */
export function ResultPanel({
  icon: Icon,
  tone = "success",
  title,
  children,
}: {
  icon: LucideIcon;
  tone?: "success" | "info";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4" aria-live="polite">
      <span
        className={cn(
          "grid size-11 place-items-center rounded-full",
          tone === "success"
            ? "bg-success-soft text-success"
            : "bg-info-soft text-info",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="grid gap-2">
        <h2 className="font-semibold text-lg">{title}</h2>
        <div className="grid gap-2 text-muted-foreground text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Link text în culoarea principală. */
export const linkClass =
  "rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/40";

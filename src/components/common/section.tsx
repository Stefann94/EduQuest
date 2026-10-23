import { cn } from "@/lib/utils";

/**
 * Un bloc de conținut cu titlu (și opțional acțiuni în dreapta).
 * `card` = pe fundal alb, cu chenar; altfel doar titlul deasupra conținutului.
 */
export function Section({
  title,
  description,
  actions,
  card = true,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  card?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(card && "rounded-xl border bg-card shadow-xs", className)}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-2",
          card ? "border-b px-5 py-4" : "mb-3",
        )}
      >
        <div className="min-w-0">
          <h2 className="font-semibold text-base">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className={cn(card && "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

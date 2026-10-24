import { cn } from "@/lib/utils";

/**
 * Un bloc de conținut cu titlu (și opțional acțiuni în dreapta).
 * `card` = pe un panou cu colțuri tăiate; altfel doar titlul deasupra conținutului.
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
    <section className={cn(card && "cut-sm bg-card", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-4 gap-y-2",
          card ? "border-b px-5 py-4" : "mb-4",
        )}
      >
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 font-extrabold text-xl">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rotate-45 bg-primary"
            />
            {title}
          </h2>
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

export function PageHeader({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        aria-hidden="true"
        className="grid size-16 shrink-0 -rotate-6 place-items-center rounded-3xl bg-primary text-4xl shadow-[0_5px_0_0_var(--primary-shadow)]"
      >
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="font-bold text-4xl leading-tight">{title}</h1>
        {description ? (
          <p className="font-semibold text-lg text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="anim-zoom max-sm:w-full">{action}</div> : null}
    </div>
  );
}

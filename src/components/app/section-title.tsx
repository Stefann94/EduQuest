export function SectionTitle({
  emoji,
  title,
  hint,
  action,
}: {
  emoji: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="anim-pop grid size-12 shrink-0 -rotate-6 place-items-center rounded-2xl bg-secondary text-2xl"
      >
        {emoji}
      </span>
      <div className="anim-fade min-w-0 flex-1">
        <h2 className="font-bold text-2xl leading-tight">{title}</h2>
        {hint ? (
          <p className="font-semibold text-muted-foreground text-sm">{hint}</p>
        ) : null}
      </div>
      {action ? <div className="anim-fade shrink-0">{action}</div> : null}
    </div>
  );
}

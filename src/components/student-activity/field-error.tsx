import { CircleAlert } from "lucide-react";

/** Mesajele de eroare sub un câmp (anunțate de cititoarele de ecran). */
export function FieldError({
  id,
  messages,
}: {
  id: string;
  messages?: string[];
}) {
  if (!messages || messages.length === 0) return null;
  return (
    <div id={id} role="alert" className="grid gap-1">
      {messages.map((m) => (
        <p
          key={m}
          className="flex items-start gap-1.5 text-destructive text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {m}
        </p>
      ))}
    </div>
  );
}

/** Nota discretă că în demo nu se salvează nimic. */
export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
      {children}
    </p>
  );
}

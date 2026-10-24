import { FileText, History, Link2 } from "lucide-react";
import type { SubmissionAttempt } from "@/lib/data/types";
import { formatDateTime, formatFileSize } from "@/lib/format";

/** Istoricul trimiterilor unei teme, cea mai nouă prima. */
export function AttemptsTimeline({
  attempts,
}: {
  attempts: SubmissionAttempt[];
}) {
  if (attempts.length === 0)
    return (
      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <History className="size-4" aria-hidden="true" />
        Nu ai trimis încă nicio variantă.
      </p>
    );

  const list = attempts
    .map((a, i) => ({ ...a, n: i + 1 }))
    .sort((x, y) => y.at.localeCompare(x.at));

  return (
    <ol className="stagger relative grid gap-5 border-l pl-5">
      {list.map((a) => (
        <li key={a.at} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-card bg-primary ring-1 ring-border"
          />
          <p className="font-medium text-sm">
            {a.n === 1 ? "Prima trimitere" : `Varianta ${a.n}`}
          </p>
          <p className="text-muted-foreground text-xs">
            {formatDateTime(a.at)}
          </p>
          {a.files.length > 0 ? (
            <ul className="mt-2 grid gap-1">
              {a.files.map((f) => (
                <li key={f.name} className="flex items-center gap-1.5 text-sm">
                  <FileText
                    className="size-3.5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{f.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatFileSize(f.sizeKb)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {a.link ? (
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 flex min-w-0 items-center gap-1.5 text-primary text-sm hover:underline"
            >
              <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{a.link}</span>
            </a>
          ) : null}
          {a.text ? (
            <pre className="mt-2 max-h-28 overflow-hidden rounded-md bg-code px-3 py-2 font-mono text-xs text-code-foreground leading-5">
              {a.text.split("\n").slice(0, 5).join("\n")}
              {a.text.split("\n").length > 5 ? "\n…" : ""}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

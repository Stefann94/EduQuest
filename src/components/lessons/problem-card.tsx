import { ArrowRight, Code2, Files } from "lucide-react";
import Link from "next/link";
import type { ProblemContent } from "@/lib/content/items";

/** Rândul unei probleme în folder: titlu, începutul enunțului și linkul spre pagina ei. */
export function ProblemCard({
  title,
  problem: p,
  href,
}: {
  title: string;
  problem: ProblemContent;
  href: string;
}) {
  // Primul paragraf din enunț, fără marcajele de cod.
  const intro = p.statement.split(/\n{2,}/)[0]?.replace(/`/g, "") ?? "";
  return (
    <article className="group relative flex cut-sm flex-col gap-4 bg-card p-5 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:gap-6">
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 cut-xs place-items-center bg-primary/15 text-primary"
      >
        <Code2 className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wider">
          Problemă rezolvată
        </p>
        <h3 className="text-xl leading-tight">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 focus-visible:underline"
          >
            {title}
          </Link>
        </h3>
        {intro ? (
          <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
            {intro}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm">
        {p.files.length > 1 ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Files className="size-4" aria-hidden="true" />
            {p.files.length} fișiere
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 font-bold font-heading text-primary uppercase tracking-wide group-hover:underline">
          Deschide problema <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

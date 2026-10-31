import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Code2,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { ProblemContent } from "@/lib/content/items";
import { ProblemBody } from "./lesson-item-view";

type Crumb = { href: string; title: string };

/**
 * Pagina unei probleme (elev sau previzualizarea mentorului): calea până la ea, antetul,
 * enunțul cu „încearcă singur”, rezolvarea (dacă se arată) și problema anterioară/următoare.
 */
export function ProblemView({
  itemId,
  title,
  problem: p,
  crumbs,
  folder,
  prev,
  next,
  index,
  count,
  hideSolution,
  editHref,
  preview,
}: {
  itemId: string;
  title: string;
  problem: ProblemContent;
  /** De la rădăcină până la folderul problemei (inclusiv). */
  crumbs: Crumb[];
  folder: Crumb;
  prev?: Crumb;
  next?: Crumb;
  index: number;
  count: number;
  hideSolution?: boolean;
  /** Mentorul: linkul spre editorul materialului. */
  editHref?: string;
  /** Mentorul vede pagina așa cum o vede elevul. */
  preview?: boolean;
}) {
  return (
    <article className="grid gap-8">
      <nav aria-label="Unde ești" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          {crumbs.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 ? (
                <ChevronRight className="size-3.5" aria-hidden="true" />
              ) : null}
              <Link
                href={c.href}
                className="hover:text-foreground hover:underline"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {preview ? (
        <p className="cut-sm bg-info-soft px-4 py-2 text-sm">
          <span className="font-semibold">Previzualizare:</span> așa vede elevul
          problema.
          {hideSolution ? " Rezolvarea nu se afișează aici." : null}
        </p>
      ) : null}

      <header className="flex cut flex-col gap-4 bg-card p-6 sm:flex-row sm:items-center">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 cut-sm place-items-center bg-primary/15 text-primary"
        >
          <Code2 className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-wider">
            Problemă · {folder.title}
          </p>
          <h1 className="text-3xl leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {hideSolution
              ? "Citește enunțul și încearcă singur."
              : `Citește enunțul, încearcă singur, apoi compară cu rezolvarea mentorului${
                  p.files.length > 1
                    ? ` (${p.files.length} fișiere, pe taburi)`
                    : ""
                }.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {count > 1 ? (
            <p className="font-heading text-muted-foreground text-sm tabular-nums">
              {index + 1} / {count}
            </p>
          ) : null}
          {editHref ? (
            <Link
              href={editHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil /> Editează
            </Link>
          ) : null}
        </div>
      </header>

      <ProblemBody itemId={itemId} problem={p} hideSolution={hideSolution} />

      <nav
        aria-label="Alte probleme"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        <Link
          href={prev?.href ?? folder.href}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft /> {prev ? prev.title : `Înapoi la ${folder.title}`}
        </Link>
        {next ? (
          <Link href={next.href} className={buttonVariants()}>
            {next.title} <ArrowRight />
          </Link>
        ) : prev ? (
          <Link
            href={folder.href}
            className={buttonVariants({ variant: "ghost" })}
          >
            Înapoi la {folder.title}
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

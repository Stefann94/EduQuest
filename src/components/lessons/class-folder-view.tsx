import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/common/empty-state";
import { VisibilityBadge } from "@/components/common/status";
import { buttonVariants } from "@/components/ui/button";
import { type getClassFolder, lessonLabel } from "@/lib/db/lessons";
import { FolderList } from "./folder-list";
import { LessonNumber, LessonTitle } from "./lesson-card";
import { LessonItemSection } from "./lesson-item-view";
import { ProblemCard } from "./problem-card";
import { ProblemView } from "./problem-view";

type FolderData = NonNullable<Awaited<ReturnType<typeof getClassFolder>>>;

/**
 * Un folder din materialele unei clase, așa cum îl vede elevul: subfoldere, probleme
 * (fiecare se deschide pe pagina ei) și celelalte materiale. Mentorul vede în plus
 * materialele ascunse și linkul spre editor.
 */
export function ClassFolderView({
  data,
  base,
  editHref,
}: {
  data: FolderData;
  /** /clase/{id}/lectii (elev) sau /mentor/clase/{id}/lectii (mentor). */
  base: string;
  editHref?: string;
}) {
  const { root, lessons, path, folder } = data;
  const problems = folder.items.filter((i) => i.kind === "problem");
  const others = folder.items.filter((i) => i.kind !== "problem");
  const index = lessons.findIndex((l) => l.id === root.id);
  const prev = folder.isRoot ? lessons[index - 1] : undefined;
  const next = folder.isRoot ? lessons[index + 1] : undefined;
  const parent =
    path.at(-1) ??
    (folder.isRoot ? undefined : { id: root.id, title: lessonLabel(root) });

  return (
    <article className="grid gap-8">
      {/* Calea până la folder: Materiale › Lecția 3 › Subfolder */}
      <nav aria-label="Unde ești" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link href={base} className="hover:text-foreground hover:underline">
              Materiale
            </Link>
          </li>
          {!folder.isRoot ? (
            <li className="flex items-center gap-1">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link
                href={`${base}/${root.id}`}
                className="hover:text-foreground hover:underline"
              >
                {lessonLabel(root)}
              </Link>
            </li>
          ) : null}
          {path.map((p) => (
            <li key={p.id} className="flex items-center gap-1">
              <ChevronRight className="size-3.5" aria-hidden="true" />
              <Link
                href={`${base}/${p.id}`}
                className="hover:text-foreground hover:underline"
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <header className="flex flex-wrap items-start gap-4">
        {folder.isRoot ? (
          <LessonNumber lesson={root} className="size-16 text-2xl" />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 cut-sm place-items-center bg-xp-soft text-xp-foreground"
          >
            <FolderOpen className="size-7" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl leading-tight sm:text-4xl">
            {folder.isRoot ? <LessonTitle lesson={root} /> : folder.title}
          </h1>
          {folder.summary ? (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {folder.summary}
            </p>
          ) : null}
        </div>
        {editHref ? (
          <Link
            href={editHref}
            className={buttonVariants({ variant: "outline" })}
          >
            <Pencil /> Editează folderul
          </Link>
        ) : null}
      </header>

      {folder.subfolders.length > 0 ? (
        <section aria-labelledby="subfoldere" className="grid gap-3">
          <h2 id="subfoldere" className="text-xl">
            Foldere
          </h2>
          <FolderList
            folders={folder.subfolders}
            href={(id) => `${base}/${id}`}
          />
        </section>
      ) : null}

      {problems.length > 0 ? (
        <section aria-labelledby="probleme" className="grid gap-3">
          <h2 id="probleme" className="text-xl">
            Probleme rezolvate
          </h2>
          <ul className="grid gap-3">
            {problems.map((item) =>
              item.kind === "problem" ? (
                <li key={item.id} className="grid gap-1">
                  <ProblemCard
                    title={item.title}
                    problem={item.content}
                    href={`${base}/${folder.id}/probleme/${item.id}`}
                  />
                  {item.published ? null : (
                    <span className="justify-self-end">
                      <VisibilityBadge published={false} />
                    </span>
                  )}
                </li>
              ) : null,
            )}
          </ul>
        </section>
      ) : null}

      {others.length > 0 ? (
        <div className="grid gap-10">
          {others.map((item) => (
            <LessonItemSection key={item.id} item={item} />
          ))}
        </div>
      ) : null}

      {folder.items.length === 0 && folder.subfolders.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Folderul e gol deocamdată"
          description={
            editHref
              ? "Adaugă materiale din editorul folderului."
              : "Mentorul adaugă materialele în curând. Revino mai târziu."
          }
        />
      ) : null}

      <nav
        aria-label="Alte lecții"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        {parent ? (
          <Link
            href={`${base}/${parent.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> Înapoi la {parent.title}
          </Link>
        ) : prev ? (
          <Link
            href={`${base}/${prev.id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ArrowLeft /> {lessonLabel(prev)}
          </Link>
        ) : (
          <Link href={base} className={buttonVariants({ variant: "ghost" })}>
            <ArrowLeft /> Toate materialele
          </Link>
        )}
        {next ? (
          <Link href={`${base}/${next.id}`} className={buttonVariants()}>
            {lessonLabel(next)} <ArrowRight />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}

/** Pagina unei probleme dintr-un folder al clasei. Undefined dacă nu există. */
export function ClassProblemView({
  data,
  problemId,
  base,
  editHref,
}: {
  data: FolderData;
  problemId: string;
  base: string;
  editHref?: string;
}) {
  const { root, path, folder } = data;
  const problems = folder.items.filter((i) => i.kind === "problem");
  const index = problems.findIndex((i) => i.id === problemId);
  const item = problems[index];
  if (!item || item.kind !== "problem") return null;
  const folderHref = `${base}/${folder.id}`;
  const folderTitle = folder.isRoot ? lessonLabel(root) : folder.title;
  const href = (id: string) => `${folderHref}/probleme/${id}`;
  const prev = problems[index - 1];
  const next = problems[index + 1];
  return (
    <ProblemView
      itemId={item.id}
      title={item.title}
      problem={item.content}
      crumbs={[
        { href: base, title: "Materiale" },
        ...(folder.isRoot
          ? []
          : [{ href: `${base}/${root.id}`, title: lessonLabel(root) }]),
        ...path
          .filter((p) => p.id !== root.id && p.id !== folder.id)
          .map((p) => ({ href: `${base}/${p.id}`, title: p.title })),
        { href: folderHref, title: folderTitle },
      ]}
      folder={{ href: folderHref, title: folderTitle }}
      prev={prev ? { href: href(prev.id), title: prev.title } : undefined}
      next={next ? { href: href(next.id), title: next.title } : undefined}
      index={index}
      count={problems.length}
      editHref={editHref}
      preview={!!editHref}
    />
  );
}

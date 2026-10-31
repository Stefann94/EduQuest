import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { VisibilityBadge } from "@/components/common/status";
import { folderEntries } from "@/lib/content/folder-order";
import type {
  ClassLesson,
  LessonItemView,
  SubfolderSummary,
} from "@/lib/db/lessons";
import { cn } from "@/lib/utils";
import { MaterialsMenu, type MenuItem } from "./materials-menu";

/**
 * Ce apare în meniul unei lecții: subfolderele și materialele, în ordinea aleasă de mentor.
 * Linkurile se deschid direct, PDF-urile și restul în pagina folderului.
 */
export function menuItems(
  items: LessonItemView[],
  lessonHref: string,
  subfolders: SubfolderSummary[] = [],
  folderHref: (id: string) => string = (id) =>
    `${lessonHref.split("/").slice(0, -1).join("/")}/${id}`,
  /** Pagina proprie a unei probleme (la elev); altfel ancora din pagina folderului. */
  problemHref?: (id: string) => string,
): MenuItem[] {
  return folderEntries(subfolders, items).map((e): MenuItem => {
    if (e.type === "folder")
      return {
        id: e.id,
        kind: "folder",
        title: e.folder.title,
        href: folderHref(e.id),
      };
    const i = e.item;
    const base = {
      id: i.id,
      kind: i.kind,
      title: i.title,
      hidden: !i.published,
    };
    if (i.kind === "link" || i.kind === "video")
      return { ...base, href: i.content.url, external: true };
    if (i.kind === "problem" && problemHref)
      return { ...base, href: problemHref(i.id) };
    return { ...base, href: `${lessonHref}#m-${i.id}` };
  });
}

/** Numărul lecției într-un hexagon (sau „•” dacă mentorul arată doar titlul). */
export function LessonNumber({
  lesson: l,
  className,
}: {
  lesson: ClassLesson;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 hex place-items-center bg-primary font-extrabold font-heading text-primary-foreground text-xl tabular-nums",
        className,
      )}
    >
      {l.display === "title" ? "•" : l.number}
    </span>
  );
}

/** Titlul lecției, după cum a ales mentorul să fie afișată în clasă. */
export function LessonTitle({ lesson: l }: { lesson: ClassLesson }) {
  if (l.display === "number") return <>Lecția {l.number}</>;
  if (l.display === "title") return <>{l.title}</>;
  return (
    <>
      <span className="text-muted-foreground">Lecția {l.number} · </span>
      {l.title}
    </>
  );
}

/** Cardul unei lecții din clasă: număr, titlu, rezumat și meniul cu materiale. */
export function LessonCard({
  lesson: l,
  href,
  showVisibility,
  problemPages,
}: {
  lesson: ClassLesson;
  href: string;
  showVisibility?: boolean;
  /** Problemele se deschid pe pagina lor (`{href}/probleme/{id}`). */
  problemPages?: boolean;
}) {
  return (
    <article className="flex cut flex-col gap-4 bg-card p-5 md:flex-row md:items-center md:gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <LessonNumber lesson={l} />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl leading-tight">
            <Link
              href={href}
              className="outline-none hover:text-primary focus-visible:underline"
            >
              <LessonTitle lesson={l} />
            </Link>
          </h3>
          {l.summary ? (
            <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
              {l.summary}
            </p>
          ) : null}
        </div>
        {showVisibility ? <VisibilityBadge published={l.published} /> : null}
      </div>
      <div className="grid gap-3 md:w-80 md:shrink-0">
        <MaterialsMenu
          items={menuItems(
            l.items,
            href,
            l.subfolders,
            undefined,
            problemPages ? (id) => `${href}/probleme/${id}` : undefined,
          )}
        />
        <Link
          href={href}
          className="inline-flex items-center gap-1 justify-self-start font-bold font-heading text-primary text-sm uppercase tracking-wide hover:underline"
        >
          Deschide folderul <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

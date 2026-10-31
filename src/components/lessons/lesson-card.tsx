import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { VisibilityBadge } from "@/components/common/status";
import type {
  ClassLesson,
  LessonItemView,
  SubfolderSummary,
} from "@/lib/db/lessons";
import { cn } from "@/lib/utils";
import { MaterialsMenu, type MenuItem } from "./materials-menu";

/**
 * Ce apare în meniul unei lecții: întâi subfolderele, apoi materialele. PDF-ul și linkurile
 * se deschid direct, restul duce la pagina folderului.
 */
export function menuItems(
  items: LessonItemView[],
  lessonHref: string,
  subfolders: SubfolderSummary[] = [],
  folderHref: (id: string) => string = (id) =>
    `${lessonHref.split("/").slice(0, -1).join("/")}/${id}`,
): MenuItem[] {
  const folders: MenuItem[] = subfolders.map((f) => ({
    id: f.id,
    kind: "folder",
    title: f.title,
    href: folderHref(f.id),
  }));
  return [
    ...folders,
    ...items.map((i): MenuItem => {
      const base = {
        id: i.id,
        kind: i.kind,
        title: i.title,
        hidden: !i.published,
      };
      if (i.kind === "pdf" && i.fileUrl)
        return { ...base, href: i.fileUrl, external: true };
      if (i.kind === "link" || i.kind === "video")
        return { ...base, href: i.content.url, external: true };
      return { ...base, href: `${lessonHref}#m-${i.id}` };
    }),
  ];
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
}: {
  lesson: ClassLesson;
  href: string;
  showVisibility?: boolean;
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
        <MaterialsMenu items={menuItems(l.items, href, l.subfolders)} />
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

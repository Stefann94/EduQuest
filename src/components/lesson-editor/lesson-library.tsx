"use client";

import {
  BookOpen,
  ChevronRight,
  FileCode2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { VisibilityBadge } from "@/components/common/status";
import {
  MATERIAL_KIND,
  MaterialKindIcon,
} from "@/components/learning/material-kind";
import {
  MaterialsMenu,
  type MenuItem,
} from "@/components/lessons/materials-menu";
import { FilterSelect } from "@/components/mentor-content/filter-select";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ItemKind } from "@/lib/content/items";
import { cn } from "@/lib/utils";

export type LibraryEntry = {
  id: string;
  /** null = folder de pe primul nivel; altfel subfolder (apare doar în folderul lui). */
  parentId: string | null;
  /** „Capitol › Subfolder”, pentru problemele din subfoldere. */
  path: string;
  title: string;
  summary: string;
  items: { id: string; kind: ItemKind; title: string; published: boolean }[];
  classes: {
    classId: string;
    className: string;
    number: number;
    published: boolean;
  }[];
};

export type LibraryClass = {
  id: string;
  name: string;
  lessons: {
    id: string;
    number: number;
    label: string;
    published: boolean;
    items: number;
  }[];
};

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Etichetele unei lecții: în ce clase apare și cu ce număr. */
function ClassTags({ classes }: { classes: LibraryEntry["classes"] }) {
  if (classes.length === 0)
    return (
      <span className="slant bg-secondary px-2.5 py-0.5 text-muted-foreground text-xs">
        în nicio clasă
      </span>
    );
  return (
    <>
      {classes.map((c) => (
        <span
          key={c.classId}
          className={cn(
            "slant px-2.5 py-0.5 font-bold font-heading text-xs uppercase tracking-wide",
            c.published
              ? "bg-primary-soft text-accent-foreground"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {c.className} · L{c.number}
          {c.published ? "" : " (ascunsă)"}
        </span>
      ))}
    </>
  );
}

/**
 * Biblioteca mentorului: Materiale (toate lecțiile cu materialele lor), Probleme (toate
 * problemele, cu lecția și clasele lor) și Clase (lecțiile fiecărei clase, în ordine).
 */
export function LessonLibrary({
  lessons,
  classes,
}: {
  lessons: LibraryEntry[];
  classes: LibraryClass[];
}) {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("all");
  const q = normalize(query.trim());

  const matchClass = (l: LibraryEntry) =>
    cls === "all" || l.classes.some((c) => c.classId === cls);
  const shown = lessons.filter(
    (l) =>
      l.parentId === null &&
      matchClass(l) &&
      (!q ||
        normalize(
          `${l.title} ${l.summary} ${l.items.map((i) => i.title).join(" ")}`,
        ).includes(q)),
  );
  const problems = lessons
    .filter(matchClass)
    .flatMap((l) =>
      l.items
        .filter((i) => i.kind === "problem")
        .map((p) => ({ ...p, lesson: l })),
    )
    .filter((p) => !q || normalize(`${p.title} ${p.lesson.title}`).includes(q));
  const classList = classes.filter((c) => cls === "all" || c.id === cls);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută o lecție sau un material"
            aria-label="Caută în bibliotecă"
            className="pl-9"
          />
        </div>
        <FilterSelect
          label="Clasa"
          value={cls}
          onChange={setCls}
          items={[
            { value: "all", label: "Toate clasele" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </div>

      <Tabs defaultValue="materials">
        <TabsList>
          <TabsTrigger value="materials">
            Materiale ({shown.length})
          </TabsTrigger>
          <TabsTrigger value="problems">
            Probleme ({problems.length})
          </TabsTrigger>
          <TabsTrigger value="classes">Clase ({classList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-4">
          {shown.length > 0 ? (
            <ul className="grid gap-3">
              {shown.map((l) => {
                const href = `/mentor/materiale/${l.id}`;
                const menu: MenuItem[] = [
                  ...lessons
                    .filter((x) => x.parentId === l.id)
                    .map((f) => ({
                      id: f.id,
                      kind: "folder" as const,
                      title: f.title,
                      href: `/mentor/materiale/${f.id}`,
                    })),
                  ...l.items.map((i) => ({
                    id: i.id,
                    kind: i.kind,
                    title: i.title,
                    href,
                    hidden: !i.published,
                  })),
                ];
                return (
                  <li key={l.id}>
                    <article className="flex cut flex-col gap-4 bg-card p-5 md:flex-row md:items-center md:gap-6">
                      <div className="grid min-w-0 flex-1 gap-2">
                        <h3 className="text-xl leading-tight">
                          <Link
                            href={href}
                            className="outline-none hover:text-primary focus-visible:underline"
                          >
                            {l.title}
                          </Link>
                        </h3>
                        {l.summary ? (
                          <p className="line-clamp-2 text-muted-foreground text-sm">
                            {l.summary}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-1.5">
                          <ClassTags classes={l.classes} />
                        </div>
                      </div>
                      <div className="grid gap-3 md:w-80 md:shrink-0">
                        <MaterialsMenu items={menu} />
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 justify-self-start font-bold font-heading text-primary text-sm uppercase tracking-wide hover:underline"
                        >
                          Deschide folderul{" "}
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={BookOpen}
              title={lessons.length === 0 ? "Nicio lecție încă" : "Nimic găsit"}
              description={
                lessons.length === 0
                  ? "Creează prima lecție: îi adaugi apoi materiale și o pui în una sau mai multe clase."
                  : "Încearcă alt cuvânt sau altă clasă."
              }
              action={
                lessons.length === 0 ? (
                  <Link
                    href="/mentor/materiale/nou"
                    className={buttonVariants()}
                  >
                    <Plus /> Lecție nouă
                  </Link>
                ) : undefined
              }
            />
          )}
        </TabsContent>

        <TabsContent value="problems" className="mt-4">
          {problems.length > 0 ? (
            <ul className="grid gap-2">
              {problems.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/mentor/materiale/${p.lesson.id}`}
                    className="group flex cut-sm flex-wrap items-center gap-3 bg-card px-4 py-3 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                  >
                    <MaterialKindIcon kind="problem" />
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="truncate text-muted-foreground text-sm">
                        Folder: {p.lesson.path}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <ClassTags classes={p.lesson.classes} />
                    </div>
                    <VisibilityBadge published={p.published} />
                    <ChevronRight
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={FileCode2}
              title="Nicio problemă"
              description={`Adaugă o problemă într-o lecție (tipul „${MATERIAL_KIND.problem.label}”): elevii o încearcă singuri, apoi văd rezolvarea.`}
            />
          )}
        </TabsContent>

        <TabsContent value="classes" className="mt-4">
          {classList.length > 0 ? (
            <ul className="grid gap-4">
              {classList.map((c) => (
                <li
                  key={c.id}
                  className="grid content-start cut gap-3 bg-card p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl">{c.name}</h3>
                    <Link
                      href={`/mentor/materiale/nou?clasa=${c.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <Plus /> Lecție
                    </Link>
                  </div>
                  {c.lessons.length > 0 ? (
                    <ol className="grid gap-1">
                      {c.lessons.map((l) => (
                        <li key={l.id}>
                          <Link
                            href={`/mentor/materiale/${l.id}`}
                            className="flex items-center gap-3 px-2 py-1.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/70"
                          >
                            <span
                              aria-hidden="true"
                              className="grid size-8 shrink-0 hex place-items-center bg-primary font-bold font-heading text-primary-foreground text-sm"
                            >
                              {l.number}
                            </span>
                            <span className="min-w-0 flex-1 truncate">
                              {l.label}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {l.items} mat.
                            </span>
                            <VisibilityBadge published={l.published} />
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Clasa nu are încă lecții.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="Nicio clasă"
              description="Creează o clasă ca să-i pui lecții."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

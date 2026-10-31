"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronRight,
  FileCode2,
  GripVertical,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { moveLesson, reorderLessons } from "@/app/mentor/materiale/actions";
import { dragged, endDrag, reorder, startDrag } from "@/components/common/drag";
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
import { Button, buttonVariants } from "@/components/ui/button";
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

  // „Fără clasă”: lecțiile care nu sunt încă în nicio clasă.
  const matchClass = (l: LibraryEntry) =>
    cls === "all" ||
    (cls === "none"
      ? l.classes.length === 0
      : l.classes.some((c) => c.classId === cls));
  const chosenClass = classes.find((c) => c.id === cls);
  // Ordinea aleasă prin drag and drop, afișată imediat (până vine lista nouă de la server).
  const [optimistic, setOptimistic] = useState<string[] | null>(null);
  const unsorted = lessons.filter(
    (l) =>
      l.parentId === null &&
      matchClass(l) &&
      (!q ||
        normalize(
          `${l.title} ${l.summary} ${l.items.map((i) => i.title).join(" ")}`,
        ).includes(q)),
  );
  const shown = optimistic
    ? [...unsorted].sort(
        (a, b) => optimistic.indexOf(a.id) - optimistic.indexOf(b.id),
      )
    : unsorted;
  const problems = lessons
    .filter(matchClass)
    .flatMap((l) =>
      l.items
        .filter((i) => i.kind === "problem")
        .map((p) => ({ ...p, lesson: l })),
    )
    .filter((p) => !q || normalize(`${p.title} ${p.lesson.title}`).includes(q));
  const classList = classes.filter(
    (c) => cls === "all" || cls === "none" || c.id === cls,
  );
  // Ordinea se schimbă doar pe lista întreagă (fără căutare sau filtru de clasă).
  const canReorder = !q && cls === "all";
  const [pending, startMove] = useTransition();
  const router = useRouter();
  const move = (id: string, by: -1 | 1) =>
    startMove(async () => {
      const res = await moveLesson(id, by);
      if (!res.ok) toast.error(res.message);
    });
  // Drag and drop: o lecție trasă peste alta îi ia locul (doar pe lista întreagă).
  const [over, setOver] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragProps = (id: string) =>
    canReorder && shown.length > 1
      ? {
          draggable: true,
          onDragStart: (ev: React.DragEvent) => {
            startDrag(ev, { kind: "lesson", id, from: "library" });
            setDraggingId(id);
          },
          onDragEnd: () => {
            endDrag();
            setOver(null);
            setDraggingId(null);
          },
          onDragOver: (ev: React.DragEvent) => {
            if (dragged()?.kind !== "lesson") return;
            ev.preventDefault();
            setOver(id);
          },
          onDragLeave: () => setOver((o) => (o === id ? null : o)),
          onDrop: (ev: React.DragEvent) => {
            ev.preventDefault();
            const p = dragged();
            endDrag();
            setOver(null);
            setDraggingId(null);
            if (p?.kind !== "lesson") return;
            const next = reorder(
              shown.map((l) => l.id),
              p.id,
              id,
            );
            if (next) {
              setOptimistic(next);
              startMove(async () => {
                const res = await reorderLessons(next);
                if (!res.ok) toast.error(res.message);
                router.refresh();
                setOptimistic(null);
              });
            }
          },
          className: cn(
            "transition-opacity",
            draggingId === id && "opacity-40",
            over === id &&
              draggingId !== id &&
              "rounded-sm ring-2 ring-primary ring-offset-2",
          ),
        }
      : {};

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
      </div>

      {/* Biblioteca pe clase: alegi clasa și vezi doar lecțiile ei (sau le adaugi direct acolo). */}
      <div className="flex flex-wrap items-center gap-2">
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">Clasa</legend>
          {[
            { value: "all", label: "Toate" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
            { value: "none", label: "Fără clasă" },
          ].map((o) => (
            <label
              key={o.value}
              className={cn(
                "slant cursor-pointer px-3 py-1.5 font-bold font-heading text-sm uppercase tracking-wide transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                cls === o.value
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="library-class"
                value={o.value}
                checked={cls === o.value}
                onChange={() => setCls(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </fieldset>
        {chosenClass ? (
          <Link
            href={`/mentor/materiale/nou?clasa=${chosenClass.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "ml-auto",
            })}
          >
            <Plus aria-hidden="true" /> Lecție nouă în {chosenClass.name}
          </Link>
        ) : null}
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
              {shown.map((l, index) => {
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
                  <li key={l.id} {...dragProps(l.id)}>
                    <article className="flex cut flex-col gap-4 bg-card p-5 md:flex-row md:items-center md:gap-6">
                      {canReorder && shown.length > 1 ? (
                        <div className="flex gap-1 md:flex-col">
                          <span
                            aria-hidden="true"
                            title="Trage ca să muți"
                            className="hidden size-8 cursor-grab place-items-center text-muted-foreground active:cursor-grabbing md:grid"
                          >
                            <GripVertical className="size-4" />
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={pending || index === 0}
                            onClick={() => move(l.id, -1)}
                            aria-label={`Mută mai sus: ${l.title}`}
                          >
                            <ArrowUp aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={pending || index === shown.length - 1}
                            onClick={() => move(l.id, 1)}
                            aria-label={`Mută mai jos: ${l.title}`}
                          >
                            <ArrowDown aria-hidden="true" />
                          </Button>
                        </div>
                      ) : null}
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
                      <div className="grid gap-3 md:w-96 md:shrink-0">
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

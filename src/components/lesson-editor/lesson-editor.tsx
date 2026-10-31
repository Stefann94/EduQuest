"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addToClasses,
  deleteLesson,
  removeFromClass,
  savePlacement,
  updateLessonDetails,
} from "@/app/mentor/materiale/actions";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
import { Field, SelectField } from "@/components/mentor-content/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  EditorLesson,
  LessonDisplay,
  LibraryLesson,
} from "@/lib/db/lessons";
import { FolderContentEditor } from "./folder-content-editor";

const DISPLAY: { value: LessonDisplay; label: string }[] = [
  { value: "both", label: "Număr și titlu („Lecția 3: Bucle”)" },
  { value: "number", label: "Doar numărul („Lecția 3”)" },
  { value: "title", label: "Doar titlul („Bucle”)" },
];

export function LessonEditor({
  lesson,
  classes,
}: {
  lesson: EditorLesson;
  classes: { id: string; name: string; archived: boolean }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; message: string }>) {
    startTransition(async () => {
      const r = await task();
      if (!r.ok) toast.error(r.message);
      else if (r.message) toast.success(r.message);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="grid min-w-0 gap-6">
        <DetailsForm lesson={lesson} />

        <section aria-labelledby="continut" className="grid gap-3">
          <div>
            <h2 id="continut" className="text-2xl">
              Conținutul folderului
            </h2>
            <p className="text-muted-foreground text-sm">
              Subfoldere, PDF-uri, probleme rezolvate, linkuri, video: toate
              într-o singură listă, în ordinea în care le văd elevii. Le muți cu
              săgețile; subfolderele se completează direct aici.
            </p>
          </div>
          <FolderContentEditor
            node={{
              id: lesson.id,
              title: lesson.title,
              summary: lesson.summary,
              position: lesson.position,
              items: lesson.items,
              children: lesson.children,
            }}
            level={lesson.path.length}
          />
        </section>
      </div>

      <aside className="grid gap-6 lg:sticky lg:top-20">
        {lesson.parentId ? (
          <section className="grid gap-2 cut bg-card p-5 text-sm">
            <h2 className="text-xl">În clase</h2>
            <p className="text-muted-foreground">
              E un subfolder: îl văd elevii claselor în care e pus folderul de
              pe primul nivel ({lesson.path[0]?.title}), dacă acolo e vizibil.
            </p>
          </section>
        ) : (
          <Placements
            lesson={lesson}
            classes={classes}
            run={run}
            pending={pending}
          />
        )}
        <section className="grid gap-3 cut bg-card p-5">
          <h2 className="text-xl">Ștergerea folderului</h2>
          <p className="text-muted-foreground text-sm">
            Folderul, subfolderele și toate materialele lor dispar
            {lesson.parentId ? "." : " din toate clasele."}
          </p>
          <ConfirmDialog
            title="Ștergi folderul?"
            description={`„${lesson.title}”, cu ${lesson.items.length} materiale și ${lesson.subfolders.length} subfoldere, dispare definitiv.`}
            confirmLabel="Șterge folderul"
            onConfirm={() => run(() => deleteLesson(lesson.id))}
            trigger={
              <Button variant="outline" className="w-fit text-destructive">
                <Trash2 /> Șterge folderul
              </Button>
            }
          />
        </section>
      </aside>
    </div>
  );
}

function DetailsForm({ lesson }: { lesson: LibraryLesson }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [summary, setSummary] = useState(lesson.summary);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const dirty = title !== lesson.title || summary !== lesson.summary;

  return (
    <form
      className="grid cut gap-4 bg-card p-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await updateLessonDetails(lesson.id, { title, summary });
          setErrors(r.ok ? {} : (r.errors ?? {}));
          if (r.ok) toast.success(r.message);
          else toast.error(r.message);
          router.refresh();
        });
      }}
    >
      <Field id="lesson-title" label="Numele folderului" error={errors.title}>
        <Input
          id="lesson-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          aria-invalid={errors.title ? true : undefined}
        />
      </Field>
      <Field
        id="lesson-summary"
        label="Rezumat"
        optional
        error={errors.summary}
        hint="Apare pe cardul folderului."
      >
        <Textarea
          id="lesson-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={300}
          className="min-h-16"
        />
      </Field>
      <Button type="submit" className="w-fit" disabled={!dirty || pending}>
        {pending ? "Se salvează…" : "Salvează"}
      </Button>
    </form>
  );
}

function Placements({
  lesson,
  classes,
  run,
  pending,
}: {
  lesson: LibraryLesson;
  classes: { id: string; name: string; archived: boolean }[];
  run: (task: () => Promise<{ ok: boolean; message: string }>) => void;
  pending: boolean;
}) {
  const placed = new Map(lesson.classes.map((p) => [p.classId, p]));
  const free = classes.filter((c) => !placed.has(c.id) && !c.archived);
  const [pick, setPick] = useState<string[]>([]);
  const [display, setDisplay] = useState<LessonDisplay>("both");

  return (
    <section
      aria-labelledby="clase-lectie"
      className="grid gap-4 cut bg-card p-5"
    >
      <div>
        <h2 id="clase-lectie" className="text-xl">
          În clase
        </h2>
        <p className="text-muted-foreground text-sm">
          O lecție poate fi în mai multe clase, cu numere diferite.
        </p>
      </div>

      {lesson.classes.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Lecția nu e încă în nicio clasă.
        </p>
      ) : (
        <ul className="grid gap-3">
          {lesson.classes.map((p) => (
            <PlacementRow
              key={p.classId}
              lessonId={lesson.id}
              placement={p}
              className={
                classes.find((c) => c.id === p.classId)?.name ?? "Clasă"
              }
              run={run}
              pending={pending}
            />
          ))}
        </ul>
      )}

      {free.length > 0 ? (
        <fieldset className="grid gap-2 border-t pt-4">
          <legend className="mb-2 font-bold font-heading text-sm uppercase tracking-wide">
            Adaugă în clase
          </legend>
          {free.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={pick.includes(c.id)}
                onChange={(e) =>
                  setPick(
                    e.target.checked
                      ? [...pick, c.id]
                      : pick.filter((x) => x !== c.id),
                  )
                }
              />
              {c.name}
            </label>
          ))}
          <SelectField
            id="new-display"
            name="new-display"
            ariaLabel="Cum apare lecția"
            value={display}
            onValueChange={(v) => setDisplay(v as LessonDisplay)}
            items={DISPLAY}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={pick.length === 0 || pending}
            onClick={() => {
              run(() => addToClasses(lesson.id, pick, display));
              setPick([]);
            }}
          >
            <Plus /> Adaugă la final
          </Button>
        </fieldset>
      ) : null}
    </section>
  );
}

function PlacementRow({
  lessonId,
  placement: p,
  className,
  run,
  pending,
}: {
  lessonId: string;
  placement: LibraryLesson["classes"][number];
  className: string;
  run: (task: () => Promise<{ ok: boolean; message: string }>) => void;
  pending: boolean;
}) {
  const [number, setNumber] = useState(String(p.number));
  const save = (
    patch: Partial<{
      number: number;
      display: LessonDisplay;
      published: boolean;
    }>,
  ) =>
    run(() =>
      savePlacement(lessonId, {
        classId: p.classId,
        number: Number(number),
        display: p.display,
        published: p.published,
        ...patch,
      }),
    );

  return (
    <li className="grid gap-2 bg-muted/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{className}</p>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          disabled={pending}
          onClick={() => run(() => removeFromClass(lessonId, p.classId))}
        >
          Scoate
        </Button>
      </div>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-end gap-2">
        <Field id={`n-${p.classId}`} label="Nr.">
          <Input
            id={`n-${p.classId}`}
            type="number"
            min={1}
            max={999}
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onBlur={() => {
              if (Number(number) !== p.number) save({ number: Number(number) });
            }}
          />
        </Field>
        <SelectField
          id={`d-${p.classId}`}
          name={`d-${p.classId}`}
          ariaLabel={`Cum apare lecția în ${className}`}
          value={p.display}
          onValueChange={(v) => save({ display: v as LessonDisplay })}
          items={DISPLAY}
          className="min-w-0 *:data-[slot=select-value]:truncate"
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Switch
          id={`pub-${p.classId}`}
          checked={p.published}
          disabled={pending}
          onCheckedChange={(v) => save({ published: v })}
        />
        <label htmlFor={`pub-${p.classId}`}>
          {p.published ? "Elevii clasei o văd" : "Ascunsă elevilor clasei"}
        </label>
      </div>
    </li>
  );
}

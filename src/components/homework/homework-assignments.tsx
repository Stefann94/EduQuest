"use client";

import { Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  assignHomework,
  unassignHomework,
  updateDeadline,
} from "@/app/mentor/teme/actions";
import { ConfirmDialog } from "@/components/mentor-content/confirm-dialog";
import { Field } from "@/components/mentor-content/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AssignmentView = {
  id: string;
  classId: string;
  className: string;
  /** „AAAA-LL-ZZTHH:MM”, ora României (pentru inputul datetime-local). */
  deadlineLocal: string;
  students: number;
  complete: number;
  waiting: number;
};

/** Clasele care au primit tema, fiecare cu termenul ei, și darea temei altor clase. */
export function HomeworkAssignments({
  homeworkId,
  assignments,
  classes,
  defaultDeadline,
}: {
  homeworkId: string;
  assignments: AssignmentView[];
  classes: { id: string; name: string }[];
  defaultDeadline: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const given = new Set(assignments.map((a) => a.classId));
  const free = classes.filter((c) => !given.has(c.id));
  const [pick, setPick] = useState<string[]>([]);
  const [deadline, setDeadline] = useState(defaultDeadline);

  function run(
    task: () => Promise<{ ok: boolean; message: string }>,
    after?: () => void,
  ) {
    startTransition(async () => {
      const r = await task();
      if (r.ok) {
        toast.success(r.message);
        after?.();
      } else toast.error(r.message);
      router.refresh();
    });
  }

  return (
    <section
      aria-labelledby="clase-tema"
      className="grid cut gap-4 bg-card p-5"
    >
      <div>
        <h2 id="clase-tema" className="text-xl">
          Clasele care au primit tema
        </h2>
        <p className="text-muted-foreground text-sm">
          Fiecare clasă are termenul ei. După termen, elevii pot trimite în
          continuare, dar nu mai primesc +2 XP.
        </p>
      </div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Tema nu e dată încă niciunei clase.
        </p>
      ) : (
        <ul className="grid gap-2">
          {assignments.map((a) => (
            <AssignmentRow key={a.id} a={a} run={run} pending={pending} />
          ))}
        </ul>
      )}

      {free.length > 0 ? (
        <fieldset className="grid gap-3 border-t pt-4">
          <legend className="mb-2 font-bold font-heading text-sm uppercase tracking-wide">
            Dă tema mai multor clase
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {free.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 bg-muted/50 px-3 py-2 text-sm has-checked:bg-primary-soft"
              >
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
          </div>
          <Field
            id="new-deadline"
            label="Termen"
            optional
            hint="Gol = fără termen."
          >
            <Input
              id="new-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-fit"
            />
          </Field>
          <Button
            variant="cta"
            className="w-fit"
            disabled={pick.length === 0 || pending}
            onClick={() =>
              run(
                () => assignHomework(homeworkId, pick, deadline),
                () => setPick([]),
              )
            }
          >
            <Send /> Dă tema{" "}
            {pick.length > 1 ? `celor ${pick.length} clase` : "clasei"}
          </Button>
        </fieldset>
      ) : null}
    </section>
  );
}

function AssignmentRow({
  a,
  run,
  pending,
}: {
  a: AssignmentView;
  run: (task: () => Promise<{ ok: boolean; message: string }>) => void;
  pending: boolean;
}) {
  const [deadline, setDeadline] = useState(a.deadlineLocal);
  return (
    <li className="flex flex-wrap items-end gap-3 bg-muted/50 p-3">
      <div className="min-w-0 flex-1 basis-40">
        <p className="font-medium">{a.className}</p>
        <p className="text-muted-foreground text-sm tabular-nums">
          {a.complete} din {a.students} au trimis tot
          {a.waiting > 0 ? ` · ${a.waiting} de evaluat` : ""}
        </p>
      </div>
      <Field id={`dl-${a.id}`} label="Termen">
        <Input
          id={`dl-${a.id}`}
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-fit"
        />
      </Field>
      <Button
        variant="outline"
        size="sm"
        disabled={pending || deadline === a.deadlineLocal}
        onClick={() => run(() => updateDeadline(a.id, deadline))}
      >
        Salvează termenul
      </Button>
      <ConfirmDialog
        title="Retragi tema din clasă?"
        description={`Elevii din ${a.className} nu o mai văd. Se poate doar dacă nimeni n-a trimis nimic.`}
        confirmLabel="Retrage"
        onConfirm={() => run(() => unassignHomework(a.id))}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Retrage tema din ${a.className}`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        }
      />
    </li>
  );
}

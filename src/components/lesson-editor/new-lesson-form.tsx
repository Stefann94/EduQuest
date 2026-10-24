"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createLesson } from "@/app/mentor/materiale/actions";
import {
  ChoiceGroup,
  Field,
  FieldSet,
} from "@/components/mentor-content/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** O lecție nouă: titlu, rezumat și (opțional) clasele în care apare de la început. */
export function NewLessonForm({
  classes,
  preselected,
}: {
  classes: { id: string; name: string; nextNumber: number }[];
  preselected?: string;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [picked, setPicked] = useState<string[]>(
    preselected ? [preselected] : [],
  );
  const [display, setDisplay] = useState<"both" | "number" | "title">("both");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="grid max-w-2xl cut gap-5 bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          // La reușită, acțiunea duce direct în editorul lecției.
          const r = await createLesson({
            title,
            summary,
            classIds: picked,
            display,
          });
          if (!r.ok) {
            setErrors(r.errors ?? {});
            toast.error(r.message);
          }
        });
      }}
    >
      <Field id="title" label="Titlul lecției" error={errors.title}>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex. Bucla for"
          maxLength={120}
          aria-invalid={errors.title ? true : undefined}
          autoFocus
        />
      </Field>
      <Field
        id="summary"
        label="Rezumat"
        optional
        error={errors.summary}
        hint="O frază despre ce învață elevii."
      >
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          maxLength={300}
          className="min-h-16"
        />
      </Field>

      {classes.length > 0 ? (
        <FieldSet
          legend="În ce clase apare"
          hint="Lecția intră la finalul fiecărei clase alese, ascunsă elevilor până o faci vizibilă."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {classes.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 bg-muted/50 px-3 py-2 text-sm has-checked:bg-primary-soft"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={picked.includes(c.id)}
                  onChange={(e) =>
                    setPicked(
                      e.target.checked
                        ? [...picked, c.id]
                        : picked.filter((x) => x !== c.id),
                    )
                  }
                />
                <span className="min-w-0 flex-1 truncate">{c.name}</span>
                <span className="text-muted-foreground text-xs">
                  Lecția {c.nextNumber}
                </span>
              </label>
            ))}
          </div>
        </FieldSet>
      ) : null}

      {picked.length > 0 ? (
        <FieldSet legend="Cum apare în clasă">
          <ChoiceGroup
            name="display"
            value={display}
            onChange={setDisplay}
            className="sm:grid-flow-row"
            choices={[
              {
                value: "both",
                label: "Număr și titlu",
                description: "„Lecția 3: Bucla for”",
              },
              {
                value: "number",
                label: "Doar numărul",
                description: "„Lecția 3”",
              },
              {
                value: "title",
                label: "Doar titlul",
                description: "„Bucla for”",
              },
            ]}
          />
        </FieldSet>
      ) : null}

      <Button
        type="submit"
        variant="cta"
        size="lg"
        className="w-fit"
        disabled={pending}
      >
        {pending ? "Se creează…" : "Creează lecția și adaugă materiale"}
      </Button>
    </form>
  );
}

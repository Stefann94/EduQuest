"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { type HomeworkInput, saveHomework } from "@/app/mentor/teme/actions";
import {
  ChoiceGroup,
  Field,
  FieldError,
  FieldSet,
  SelectField,
} from "@/components/mentor-content/field";
import { CODE_LANGUAGES } from "@/components/mentor-content/form-state";
import {
  AddButton,
  ItemControls,
  move,
  newKey,
} from "@/components/mentor-content/list-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProblemDraft = {
  key: string;
  id?: string;
  title: string;
  statement: string;
  language: (typeof CODE_LANGUAGES)[number]["value"];
  starter: string;
  required: boolean;
};

export type HomeworkDraft = {
  id?: string;
  title: string;
  description: string;
  required: boolean;
  problems: Omit<ProblemDraft, "key">[];
};

const emptyProblem = (key = newKey("p")): ProblemDraft => ({
  key,
  title: "",
  statement: "",
  language: "python",
  starter: "",
  required: true,
});

/** Tema: titlu, descriere, tip și problemele ei, fiecare obligatorie sau opțională. */
export function HomeworkForm({
  draft,
  onSaved,
  forClass,
}: {
  draft: HomeworkDraft;
  onSaved?: () => void;
  /** Tema nouă dintr-o clasă: se dă direct clasei, cu termenul de aici. */
  forClass?: { classId: string; className: string; defaultDeadline: string };
}) {
  const [deadline, setDeadline] = useState(forClass?.defaultDeadline ?? "");
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [required, setRequired] = useState(
    draft.required ? "required" : "optional",
  );
  const [problems, setProblems] = useState<ProblemDraft[]>(() =>
    draft.problems.length
      ? draft.problems.map((p, i) => ({ ...p, key: `p-${i}` }))
      : [emptyProblem("p-0")],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const patch = (i: number, p: Partial<ProblemDraft>) =>
    setProblems((list) => list.map((x, j) => (j === i ? { ...x, ...p } : x)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: HomeworkInput = {
      title,
      description,
      required: required === "required",
      problems: problems.map(({ key: _key, ...p }) => p),
    };
    startTransition(async () => {
      // O temă nouă duce, la reușită, direct la pagina ei (unde o dai claselor).
      const r = await saveHomework(
        draft.id ?? null,
        input,
        forClass ? { classId: forClass.classId, deadline } : undefined,
      );
      if (!r.ok) {
        setErrors(r.errors ?? {});
        toast.error(r.message);
        return;
      }
      setErrors({});
      toast.success(r.message);
      router.refresh();
      onSaved?.();
    });
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <div className="grid cut gap-5 bg-card p-5">
        <Field id="hw-title" label="Titlul temei" error={errors.title}>
          <Input
            id="hw-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Tema 3: Bucle"
            maxLength={120}
            aria-invalid={errors.title ? true : undefined}
          />
        </Field>
        <Field
          id="hw-desc"
          label="Descriere"
          optional
          error={errors.description}
          hint="Ce exersează elevii și ce așteptări ai."
        >
          <Textarea
            id="hw-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            className="min-h-20"
          />
        </Field>
        <FieldSet legend="Tipul temei">
          <ChoiceGroup
            name="required"
            value={required}
            onChange={setRequired}
            choices={[
              {
                value: "required",
                label: "Obligatorie",
                description: "Intră la „Obligatorii” la elevi.",
              },
              {
                value: "optional",
                label: "Opțională",
                description: "Pentru cine vrea să exerseze mai mult.",
              },
            ]}
          />
        </FieldSet>
        {forClass ? (
          <Field
            id="hw-deadline"
            label={`Termen pentru ${forClass.className}`}
            optional
            error={errors.deadline}
            hint="Gol = fără termen. Din secțiunea Teme o poți da apoi și altor clase."
          >
            <Input
              id="hw-deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-fit"
            />
          </Field>
        ) : null}
      </div>

      <section aria-labelledby="probleme" className="grid gap-3">
        <h2 id="probleme" className="text-2xl">
          Probleme ({problems.length})
        </h2>
        {errors.problems ? <FieldError>{errors.problems}</FieldError> : null}
        <ol className="grid gap-3">
          {problems.map((p, i) => {
            const e = (k: string) => errors[`problems.${i}.${k}`];
            return (
              <li key={p.key} className="grid cut gap-4 bg-card p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold font-heading uppercase tracking-wide">
                    Problema {i + 1}
                  </span>
                  <ItemControls
                    label={`problema ${i + 1}`}
                    index={i}
                    count={problems.length}
                    minCount={1}
                    onMove={(from, to) => setProblems(move(problems, from, to))}
                    onRemove={(idx) =>
                      setProblems(problems.filter((_, j) => j !== idx))
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                  <Field id={`${p.key}-title`} label="Titlu" error={e("title")}>
                    <Input
                      id={`${p.key}-title`}
                      value={p.title}
                      onChange={(ev) => patch(i, { title: ev.target.value })}
                      maxLength={120}
                      aria-invalid={e("title") ? true : undefined}
                    />
                  </Field>
                  <Field id={`${p.key}-lang`} label="Limbaj">
                    <SelectField
                      id={`${p.key}-lang`}
                      name={`${p.key}-lang`}
                      value={p.language}
                      onValueChange={(v) =>
                        patch(i, { language: v as ProblemDraft["language"] })
                      }
                      items={[...CODE_LANGUAGES]}
                    />
                  </Field>
                </div>
                <Field
                  id={`${p.key}-st`}
                  label="Enunț"
                  error={e("statement")}
                  hint="Lasă un rând liber între paragrafe. Poți scrie `cod` și **important**."
                >
                  <Textarea
                    id={`${p.key}-st`}
                    value={p.statement}
                    onChange={(ev) => patch(i, { statement: ev.target.value })}
                    className="min-h-28"
                    aria-invalid={e("statement") ? true : undefined}
                  />
                </Field>
                <Field
                  id={`${p.key}-starter`}
                  label="Cod de pornire"
                  optional
                  hint="Apare în editorul elevului la început."
                >
                  <Textarea
                    id={`${p.key}-starter`}
                    value={p.starter}
                    spellCheck={false}
                    onChange={(ev) => patch(i, { starter: ev.target.value })}
                    className="min-h-16 font-mono text-sm"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={p.required}
                    onChange={(ev) => patch(i, { required: ev.target.checked })}
                  />
                  Obligatorie (fără ea tema nu e trimisă complet și nu primește
                  +2 XP)
                </label>
              </li>
            );
          })}
        </ol>
        <AddButton
          onClick={() => setProblems([...problems, emptyProblem()])}
          disabled={problems.length >= 20}
        >
          Adaugă o problemă
        </AddButton>
      </section>

      <Button
        type="submit"
        variant="cta"
        size="lg"
        className="w-fit"
        disabled={pending}
      >
        {pending
          ? "Se salvează…"
          : draft.id
            ? "Salvează tema"
            : forClass
              ? `Creează tema pentru ${forClass.className}`
              : "Creează tema"}
      </Button>
    </form>
  );
}

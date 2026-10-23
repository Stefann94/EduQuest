"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveProblem } from "@/app/mentor/materiale/actions";
import { Section } from "@/components/common/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PublicationStatus } from "@/lib/data/types";
import { Callout } from "./callout";
import type { ProblemDraft } from "./drafts";
import {
  ChoiceGroup,
  describe,
  Field,
  FieldError,
  FieldSet,
  FormMessage,
  SelectField,
} from "./field";
import { CODE_LANGUAGES, GLOBAL } from "./form-state";
import { AddButton, ItemControls, move, newKey } from "./list-controls";
import { useMentorForm } from "./use-mentor-form";

type Example = { key: string; input: string; output: string; note: string };
type Step = { key: string; text: string };

export function ProblemForm({
  draft,
  classes,
  readOnlyReason,
}: {
  draft: ProblemDraft;
  classes: { id: string; name: string }[];
  readOnlyReason?: string;
}) {
  const [difficulty, setDifficulty] = useState(draft.difficulty);
  const [classId, setClassId] = useState(draft.classId);
  const [language, setLanguage] = useState(draft.solutionLanguage);
  const [status, setStatus] = useState<PublicationStatus>(draft.status);
  const [examples, setExamples] = useState<Example[]>(() =>
    draft.examples.map((e, i) => ({ ...e, key: `ex-${i}` })),
  );
  const [steps, setSteps] = useState<Step[]>(() =>
    draft.explanation.map((text, i) => ({ text, key: `step-${i}` })),
  );

  const { errors, pending, formRef, onSubmit, state } = useMentorForm(
    saveProblem,
    (fd) => {
      fd.set(
        "examples",
        JSON.stringify(
          examples.map(({ input, output, note }) => ({ input, output, note })),
        ),
      );
      fd.set("explanation", JSON.stringify(steps.map((s) => s.text)));
    },
  );

  const updateExample = (i: number, patch: Partial<Example>) =>
    setExamples((list) =>
      list.map((e, j) => (j === i ? { ...e, ...patch } : e)),
    );
  const updateStep = (i: number, text: string) =>
    setSteps((list) => list.map((s, j) => (j === i ? { ...s, text } : s)));

  const classItems = [
    ...classes.map((c) => ({ value: c.id, label: c.name })),
    { value: GLOBAL, label: "Resursă globală (toți elevii)" },
  ];

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      {draft.id ? <input type="hidden" name="id" value={draft.id} /> : null}
      <fieldset
        disabled={!!readOnlyReason}
        className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
      >
        <div className="grid min-w-0 gap-6">
          {readOnlyReason ? (
            <Callout icon={Lock} tone="warning">
              {readOnlyReason}
            </Callout>
          ) : null}
          <Section
            title="Problema"
            description="Elevii văd mai întâi enunțul și exemplele; soluția rămâne ascunsă până o deschid."
          >
            <div className="grid gap-5">
              <Field id="title" label="Titlu" error={errors.title}>
                <Input
                  {...describe("title", errors.title)}
                  name="title"
                  defaultValue={draft.title}
                  placeholder="ex. Suma cifrelor unui număr"
                  maxLength={120}
                />
              </Field>
              <Field
                id="statement"
                label="Enunț"
                error={errors.statement}
                hint="Explică pe scurt ce trebuie să facă programul."
              >
                <Textarea
                  {...describe("statement", errors.statement, "hint")}
                  name="statement"
                  defaultValue={draft.statement}
                  className="min-h-32"
                />
              </Field>
              <Field
                id="constraints"
                label="Restricții"
                optional
                hint="Câte una pe rând, de exemplu: 1 ≤ n ≤ 1 000 000."
                error={errors.constraints}
              >
                <Textarea
                  {...describe("constraints", errors.constraints, "hint")}
                  name="constraints"
                  defaultValue={draft.constraints}
                  className="min-h-20"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Exemple"
            description="Date de intrare și rezultatul așteptat. Opțional, o notă care explică exemplul."
          >
            <div className="grid gap-4">
              {examples.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Niciun exemplu. Exemplele îi ajută pe elevi să înțeleagă
                  enunțul.
                </p>
              ) : (
                <ol className="grid gap-4">
                  {examples.map((e, i) => {
                    const p = `examples.${i}`;
                    return (
                      <li
                        key={e.key}
                        className="rounded-lg border bg-muted/30 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">
                            Exemplul {i + 1}
                          </p>
                          <ItemControls
                            label={`exemplul ${i + 1}`}
                            index={i}
                            count={examples.length}
                            onMove={(a, b) => setExamples((l) => move(l, a, b))}
                            onRemove={(j) =>
                              setExamples((l) => l.filter((_, k) => k !== j))
                            }
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            id={`${p}.input`}
                            label="Intrare"
                            error={errors[`${p}.input`]}
                          >
                            <Textarea
                              {...describe(`${p}.input`, errors[`${p}.input`])}
                              value={e.input}
                              onChange={(ev) =>
                                updateExample(i, { input: ev.target.value })
                              }
                              spellCheck={false}
                              className="min-h-16 font-mono text-[13px]"
                            />
                          </Field>
                          <Field
                            id={`${p}.output`}
                            label="Ieșire"
                            error={errors[`${p}.output`]}
                          >
                            <Textarea
                              {...describe(
                                `${p}.output`,
                                errors[`${p}.output`],
                              )}
                              value={e.output}
                              onChange={(ev) =>
                                updateExample(i, { output: ev.target.value })
                              }
                              spellCheck={false}
                              className="min-h-16 font-mono text-[13px]"
                            />
                          </Field>
                          <Field
                            id={`${p}.note`}
                            label="Notă"
                            optional
                            error={errors[`${p}.note`]}
                            className="sm:col-span-2"
                          >
                            <Input
                              {...describe(`${p}.note`, errors[`${p}.note`])}
                              value={e.note}
                              onChange={(ev) =>
                                updateExample(i, { note: ev.target.value })
                              }
                              placeholder="ex. 4 + 7 + 2 + 3 = 16"
                            />
                          </Field>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              {errors.examples ? (
                <FieldError>{errors.examples}</FieldError>
              ) : null}
              <AddButton
                disabled={examples.length >= 6}
                onClick={() =>
                  setExamples((l) => [
                    ...l,
                    { key: newKey("ex"), input: "", output: "", note: "" },
                  ])
                }
              >
                Adaugă un exemplu
              </AddButton>
            </div>
          </Section>

          <Section
            title="Soluția"
            description="Codul complet și explicația pas cu pas. Elevii o văd doar după ce apasă „Arată soluția”."
          >
            <div className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                <Field
                  id="solutionCode"
                  label="Codul soluției"
                  error={errors.solutionCode}
                >
                  <Textarea
                    {...describe("solutionCode", errors.solutionCode)}
                    name="solutionCode"
                    defaultValue={draft.solutionCode}
                    spellCheck={false}
                    className="min-h-44 font-mono text-[13px]"
                  />
                </Field>
                <Field
                  id="solutionLanguage"
                  label="Limbaj"
                  error={errors.solutionLanguage}
                >
                  <SelectField
                    id="solutionLanguage"
                    name="solutionLanguage"
                    value={language}
                    onValueChange={setLanguage}
                    items={[...CODE_LANGUAGES]}
                    error={errors.solutionLanguage}
                  />
                </Field>
              </div>

              <FieldSet
                legend="Explicația, pas cu pas"
                hint="Opțional. Fiecare pas apare numerotat sub soluție."
                error={errors.explanation}
              >
                {steps.length > 0 ? (
                  <ol className="grid gap-3">
                    {steps.map((s, i) => {
                      const id = `explanation.${i}`;
                      return (
                        <li key={s.key} className="grid gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <label htmlFor={id} className="font-medium text-sm">
                              Pasul {i + 1}
                            </label>
                            <ItemControls
                              label={`pasul ${i + 1}`}
                              index={i}
                              count={steps.length}
                              onMove={(a, b) => setSteps((l) => move(l, a, b))}
                              onRemove={(j) =>
                                setSteps((l) => l.filter((_, k) => k !== j))
                              }
                            />
                          </div>
                          <Textarea
                            {...describe(id, errors[id])}
                            value={s.text}
                            onChange={(ev) => updateStep(i, ev.target.value)}
                            className="min-h-16"
                          />
                          {errors[id] ? (
                            <FieldError id={`${id}-error`}>
                              {errors[id]}
                            </FieldError>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                ) : null}
                <AddButton
                  disabled={steps.length >= 10}
                  onClick={() =>
                    setSteps((l) => [...l, { key: newKey("step"), text: "" }])
                  }
                >
                  Adaugă un pas
                </AddButton>
              </FieldSet>
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-20">
          <Section title="Detalii și publicare">
            <div className="grid gap-5">
              <Field
                id="topic"
                label="Temă"
                error={errors.topic}
                hint="De exemplu „Python · Bucle”."
              >
                <Input
                  {...describe("topic", errors.topic, "hint")}
                  name="topic"
                  defaultValue={draft.topic}
                  maxLength={60}
                />
              </Field>
              <FieldSet legend="Dificultate" error={errors.difficulty}>
                <ChoiceGroup
                  name="difficulty"
                  value={difficulty}
                  onChange={setDifficulty}
                  className="grid-cols-3 sm:grid-flow-row"
                  itemClassName="px-2.5"
                  choices={[
                    { value: "1", label: "Ușor" },
                    { value: "2", label: "Mediu" },
                    { value: "3", label: "Avansat" },
                  ]}
                />
              </FieldSet>
              <Field
                id="classId"
                label="Unde apare"
                error={errors.classId}
                hint="Resursele globale sunt disponibile tuturor elevilor."
              >
                <SelectField
                  id="classId"
                  name="classId"
                  value={classId}
                  onValueChange={setClassId}
                  items={classItems}
                  placeholder="Alege clasa"
                  error={errors.classId}
                  hint="hint"
                />
              </Field>
              <FieldSet legend="Stare" error={errors.status}>
                <ChoiceGroup
                  name="status"
                  value={status}
                  onChange={setStatus}
                  className="sm:grid-flow-row"
                  choices={[
                    {
                      value: "draft",
                      label: "Ciornă",
                      description: "Doar tu o vezi.",
                    },
                    {
                      value: "published",
                      label: "Publicată",
                      description: "Elevii o pot deschide și rezolva.",
                    },
                  ]}
                />
              </FieldSet>
            </div>
          </Section>

          {readOnlyReason ? null : (
            <div className="grid gap-2">
              <Button type="submit" size="lg" disabled={pending}>
                {pending
                  ? "Se salvează…"
                  : draft.id
                    ? "Salvează modificările"
                    : status === "published"
                      ? "Publică problema"
                      : "Salvează ciorna"}
              </Button>
              <Link
                href="/mentor/materiale"
                className={buttonVariants({ variant: "ghost" })}
              >
                Anulează
              </Link>
              {state.status === "error" ? (
                <FormMessage message={state.message} />
              ) : null}
            </div>
          )}
        </div>
      </fieldset>
    </form>
  );
}

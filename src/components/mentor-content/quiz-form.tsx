"use client";

import { Code2, Globe2, Lock, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveQuiz } from "@/app/mentor/quiz/actions";
import { Section } from "@/components/common/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import type { QuestionDraft, QuizDraft } from "./drafts";
import {
  ChoiceGroup,
  describe,
  Field,
  FieldError,
  FieldSet,
  FormMessage,
  SelectField,
} from "./field";
import { AddButton, ItemControls, move, newKey } from "./list-controls";
import { ANSWER_STYLES, AnswerShape } from "./quiz-shapes";
import { useMentorForm } from "./use-mentor-form";

const emptyQuestion = (): QuestionDraft => ({
  key: newKey("q"),
  prompt: "",
  code: "",
  options: ["", ""],
  correct: null,
  explanation: "",
});

export function QuizForm({
  draft,
  classes,
  readOnlyReason,
}: {
  draft: QuizDraft;
  classes: { id: string; name: string }[];
  readOnlyReason?: string;
}) {
  const [difficulty, setDifficulty] = useState(draft.difficulty);
  const [scope, setScope] = useState(draft.scope);
  const [classId, setClassId] = useState(draft.classId);
  const [timeUnit, setTimeUnit] = useState<string>(draft.timeUnit);
  const [questions, setQuestions] = useState<QuestionDraft[]>(draft.questions);
  // Întrebările la care e deschis câmpul de cod (cele care au deja cod sunt deschise).
  const [withCode, setWithCode] = useState<string[]>(() =>
    draft.questions.filter((q) => q.code).map((q) => q.key),
  );

  const { errors, pending, formRef, onSubmit, state } = useMentorForm(
    saveQuiz,
    (fd) => {
      fd.set(
        "questions",
        JSON.stringify(
          questions.map((q) => ({
            prompt: q.prompt,
            code: withCode.includes(q.key) ? q.code : "",
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
          })),
        ),
      );
    },
  );

  const update = (i: number, patch: Partial<QuestionDraft>) =>
    setQuestions((list) =>
      list.map((q, j) => (j === i ? { ...q, ...patch } : q)),
    );

  function setOption(i: number, j: number, value: string) {
    const q = questions[i];
    update(i, { options: q.options.map((o, k) => (k === j ? value : o)) });
  }

  function removeOption(i: number, j: number) {
    const q = questions[i];
    const correct =
      q.correct === null || q.correct === j
        ? null
        : q.correct > j
          ? q.correct - 1
          : q.correct;
    update(i, { options: q.options.filter((_, k) => k !== j), correct });
  }

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

          <Section title="Detalii">
            <div className="grid gap-5">
              <Field id="title" label="Titlu" error={errors.title}>
                <Input
                  {...describe("title", errors.title)}
                  name="title"
                  defaultValue={draft.title}
                  placeholder="ex. Test: bucle"
                  maxLength={120}
                />
              </Field>
              <Field
                id="description"
                label="Descriere"
                optional
                error={errors.description}
              >
                <Textarea
                  {...describe("description", errors.description)}
                  name="description"
                  defaultValue={draft.description}
                  className="min-h-16"
                  maxLength={300}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="topic" label="Temă" error={errors.topic}>
                  <Input
                    {...describe("topic", errors.topic)}
                    name="topic"
                    defaultValue={draft.topic}
                    placeholder="ex. Python"
                    maxLength={60}
                  />
                </Field>
                <FieldSet legend="Dificultate" error={errors.difficulty}>
                  <ChoiceGroup
                    name="difficulty"
                    value={difficulty}
                    onChange={setDifficulty}
                    className="grid-cols-3 sm:grid-flow-row"
                    itemClassName="px-2.5 py-2"
                    choices={[
                      { value: "1", label: "Ușor" },
                      { value: "2", label: "Mediu" },
                      { value: "3", label: "Avansat" },
                    ]}
                  />
                </FieldSet>
              </div>
            </div>
          </Section>

          <Section
            title={`Întrebări (${questions.length})`}
            description="Întrebări cu variante de răspuns: 2–4 variante, dintre care una corectă."
          >
            <div className="grid gap-4">
              {errors.questions ? (
                <FieldError>{errors.questions}</FieldError>
              ) : null}
              <ol className="grid gap-4">
                {questions.map((q, i) => {
                  const p = `questions.${i}`;
                  const codeOpen = withCode.includes(q.key);
                  return (
                    <li
                      key={q.key}
                      className="grid gap-4 rounded-lg border bg-muted/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">
                          Întrebarea {i + 1}
                        </p>
                        <ItemControls
                          label={`întrebarea ${i + 1}`}
                          index={i}
                          count={questions.length}
                          minCount={1}
                          onMove={(a, b) => setQuestions((l) => move(l, a, b))}
                          onRemove={(j) =>
                            setQuestions((l) => l.filter((_, k) => k !== j))
                          }
                        />
                      </div>

                      <Field
                        id={`${p}.prompt`}
                        label="Textul întrebării"
                        error={errors[`${p}.prompt`]}
                      >
                        <Textarea
                          {...describe(`${p}.prompt`, errors[`${p}.prompt`])}
                          value={q.prompt}
                          onChange={(e) =>
                            update(i, { prompt: e.target.value })
                          }
                          className="min-h-16"
                          placeholder="ex. Ce afișează programul?"
                        />
                      </Field>

                      {codeOpen ? (
                        <Field id={`${p}.code`} label="Cod" optional>
                          <Textarea
                            id={`${p}.code`}
                            value={q.code}
                            onChange={(e) =>
                              update(i, { code: e.target.value })
                            }
                            spellCheck={false}
                            className="min-h-20 font-mono text-[13px]"
                          />
                        </Field>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="-mt-2 w-fit"
                        onClick={() =>
                          setWithCode((list) =>
                            codeOpen
                              ? list.filter((k) => k !== q.key)
                              : [...list, q.key],
                          )
                        }
                      >
                        <Code2 aria-hidden="true" />
                        {codeOpen ? "Elimină codul" : "Adaugă cod"}
                      </Button>

                      <fieldset className="grid gap-2">
                        <legend className="mb-2 font-medium text-sm leading-none">
                          Variante de răspuns
                          <span className="ml-1 font-normal text-muted-foreground">
                            (alege-o pe cea corectă)
                          </span>
                        </legend>
                        <ul className="grid gap-2">
                          {q.options.map((o, j) => {
                            const oid = `${p}.options.${j}`;
                            const style = ANSWER_STYLES[j];
                            const isCorrect = q.correct === j;
                            return (
                              // biome-ignore lint/suspicious/noArrayIndexKey: variantele nu au id; poziția lor e identitatea (culoare + formă)
                              <li key={j} className="grid gap-1">
                                <div
                                  className={cn(
                                    "flex items-center gap-2 rounded-lg border bg-card p-1.5 pl-2",
                                    isCorrect &&
                                      "border-success ring-1 ring-success/40",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "grid size-7 shrink-0 place-items-center rounded-md",
                                      style.bg,
                                      style.text,
                                    )}
                                    title={style.label}
                                  >
                                    <AnswerShape
                                      index={j}
                                      className="size-3.5"
                                    />
                                  </span>
                                  <Input
                                    {...describe(oid, errors[oid])}
                                    aria-label={`Varianta ${j + 1} (${style.label.toLowerCase()})`}
                                    value={o}
                                    onChange={(e) =>
                                      setOption(i, j, e.target.value)
                                    }
                                    className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                                    placeholder={`Varianta ${j + 1}`}
                                  />
                                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs has-checked:bg-success-soft has-checked:font-medium has-checked:text-success has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                                    <input
                                      type="radio"
                                      name={`correct-${q.key}`}
                                      checked={isCorrect}
                                      onChange={() => update(i, { correct: j })}
                                      className="size-3.5 accent-success"
                                      aria-describedby={
                                        errors[`${p}.correct`]
                                          ? `${p}.correct-error`
                                          : undefined
                                      }
                                    />
                                    {isCorrect ? "Corect" : "Corectă?"}
                                  </label>
                                  <ItemControls
                                    label={`varianta ${j + 1}`}
                                    index={j}
                                    count={q.options.length}
                                    minCount={2}
                                    onRemove={(k) => removeOption(i, k)}
                                  />
                                </div>
                                {errors[oid] ? (
                                  <FieldError id={`${oid}-error`}>
                                    {errors[oid]}
                                  </FieldError>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                        {errors[`${p}.options`] ? (
                          <FieldError>{errors[`${p}.options`]}</FieldError>
                        ) : null}
                        {errors[`${p}.correct`] ? (
                          <FieldError id={`${p}.correct-error`}>
                            {errors[`${p}.correct`]}
                          </FieldError>
                        ) : null}
                        <AddButton
                          disabled={q.options.length >= 4}
                          onClick={() =>
                            update(i, { options: [...q.options, ""] })
                          }
                        >
                          Adaugă o variantă
                        </AddButton>
                      </fieldset>

                      <Field
                        id={`${p}.explanation`}
                        label="Explicație"
                        optional
                        hint="Elevii o văd după ce răspund."
                        error={errors[`${p}.explanation`]}
                      >
                        <Textarea
                          {...describe(
                            `${p}.explanation`,
                            errors[`${p}.explanation`],
                            "hint",
                          )}
                          value={q.explanation}
                          onChange={(e) =>
                            update(i, { explanation: e.target.value })
                          }
                          className="min-h-14"
                        />
                      </Field>
                    </li>
                  );
                })}
              </ol>
              <AddButton
                disabled={questions.length >= 30}
                onClick={() => setQuestions((l) => [...l, emptyQuestion()])}
              >
                Adaugă o întrebare
              </AddButton>
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-20">
          <Section title="Disponibilitate">
            <div className="grid gap-5">
              <FieldSet legend="Pentru cine" error={errors.scope}>
                <ChoiceGroup
                  name="scope"
                  value={scope}
                  onChange={setScope}
                  className="sm:grid-flow-row"
                  choices={[
                    {
                      value: "global",
                      label: "Exersare globală",
                      description: "Orice elev îl poate rezolva, oricând.",
                      icon: <Globe2 aria-hidden="true" />,
                    },
                    {
                      value: "class",
                      label: "O clasă",
                      description: "Dat unei clase, cu termen și XP.",
                      icon: <Users aria-hidden="true" />,
                    },
                  ]}
                />
              </FieldSet>

              {scope === "class" ? (
                <>
                  <Field id="classId" label="Clasa" error={errors.classId}>
                    <SelectField
                      id="classId"
                      name="classId"
                      value={classId}
                      onValueChange={setClassId}
                      items={classes.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      placeholder="Alege clasa"
                      error={errors.classId}
                    />
                  </Field>
                  <Field
                    id="opensAt"
                    label="Disponibil de la"
                    error={errors.opensAt}
                  >
                    <Input
                      {...describe("opensAt", errors.opensAt)}
                      type="datetime-local"
                      name="opensAt"
                      defaultValue={draft.opensAt}
                    />
                  </Field>
                  <Field id="deadline" label="Termen" error={errors.deadline}>
                    <Input
                      {...describe("deadline", errors.deadline)}
                      type="datetime-local"
                      name="deadline"
                      defaultValue={draft.deadline}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      id="maxAttempts"
                      label="Încercări"
                      error={errors.maxAttempts}
                    >
                      <Input
                        {...describe("maxAttempts", errors.maxAttempts)}
                        type="number"
                        name="maxAttempts"
                        min={1}
                        max={10}
                        defaultValue={draft.maxAttempts}
                      />
                    </Field>
                    <Field id="xp" label="XP" error={errors.xp}>
                      <Input
                        {...describe("xp", errors.xp)}
                        type="number"
                        name="xp"
                        min={0}
                        max={10}
                        defaultValue={draft.xp}
                      />
                    </Field>
                  </div>
                  <p className="-mt-2 text-muted-foreground text-xs">
                    XP-ul se acordă o singură dată, pentru quiz-ul terminat până
                    la termen, oricâte încercări ar folosi elevul.
                  </p>
                </>
              ) : null}

              <div className="grid gap-2">
                <div className="grid grid-cols-[minmax(0,1fr)_120px] items-end gap-2">
                  <Field
                    id="timeLimit"
                    label="Limită de timp"
                    optional
                    error={errors.timeLimit}
                  >
                    <Input
                      {...describe("timeLimit", errors.timeLimit, "hint")}
                      type="number"
                      name="timeLimit"
                      min={1}
                      defaultValue={draft.timeLimit}
                      placeholder="Fără limită"
                    />
                  </Field>
                  <SelectField
                    id="timeUnit"
                    ariaLabel="Unitatea de timp"
                    name="timeUnit"
                    value={timeUnit}
                    onValueChange={setTimeUnit}
                    items={[
                      { value: "min", label: "minute" },
                      { value: "sec", label: "secunde" },
                    ]}
                  />
                </div>
                {errors.timeLimit ? null : (
                  <p
                    id="timeLimit-hint"
                    className="text-muted-foreground text-xs"
                  >
                    Pentru tot quiz-ul. În sesiunile live, limita se aplică
                    fiecărei întrebări.
                  </p>
                )}
              </div>
            </div>
          </Section>

          {readOnlyReason ? null : (
            <div className="grid gap-2">
              <Button type="submit" size="lg" disabled={pending}>
                {pending
                  ? "Se salvează…"
                  : draft.id
                    ? "Salvează modificările"
                    : "Creează quiz-ul"}
              </Button>
              <Link
                href="/mentor/quiz"
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

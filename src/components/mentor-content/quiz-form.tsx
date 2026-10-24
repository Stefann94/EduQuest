"use client";

import { Code2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { type QuizInput, saveQuiz } from "@/app/mentor/quiz/actions";
import { Section } from "@/components/common/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldSet, SelectField } from "./field";
import { AddButton, ItemControls, move, newKey } from "./list-controls";
import { ANSWER_STYLES, AnswerShape } from "./quiz-shapes";

type QuestionDraft = {
  key: string;
  prompt: string;
  code: string;
  options: string[];
  correct: number | null;
  explanation: string;
  lessonId: string | null;
};

export type QuizDraft = {
  id?: string;
  title: string;
  description: string;
  lessonIds: string[];
  xp: number;
  timeLimitSec: number | null;
  classIds: string[];
  questions: Omit<QuestionDraft, "key">[];
};

const emptyQuestion = (
  lessonId: string | null,
  key = newKey("q"),
): QuestionDraft => ({
  key,
  prompt: "",
  code: "",
  options: ["", "", "", ""],
  correct: null,
  explanation: "",
  lessonId,
});

/**
 * Un quiz: întrebări cu 2–4 variante (una corectă), fiecare etichetată pe lecția pe care
 * o verifică; lecțiile acoperite (una = quiz de lecție, mai multe = recapitulare), XP-ul
 * și clasele cărora le e dat (disponibil imediat, fără programare).
 */
export function QuizForm({
  draft,
  lessons,
  classes,
}: {
  draft: QuizDraft;
  lessons: { id: string; title: string }[];
  classes: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [lessonIds, setLessonIds] = useState(draft.lessonIds);
  const [classIds, setClassIds] = useState(draft.classIds);
  const [xp, setXp] = useState(draft.xp);
  const [minutes, setMinutes] = useState(
    draft.timeLimitSec ? String(Math.round(draft.timeLimitSec / 60)) : "",
  );
  const [questions, setQuestions] = useState<QuestionDraft[]>(() =>
    draft.questions.length
      ? draft.questions.map((q, i) => ({ ...q, key: `q-${i}` }))
      : [emptyQuestion(draft.lessonIds[0] ?? null, "q-0")],
  );
  const [withCode, setWithCode] = useState<string[]>(() =>
    questions.filter((q) => q.code).map((q) => q.key),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<QuestionDraft>) =>
    setQuestions((list) =>
      list.map((q, j) => (j === i ? { ...q, ...patch } : q)),
    );
  const setOption = (i: number, j: number, value: string) =>
    update(i, {
      options: questions[i].options.map((o, k) => (k === j ? value : o)),
    });
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
  const toggle = (list: string[], id: string, on: boolean) =>
    on ? [...list, id] : list.filter((x) => x !== id);

  const chosenLessons = lessons.filter((l) => lessonIds.includes(l.id));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const input: QuizInput = {
      title,
      description,
      lessonIds,
      xp,
      timeLimitSec: minutes.trim() ? Math.round(Number(minutes) * 60) : null,
      classIds,
      questions: questions.map((q) => ({
        prompt: q.prompt,
        code: withCode.includes(q.key) ? q.code : "",
        options: q.options,
        correct: q.correct ?? -1,
        explanation: q.explanation,
        lessonId:
          q.lessonId && lessonIds.includes(q.lessonId) ? q.lessonId : null,
      })),
    };
    startTransition(async () => {
      const r = await saveQuiz(draft.id ?? null, input);
      if (!r.ok) {
        setErrors(r.errors ?? {});
        toast.error(r.message);
        return;
      }
      setErrors({});
      toast.success(r.message);
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="grid min-w-0 gap-6">
          <Section title="Detalii">
            <div className="grid gap-5">
              <Field id="title" label="Titlu" error={errors.title}>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex. Recapitulare: bucle"
                  maxLength={120}
                  aria-invalid={errors.title ? true : undefined}
                />
              </Field>
              <Field
                id="description"
                label="Descriere"
                optional
                error={errors.description}
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-16"
                  maxLength={300}
                />
              </Field>
            </div>
          </Section>

          <Section
            title={`Întrebări (${questions.length})`}
            description="Fiecare întrebare are 2–4 variante, una corectă, și e etichetată pe o lecție."
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
                    <li key={q.key} className="grid gap-4 bg-muted/40 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold font-heading text-sm uppercase tracking-wide">
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
                          id={`${p}.prompt`}
                          value={q.prompt}
                          onChange={(e) =>
                            update(i, { prompt: e.target.value })
                          }
                          className="min-h-16"
                          placeholder="ex. Ce afișează programul?"
                          aria-invalid={
                            errors[`${p}.prompt`] ? true : undefined
                          }
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
                            className="min-h-20 font-mono text-sm"
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
                                    "flex items-center gap-2 border bg-card p-1.5 pl-2",
                                    isCorrect &&
                                      "border-success ring-1 ring-success/40",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "grid size-7 shrink-0 place-items-center",
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
                                    aria-label={`Varianta ${j + 1} (${style.label.toLowerCase()})`}
                                    aria-invalid={
                                      errors[oid] ? true : undefined
                                    }
                                    value={o}
                                    onChange={(e) =>
                                      setOption(i, j, e.target.value)
                                    }
                                    className="h-8 border-0 bg-transparent px-1 font-mono shadow-none focus-visible:ring-0"
                                    placeholder={`Varianta ${j + 1}`}
                                  />
                                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 px-2 py-1 text-xs has-checked:bg-success-soft has-checked:font-medium has-checked:text-success has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
                                    <input
                                      type="radio"
                                      name={`correct-${q.key}`}
                                      checked={isCorrect}
                                      onChange={() => update(i, { correct: j })}
                                      className="size-3.5 accent-success"
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
                                  <FieldError>{errors[oid]}</FieldError>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                        {errors[`${p}.options`] ? (
                          <FieldError>{errors[`${p}.options`]}</FieldError>
                        ) : null}
                        {errors[`${p}.correct`] ? (
                          <FieldError>{errors[`${p}.correct`]}</FieldError>
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

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          id={`${p}.lesson`}
                          label="Lecția verificată"
                          hint={
                            chosenLessons.length
                              ? undefined
                              : "Alege întâi lecțiile quiz-ului (în dreapta)."
                          }
                        >
                          <SelectField
                            id={`${p}.lesson`}
                            name={`${p}.lesson`}
                            value={
                              q.lessonId && lessonIds.includes(q.lessonId)
                                ? q.lessonId
                                : ""
                            }
                            onValueChange={(v) =>
                              update(i, { lessonId: v || null })
                            }
                            items={chosenLessons.map((l) => ({
                              value: l.id,
                              label: l.title,
                            }))}
                            placeholder="Fără lecție"
                          />
                        </Field>
                        <Field
                          id={`${p}.explanation`}
                          label="Explicație"
                          optional
                          hint="Elevii o văd după ce trimit."
                          error={errors[`${p}.explanation`]}
                        >
                          <Textarea
                            id={`${p}.explanation`}
                            value={q.explanation}
                            onChange={(e) =>
                              update(i, { explanation: e.target.value })
                            }
                            className="min-h-10"
                          />
                        </Field>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <AddButton
                disabled={questions.length >= 40}
                onClick={() =>
                  setQuestions((l) => [
                    ...l,
                    emptyQuestion(l.at(-1)?.lessonId ?? lessonIds[0] ?? null),
                  ])
                }
              >
                Adaugă o întrebare
              </AddButton>
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-20">
          <Section title="Lecțiile verificate">
            {lessons.length > 0 ? (
              <FieldSet
                legend={
                  lessonIds.length > 1
                    ? "Recapitulare pe mai multe lecții"
                    : "Quiz pe o lecție"
                }
                hint="Alege una sau mai multe lecții din biblioteca ta."
              >
                <div className="grid max-h-64 gap-1 overflow-y-auto">
                  {lessons.map((l) => (
                    <label
                      key={l.id}
                      className="flex items-center gap-2 px-1 py-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={lessonIds.includes(l.id)}
                        onChange={(e) =>
                          setLessonIds(
                            toggle(lessonIds, l.id, e.target.checked),
                          )
                        }
                      />
                      <span className="min-w-0 truncate">{l.title}</span>
                    </label>
                  ))}
                </div>
              </FieldSet>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nu ai încă lecții. Quiz-ul merge și fără, dar fără lecții nu
                apare în tabelul „elevi × lecții”.
              </p>
            )}
          </Section>

          <Section title="XP și timp">
            <div className="grid gap-4">
              <Field
                id="xp"
                label="XP la prima rezolvare"
                error={errors.xp}
                hint="Între 0 și 5, după scor. O refacere aduce o singură dată +1."
              >
                <Input
                  id="xp"
                  type="number"
                  min={0}
                  max={5}
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                  className="w-24"
                />
              </Field>
              <Field
                id="time"
                label="Limită de timp (minute)"
                optional
                error={errors.timeLimitSec}
              >
                <Input
                  id="time"
                  type="number"
                  min={1}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="Fără limită"
                  className="w-32"
                />
              </Field>
            </div>
          </Section>

          <Section title="Dat claselor">
            {classes.length > 0 ? (
              <FieldSet
                legend="Clasele care îl primesc"
                hint="Elevii îl văd imediat și primesc o notificare."
              >
                <div className="grid gap-1">
                  {classes.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-1 py-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={classIds.includes(c.id)}
                        onChange={(e) =>
                          setClassIds(toggle(classIds, c.id, e.target.checked))
                        }
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </FieldSet>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nu ai clase active.
              </p>
            )}
          </Section>

          <div className="grid gap-2">
            <Button type="submit" variant="cta" size="lg" disabled={pending}>
              {pending
                ? "Se salvează…"
                : draft.id
                  ? "Salvează quiz-ul"
                  : "Creează quiz-ul"}
            </Button>
            <Link
              href="/mentor/quiz"
              className={buttonVariants({ variant: "ghost" })}
            >
              Înapoi la quiz-uri
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

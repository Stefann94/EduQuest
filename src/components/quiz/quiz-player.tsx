"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleAlert,
  Clock,
  Info,
  ListChecks,
  Lock,
  Play,
  RotateCcw,
  Send,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { submitQuiz } from "@/app/(student)/quiz/[id]/actions";
import { DifficultyBadge, XpBadge } from "@/components/common/status";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  GradeResult,
  PublicQuestion,
  QuizMode,
} from "@/lib/data/student-activity-queries";
import { cn } from "@/lib/utils";
import { QuestionCode } from "./question-code";

export type QuizPlayerData = {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  className?: string;
  timeLimitSec?: number;
  questions: PublicQuestion[];
  mode: QuizMode;
  isLiveQuiz: boolean;
  /** Pentru quiz-urile date de mentor. */
  assigned?: {
    deadlineLabel: string;
    maxAttempts: number;
    used: number;
    xp: number;
    open: boolean;
    closedReason?: string;
  };
};

type Phase = "intro" | "question" | "review" | "results";
type Graded = Extract<GradeResult, { ok: true }>;

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function clock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function QuizPlayer({ quiz }: { quiz: QuizPlayerData }) {
  const total = quiz.questions.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(total).fill(null),
  );
  const [result, setResult] = useState<Graded | null>(null);
  const [attemptsHere, setAttemptsHere] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const endsAt = useRef<number | null>(null);
  const answersRef = useRef(answers);
  const mounted = useRef(false);

  const a = quiz.assigned;
  const attemptsLeft = a ? a.maxAttempts - a.used - attemptsHere : Infinity;
  const canStart = a ? a.open && attemptsLeft > 0 : true;

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Focusul merge pe titlul fiecărui ecran nou, pentru tastatură și cititoare de ecran
  // (nu și la prima afișare a paginii).
  // biome-ignore lint/correctness/useExhaustiveDependencies: rulăm la schimbarea ecranului
  useEffect(() => {
    if (mounted.current) headingRef.current?.focus();
    mounted.current = true;
  }, [phase, index]);

  function submit(final: (number | null)[]) {
    endsAt.current = null;
    setSecondsLeft(null);
    startTransition(async () => {
      const r = await submitQuiz(quiz.id, final);
      if (!r.ok) {
        toast.error(
          r.reason === "closed"
            ? "Quiz-ul nu mai acceptă încercări."
            : "Răspunsurile nu au putut fi trimise. Încearcă din nou.",
        );
        setPhase("review");
        return;
      }
      setResult(r);
      setAttemptsHere((n) => n + 1);
      setPhase("results");
    });
  }

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  // Cronometrul (doar pentru quiz-urile cu limită de timp).
  useEffect(() => {
    if (phase !== "question" && phase !== "review") return;
    if (!quiz.timeLimitSec || endsAt.current === null) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil(((endsAt.current ?? 0) - Date.now()) / 1000),
      );
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(timer);
        toast.info("Timpul a expirat. Am trimis răspunsurile date până acum.");
        submitRef.current(answersRef.current);
      }
    };
    const timer = setInterval(tick, 500);
    tick();
    return () => clearInterval(timer);
  }, [phase, quiz.timeLimitSec]);

  function start() {
    setAnswers(Array(total).fill(null));
    setIndex(0);
    setResult(null);
    if (quiz.timeLimitSec) {
      endsAt.current = Date.now() + quiz.timeLimitSec * 1000;
      setSecondsLeft(quiz.timeLimitSec);
    }
    setPhase("question");
  }

  const timerBadge =
    secondsLeft !== null ? (
      <span
        role="timer"
        aria-label={`Timp rămas: ${clock(secondsLeft)}`}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-medium text-sm tabular-nums",
          secondsLeft <= 30 && "border-warning/50 bg-warning-soft text-warning",
        )}
      >
        <Clock className="size-3.5" aria-hidden="true" />
        {clock(secondsLeft)}
      </span>
    ) : null;

  /* ---------- Ecranul de început ---------- */
  if (phase === "intro") {
    return (
      <section
        aria-labelledby="quiz-intro"
        className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xs sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {quiz.topic}
          </span>
          <DifficultyBadge level={quiz.difficulty} />
        </div>
        <h2
          id="quiz-intro"
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-semibold text-xl outline-none"
        >
          {quiz.title}
        </h2>
        <p className="mt-1 text-muted-foreground">{quiz.description}</p>

        <dl className="mt-6 grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
          <IntroItem icon={ListChecks} label="Întrebări">
            {total}, cu un singur răspuns corect
          </IntroItem>
          <IntroItem icon={Clock} label="Timp">
            {quiz.timeLimitSec
              ? `${Math.round(quiz.timeLimitSec / 60)} minute în total`
              : "Fără limită de timp"}
          </IntroItem>
          {a ? (
            <>
              <IntroItem icon={RotateCcw} label="Încercări">
                {a.used + attemptsHere} folosite din {a.maxAttempts}
              </IntroItem>
              <IntroItem icon={Clock} label="Termen">
                {a.deadlineLabel}
              </IntroItem>
            </>
          ) : null}
          <IntroItem icon={Star} label="XP">
            {a
              ? `+${a.xp} XP la prima finalizare, până la termen`
              : "Exersarea nu oferă XP"}
          </IntroItem>
          {quiz.className ? (
            <IntroItem icon={Info} label="Clasa">
              {quiz.className}
            </IntroItem>
          ) : null}
        </dl>

        {quiz.isLiveQuiz && !a ? (
          <p className="mt-4 flex gap-2 rounded-lg bg-muted px-3 py-2 text-muted-foreground text-sm">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Acest quiz se folosește în sesiunile live ale clasei. Aici îl poți
            exersa în ritmul tău.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {canStart ? (
            <Button size="lg" onClick={start}>
              <Play /> Începe quiz-ul
            </Button>
          ) : (
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock className="size-4" aria-hidden="true" />
              {a?.closedReason ?? "Nu mai ai încercări disponibile."}
            </p>
          )}
          <p className="text-muted-foreground text-xs">
            Poți naviga între întrebări și îți poți schimba răspunsurile până
            trimiți.
          </p>
        </div>
      </section>
    );
  }

  /* ---------- Rezultatele ---------- */
  if (phase === "results" && result) {
    const percent = Math.round((result.correct / result.total) * 100);
    const message =
      percent === 100
        ? "Toate răspunsurile sunt corecte. Foarte bine!"
        : percent >= 70
          ? "Rezultat foarte bun. Uită-te și peste explicații."
          : percent >= 40
            ? "Ești pe drumul cel bun. Recitește explicațiile și încearcă din nou."
            : "Un început. Explicațiile de mai jos te ajută să recapitulezi.";
    return (
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <section
          aria-labelledby="quiz-results"
          className="rounded-xl border bg-card p-6 shadow-xs sm:p-8"
        >
          <h2
            id="quiz-results"
            ref={headingRef}
            tabIndex={-1}
            className="font-semibold text-xl outline-none"
          >
            Rezultatul tău
          </h2>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="font-semibold text-5xl tabular-nums tracking-tight">
              {result.correct}
            </span>
            <span className="text-lg text-muted-foreground">
              din {result.total} corecte
            </span>
          </p>
          <Progress
            value={percent}
            aria-label={`${percent}% răspunsuri corecte`}
            className="mt-4 max-w-md [&_[data-slot=progress-track]]:h-2"
          />
          <p className="mt-4">{message}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {a ? (
              result.xp > 0 && attemptsHere === 1 ? (
                <>
                  <XpBadge amount={result.xp} /> pentru finalizarea quiz-ului
                </>
              ) : (
                <span className="text-muted-foreground">
                  XP-ul pentru acest quiz se acordă o singură dată.
                </span>
              )
            ) : (
              <span className="text-muted-foreground">
                Exersarea nu oferă XP, dar te pregătește pentru teme și quiz-uri
                live.
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {canStart ? (
              <Button onClick={start}>
                <RotateCcw /> Încearcă din nou
              </Button>
            ) : null}
            <Link
              href="/quiz"
              className={buttonVariants({ variant: "outline" })}
            >
              Înapoi la quiz-uri
            </Link>
          </div>
          {a ? (
            <p className="mt-3 text-muted-foreground text-xs">
              {attemptsLeft > 0
                ? `Mai ai ${attemptsLeft === 1 ? "o încercare" : `${attemptsLeft} încercări`}.`
                : "Ai folosit toate încercările."}{" "}
              Demo: încercarea se salvează după conectarea la baza de date.
            </p>
          ) : (
            <p className="mt-3 text-muted-foreground text-xs">
              Demo: rezultatul se salvează după conectarea la baza de date.
            </p>
          )}
        </section>

        <section aria-labelledby="quiz-review" className="grid gap-3">
          <h2 id="quiz-review" className="font-semibold text-base">
            Răspunsurile pe rând
          </h2>
          <ol className="stagger grid gap-3">
            {quiz.questions.map((q, i) => {
              const r = result.results[i];
              return (
                <li
                  key={q.id}
                  className="rounded-xl border bg-card p-5 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">
                      <span className="text-muted-foreground">{i + 1}.</span>{" "}
                      {q.prompt}
                    </p>
                    {r.isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-medium text-sm text-success">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Corect
                      </span>
                    ) : r.your === null ? (
                      <span className="inline-flex items-center gap-1 font-medium text-muted-foreground text-sm">
                        <Circle className="size-4" aria-hidden="true" />
                        Fără răspuns
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-destructive text-sm">
                        <XCircle className="size-4" aria-hidden="true" />
                        Greșit
                      </span>
                    )}
                  </div>
                  {q.code ? (
                    <QuestionCode code={q.code} className="mt-3" />
                  ) : null}
                  <ul className="mt-3 grid gap-1.5">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === r.correct;
                      const isYours = oi === r.your;
                      return (
                        <li
                          // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                          key={oi}
                          className={cn(
                            "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-sm",
                            isCorrect && "border-success/40 bg-success-soft",
                            isYours &&
                              !isCorrect &&
                              "border-destructive/40 bg-danger-soft",
                          )}
                        >
                          <span className="font-medium text-muted-foreground">
                            {LETTERS[oi]}
                          </span>
                          <span className="min-w-0 flex-1 font-mono text-xs">
                            {opt}
                          </span>
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 font-medium text-success text-xs">
                              <CheckCircle2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                              Răspuns corect
                            </span>
                          ) : null}
                          {isYours ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 font-medium text-xs",
                                isCorrect ? "text-success" : "text-destructive",
                              )}
                            >
                              {isCorrect ? null : (
                                <XCircle
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              )}
                              Răspunsul tău
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                  {r.explanation ? (
                    <p className="mt-3 flex gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                      <Info
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {r.explanation}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  /* ---------- Recapitularea înainte de trimitere ---------- */
  const answeredCount = answers.filter((x) => x !== null).length;
  if (phase === "review") {
    const missing = total - answeredCount;
    return (
      <section
        aria-labelledby="quiz-check"
        className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xs sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="quiz-check"
            ref={headingRef}
            tabIndex={-1}
            className="font-semibold text-xl outline-none"
          >
            Verifică înainte de trimitere
          </h2>
          {timerBadge}
        </div>
        <p className="mt-1 text-muted-foreground">
          Ai răspuns la {answeredCount} din {total} întrebări. Apasă pe o
          întrebare ca să revii la ea.
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-2">
          {quiz.questions.map((q, i) => (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => {
                  setIndex(i);
                  setPhase("question");
                }}
                className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="font-medium tabular-nums">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{q.prompt}</span>
                {answers[i] !== null ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-success text-xs">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Răspuns {LETTERS[answers[i] ?? 0]}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1 text-warning text-xs">
                    <CircleAlert className="size-3.5" aria-hidden="true" />
                    Fără răspuns
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
        {missing > 0 ? (
          <p className="mt-4 text-muted-foreground text-sm">
            {missing === 1
              ? "O întrebare nu are răspuns și va fi considerată greșită."
              : `${missing} întrebări nu au răspuns și vor fi considerate greșite.`}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => submit(answers)} disabled={pending}>
            <Send /> {pending ? "Se verifică…" : "Trimite răspunsurile"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIndex(total - 1);
              setPhase("question");
            }}
          >
            <ArrowLeft /> Înapoi la întrebări
          </Button>
        </div>
      </section>
    );
  }

  /* ---------- O întrebare ---------- */
  const q = quiz.questions[index];
  const chosen = answers[index];
  return (
    <section
      aria-labelledby="quiz-question"
      className="mx-auto w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xs sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-muted-foreground text-sm">
          Întrebarea {index + 1} din {total}
        </p>
        {timerBadge}
      </div>
      <Progress
        value={((index + 1) / total) * 100}
        aria-label={`Întrebarea ${index + 1} din ${total}`}
        className="mt-3 [&_[data-slot=progress-track]]:h-1.5"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (index < total - 1) setIndex(index + 1);
          else setPhase("review");
        }}
        className="mt-6"
      >
        <fieldset>
          <legend className="w-full">
            <h2
              id="quiz-question"
              ref={headingRef}
              tabIndex={-1}
              className="font-semibold text-lg outline-none"
            >
              {q.prompt}
            </h2>
          </legend>
          {q.code ? <QuestionCode code={q.code} className="mt-4" /> : null}
          <div className="mt-5 grid gap-2">
            {q.options.map((opt, oi) => (
              <label
                // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                key={oi}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  chosen === oi
                    ? "border-primary bg-primary-soft"
                    : "hover:bg-muted/50",
                )}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  value={oi}
                  checked={chosen === oi}
                  onChange={() =>
                    setAnswers(answers.map((x, i) => (i === index ? oi : x)))
                  }
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary font-medium text-xs">
                  {LETTERS[oi]}
                </span>
                <span className="min-w-0 font-mono text-sm">{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ArrowLeft /> Înapoi
          </Button>
          <span className="text-muted-foreground text-xs">
            {answeredCount} din {total} cu răspuns
          </span>
          <Button type="submit">
            {index < total - 1 ? (
              <>
                Următoarea <ArrowRight />
              </>
            ) : (
              <>
                Verifică și trimite <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}

function IntroItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="font-medium">{children}</dd>
      </div>
    </div>
  );
}

"use client";

import {
  Archive,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleAlert,
  Clock,
  Info,
  ListChecks,
  Play,
  RotateCcw,
  Send,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  type GradeResult,
  submitQuiz,
} from "@/app/(student)/quiz/[id]/actions";
import { StatusBadge, XpBadge } from "@/components/common/status";
import { RichText } from "@/components/learning/rich-text";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { xpOutlook } from "@/lib/db/quiz-rules";
import {
  chosenOptions,
  isChosen,
  OPTION_LETTERS as LETTERS,
  toggleInMask,
} from "@/lib/quiz-answers";
import { cn } from "@/lib/utils";
import { QuestionCode } from "./question-code";

/** O întrebare fără răspunsul corect (singura formă trimisă în browser). */
export type PublicQuestion = {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  /** Mai multe răspunsuri corecte: răspunsul e masca variantelor bifate. */
  multi?: boolean;
};

export type QuizPlayerData = {
  id: string;
  title: string;
  description: string;
  /** „Recapitulare: lecțiile 3–4”, „Lecția 2” etc. */
  label: string;
  className?: string;
  timeLimitSec?: number;
  questions: PublicQuestion[];
  /** XP-ul maxim al quiz-ului (la prima încercare, după scor). */
  xp: number;
  /** Încercările făcute deja (dinainte de această vizită). */
  used: number;
  backHref: string;
  backLabel: string;
  /** Cel mai bun rezultat de până acum (null dacă nu l-a rezolvat). */
  best?: number | null;
  /** Arhivat de mentor: nu se mai poate începe (rezultatele rămân). */
  archived?: boolean;
};

type Phase = "intro" | "question" | "review" | "results";
type Graded = Extract<GradeResult, { ok: true }>;

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

  const used = quiz.used + attemptsHere;
  const anyMulti = quiz.questions.some((q) => q.multi);
  const outlook = xpOutlook(quiz.xp, used);

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
          r.reason === "unavailable"
            ? "Quiz-ul nu mai e disponibil."
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
        className="mx-auto w-full max-w-2xl cut bg-card p-6 sm:p-8"
      >
        <p className="font-bold font-heading text-muted-foreground text-xs uppercase tracking-[0.2em]">
          {quiz.label}
        </p>
        <h2
          id="quiz-intro"
          ref={headingRef}
          tabIndex={-1}
          className="mt-2 text-3xl leading-tight outline-none"
        >
          {quiz.title}
        </h2>
        <p className="mt-1 text-muted-foreground">{quiz.description}</p>
        {used > 0 ? (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge icon={CheckCircle2} tone="success">
              Rezolvat
            </StatusBadge>
            <span className="text-muted-foreground">
              {quiz.best != null
                ? `Cel mai bun rezultat: ${quiz.best} din ${total}.`
                : null}{" "}
              Îl poți repeta oricând.
            </span>
          </p>
        ) : null}

        <dl className="mt-6 grid gap-3 bg-muted/60 p-4 text-sm sm:grid-cols-2">
          <IntroItem icon={ListChecks} label="Întrebări">
            {anyMulti
              ? `${total}; la unele sunt mai multe răspunsuri corecte`
              : `${total}, cu un singur răspuns corect`}
          </IntroItem>
          <IntroItem icon={Clock} label="Timp">
            {quiz.timeLimitSec
              ? `${Math.round(quiz.timeLimitSec / 60)} minute în total`
              : "Fără limită de timp"}
          </IntroItem>
          <IntroItem icon={RotateCcw} label="Încercări">
            {used === 0
              ? "Prima încercare"
              : `Rezolvat de ${used === 1 ? "o dată" : `${used} ori`}`}
          </IntroItem>
          <IntroItem icon={Star} label="XP">
            {outlook.kind === "first"
              ? `Până la +${quiz.xp} XP, după câte răspunsuri corecte ai`
              : outlook.kind === "retake"
                ? "+1 XP pentru prima repetare (doar o dată)"
                : "Fără XP: l-ai repetat deja, acum e doar exersare"}
          </IntroItem>
          {quiz.className ? (
            <IntroItem icon={Info} label="Clasa">
              {quiz.className}
            </IntroItem>
          ) : null}
        </dl>

        {quiz.archived ? (
          <div className="mt-6 flex cut-sm items-start gap-3 bg-muted p-4">
            <Archive
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-bold font-heading uppercase tracking-wide">
                Arhivat de mentor
              </p>
              <p className="text-muted-foreground text-sm">
                Quiz-ul nu se mai poate rezolva.
                {used > 0 ? " Rezultatul tău de până acum rămâne salvat." : ""}
              </p>
              <Link
                href={quiz.backHref}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-3",
                )}
              >
                {quiz.backLabel}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="cta" onClick={start}>
              {used === 0 ? <Play /> : <RotateCcw />}
              {used === 0 ? "Începe quiz-ul" : "Repetă quiz-ul"}
            </Button>
            <p className="text-muted-foreground text-xs">
              Poți naviga între întrebări și îți poți schimba răspunsurile până
              trimiți.
            </p>
          </div>
        )}
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
          className="cut bg-card p-6 sm:p-8"
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
            {result.xp > 0 ? (
              <>
                <XpBadge amount={result.xp} />
                {used === 1
                  ? "pentru prima rezolvare"
                  : "pentru repetarea quiz-ului"}
              </>
            ) : (
              <span className="text-muted-foreground">
                {used <= 1
                  ? "Prea puține răspunsuri corecte pentru XP de data asta. Recitește lecția și repetă quiz-ul: prima repetare aduce 1 XP."
                  : "Ai repetat deja quiz-ul o dată, așa că de acum e doar exersare, fără XP."}
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={start}>
              <RotateCcw /> Repetă quiz-ul
            </Button>
            <Link
              href={quiz.backHref}
              className={buttonVariants({ variant: "outline" })}
            >
              {quiz.backLabel}
            </Link>
          </div>
          <p className="mt-3 text-muted-foreground text-xs">
            Rezultatul a fost salvat.
            {outlook.kind === "retake" ? " Prima repetare mai aduce 1 XP." : ""}
          </p>
        </section>

        <section aria-labelledby="quiz-review" className="grid gap-3">
          <h2 id="quiz-review" className="font-semibold text-base">
            Răspunsurile pe rând
          </h2>
          <ol className="stagger grid gap-3">
            {quiz.questions.map((q, i) => {
              const r = result.results[i];
              const multi = !!q.multi;
              return (
                <li key={q.id} className="cut-sm bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-medium">
                      <span className="text-muted-foreground">{i + 1}.</span>{" "}
                      <RichText text={q.prompt} />
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
                  {multi ? (
                    <p className="mt-2 text-muted-foreground text-xs">
                      Mai multe răspunsuri corecte: e corect doar dacă le-ai
                      bifat exact pe toate.
                    </p>
                  ) : null}
                  <ul className="mt-3 grid gap-1.5">
                    {q.options.map((opt, oi) => {
                      const isCorrect = isChosen(r.correct, multi, oi);
                      const isYours = isChosen(r.your, multi, oi);
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
                            <RichText text={opt} />
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
                      <RichText text={r.explanation} />
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
        className="mx-auto w-full max-w-2xl cut bg-card p-6 sm:p-8"
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
                <span className="min-w-0 flex-1 truncate">
                  <RichText text={q.prompt} />
                </span>
                {answers[i] !== null ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-success text-xs">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    Răspuns{" "}
                    {chosenOptions(answers[i], !!q.multi, q.options.length)
                      .map((k) => LETTERS[k])
                      .join(", ")}
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
          <Button
            variant="cta"
            onClick={() => submit(answers)}
            disabled={pending}
          >
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
  const multi = !!q.multi;
  /** Alege varianta (simplă) sau o bifează / debifează (mai multe răspunsuri). */
  function choose(oi: number) {
    const next = multi ? toggleInMask(chosen ?? 0, oi) || null : oi;
    setAnswers(answers.map((x, i) => (i === index ? next : x)));
  }
  return (
    <section
      aria-labelledby="quiz-question"
      className="mx-auto w-full max-w-2xl cut bg-card p-6 sm:p-8"
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
              <RichText text={q.prompt} />
            </h2>
          </legend>
          {q.code ? <QuestionCode code={q.code} className="mt-4" /> : null}
          {multi ? (
            <p className="mt-4 flex items-center gap-2 font-medium text-primary text-sm">
              <ListChecks className="size-4" aria-hidden="true" />
              Alege toate variantele corecte
            </p>
          ) : null}
          <div className="mt-5 grid gap-2">
            {q.options.map((opt, oi) => (
              <label
                // biome-ignore lint/suspicious/noArrayIndexKey: variantele au ordine fixă
                key={oi}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  isChosen(chosen, multi, oi)
                    ? "border-primary bg-primary-soft"
                    : "hover:bg-muted/50",
                )}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={`q-${q.id}`}
                  value={oi}
                  checked={isChosen(chosen, multi, oi)}
                  onChange={() => choose(oi)}
                  className="size-4 shrink-0 accent-primary"
                />
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-secondary font-medium text-xs">
                  {LETTERS[oi]}
                </span>
                <span className="min-w-0 font-mono text-sm">
                  <RichText text={opt} />
                </span>
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

"use client";

import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { UserAvatar } from "@/components/personalize/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { demoLiveQuiz } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { ANSWER_STYLES, AnswerShape } from "./answer-shape";

type Phase = "ready" | "question" | "reveal" | "final";

// Adversari simulați: punctele lor la fiecare întrebare.
const BOTS = [
  { name: "Maria", avatar: "🐼", points: [910, 780, 0, 850] },
  { name: "Luca", avatar: "🦖", points: [720, 0, 880, 640] },
  { name: "Sofia", avatar: "🦄", points: [0, 900, 690, 710] },
  { name: "David", avatar: "🐙", points: [650, 610, 0, 0] },
];

const MAX_POINTS = 1000;

/** Răspuns corect = 500–1000 puncte, în funcție de cât de repede răspunzi. */
function pointsFor(msLeft: number, totalMs: number) {
  return Math.round(MAX_POINTS / 2 + (MAX_POINTS / 2) * (msLeft / totalMs));
}

export function LiveQuizDemo() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [msLeft, setMsLeft] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState<number[]>([]);

  const question = demoLiveQuiz[index];
  const totalMs = question.seconds * 1000;
  const isLast = index === demoLiveQuiz.length - 1;

  function startQuestion(i: number) {
    setIndex(i);
    setSelected(null);
    setDeadline(Date.now() + demoLiveQuiz[i].seconds * 1000);
    setMsLeft(demoLiveQuiz[i].seconds * 1000);
    setPhase("question");
  }

  function answer(choice: number | null) {
    if (phase !== "question") return;
    const left = Math.max(0, deadline - Date.now());
    const correct = choice === question.correct;
    setMsLeft(left);
    setSelected(choice);
    setMyPoints((prev) => [...prev, correct ? pointsFor(left, totalMs) : 0]);
    setPhase("reveal");
  }

  function restart() {
    setMyPoints([]);
    startQuestion(0);
  }

  // Timer-ul: numără local, pornind de la termenul-limită (în versiunea live îl trimite serverul).
  useEffect(() => {
    if (phase !== "question") return;
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setMsLeft(left);
      if (left === 0) {
        clearInterval(id);
        setSelected(null);
        setMyPoints((prev) => [...prev, 0]);
        setPhase("reveal");
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, deadline]);

  // Tastele 1–4 aleg un răspuns.
  useEffect(() => {
    if (phase !== "question") return;
    function onKey(e: KeyboardEvent) {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) answer(n - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const answeredCount = myPoints.length;
  const leaderboard: Row[] = [
    { name: "Tu", avatar: null, isMe: true, total: sum(myPoints) },
    ...BOTS.map((b) => ({
      name: b.name,
      avatar: b.avatar,
      isMe: false,
      total: sum(b.points.slice(0, answeredCount)),
    })),
  ].sort((a, b) => b.total - a.total);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="bg-dots absolute inset-0 -z-10 opacity-60" />
      <header className="flex h-18 items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold font-heading text-xl"
        >
          <LogoMark />
          <span className="hidden sm:inline">Quiz demo</span>
        </Link>
        {phase === "question" || phase === "reveal" ? (
          <div className="flex gap-1.5">
            <span className="sr-only">
              Întrebarea {index + 1} din {demoLiveQuiz.length}
            </span>
            {demoLiveQuiz.map((q, i) => (
              <span
                key={q.prompt}
                aria-hidden="true"
                className={cn(
                  "h-3 w-8 rounded-full sm:w-12",
                  i < index || (i === index && phase === "reveal")
                    ? "bg-primary"
                    : i === index
                      ? "bg-primary/40"
                      : "bg-secondary",
                )}
              />
            ))}
          </div>
        ) : null}
        <span className="sticker flex items-center gap-2 rounded-full py-1 pr-4 pl-1 font-bold font-heading text-lg tabular-nums shadow-[0_3px_0_0_var(--border)]">
          <UserAvatar className="size-8 text-lg shadow-none" />⭐{" "}
          {sum(myPoints)}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-4 pb-8 sm:pt-6">
        {phase === "ready" && (
          <div className="sticker m-auto max-w-md animate-pop p-8 text-center">
            <Mascot className="mx-auto size-32 animate-float" />
            <h1 className="mt-4 font-bold text-4xl">Quiz: Python 🐍</h1>
            <p className="mt-3 font-semibold text-lg text-muted-foreground">
              {demoLiveQuiz.length} întrebări. Răspunde corect și repede ca să
              câștigi cât mai multe puncte! Poți folosi și tastele 1–4.
            </p>
            <Button
              size="lg"
              onClick={() => startQuestion(0)}
              className="mt-8 w-full"
            >
              Start! <ArrowRight />
            </Button>
          </div>
        )}

        {(phase === "question" || phase === "reveal") && (
          <div key={index} className="flex flex-1 animate-pop flex-col">
            <div className="sticker flex items-start justify-between gap-6 p-5 sm:p-6">
              <div className="min-w-0">
                <h1 className="text-balance font-bold text-2xl sm:text-3xl">
                  {question.prompt}
                </h1>
                {question.code ? (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-code px-5 py-4 font-mono text-code-foreground text-lg sm:text-xl">
                    {question.code}
                  </pre>
                ) : null}
              </div>
              <TimerRing
                fraction={msLeft / totalMs}
                seconds={Math.ceil(msLeft / 1000)}
              />
            </div>

            <div className="mt-6 grid flex-1 gap-4 sm:grid-cols-2">
              {question.answers.map((text, i) => {
                const style = ANSWER_STYLES[i];
                const isCorrect = i === question.correct;
                const isPicked = i === selected;
                const revealed = phase === "reveal";
                return (
                  <button
                    key={style.shape}
                    type="button"
                    onClick={() => answer(i)}
                    disabled={revealed}
                    aria-label={`${style.label}: ${text}`}
                    className={cn(
                      "flex min-h-20 items-center gap-4 rounded-3xl px-6 py-4 text-left font-bold font-heading text-xl text-white outline-none transition-all sm:min-h-28 sm:text-2xl",
                      style.bg,
                      style.shadow,
                      !revealed &&
                        "hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-foreground/50 active:translate-y-1 active:shadow-none",
                      revealed && !isCorrect && "scale-95 opacity-30",
                      revealed && isCorrect && "animate-wiggle",
                      revealed &&
                        isPicked &&
                        "ring-4 ring-foreground/70 ring-offset-4 ring-offset-background",
                    )}
                  >
                    <AnswerShape shape={style.shape} className="size-8" />
                    <span className="flex-1 font-mono">{text}</span>
                    {revealed && isCorrect ? (
                      <span className="grid size-10 place-items-center rounded-full bg-white/30">
                        <Check className="size-7" strokeWidth={3.5} />
                      </span>
                    ) : null}
                    {revealed && isPicked && !isCorrect ? (
                      <span className="grid size-10 place-items-center rounded-full bg-white/30">
                        <X className="size-7" strokeWidth={3.5} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {phase === "reveal" && (
              <RevealPanel
                points={myPoints[index] ?? 0}
                timedOut={selected === null}
                leaderboard={leaderboard}
                isLast={isLast}
                onNext={() =>
                  isLast ? setPhase("final") : startQuestion(index + 1)
                }
              />
            )}
          </div>
        )}

        {phase === "final" && (
          <FinalPodium leaderboard={leaderboard} onRestart={restart} />
        )}
      </main>
    </div>
  );
}

function TimerRing({
  fraction,
  seconds,
}: {
  fraction: number;
  seconds: number;
}) {
  const circumference = 2 * Math.PI * 15.5;
  const urgent = seconds <= 5;
  return (
    <div
      role="timer"
      aria-label={`${seconds} secunde rămase`}
      className={cn(
        "relative grid size-20 shrink-0 place-items-center rounded-full bg-card",
        urgent && seconds > 0 && "animate-wiggle",
      )}
    >
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r="15.5"
          className="fill-none stroke-secondary"
          strokeWidth="4"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-100 ease-linear",
            urgent ? "stroke-quiz-red" : "stroke-primary",
          )}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <span
        className={cn(
          "font-bold font-heading text-3xl tabular-nums",
          urgent && "text-quiz-red",
        )}
      >
        {seconds}
      </span>
    </div>
  );
}

type Row = {
  name: string;
  avatar: string | null;
  isMe: boolean;
  total: number;
};

function PlayerAvatar({ row, className }: { row: Row; className?: string }) {
  if (row.isMe) return <UserAvatar className={className} />;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-2xl",
        className,
      )}
    >
      {row.avatar}
    </span>
  );
}

function RevealPanel({
  points,
  timedOut,
  leaderboard,
  isLast,
  onNext,
}: {
  points: number;
  timedOut: boolean;
  leaderboard: Row[];
  isLast: boolean;
  onNext: () => void;
}) {
  const correct = points > 0;
  return (
    <div className="sticker mt-6 grid animate-pop gap-5 p-5 sm:grid-cols-[1fr_1.3fr] sm:p-6">
      <div className="flex flex-col items-start justify-center">
        <p className="text-5xl" aria-hidden="true">
          {correct ? "🎉" : timedOut ? "⏰" : "🙈"}
        </p>
        <p
          className={cn(
            "mt-2 font-bold font-heading text-3xl",
            correct ? "text-success" : "text-destructive",
          )}
        >
          {correct
            ? "Corect!"
            : timedOut
              ? "Timpul a expirat!"
              : "Ups, greșit!"}
        </p>
        <p className="mt-1 font-bold text-lg text-muted-foreground">
          {correct ? `+${points} puncte` : "Nu-i nimic, data viitoare!"}
        </p>
        <Button onClick={onNext} size="lg" className="mt-5">
          {isLast ? "Vezi podiumul 🏆" : "Următoarea"} <ArrowRight />
        </Button>
      </div>
      <ol className="grid gap-2">
        {leaderboard.map((row, i) => (
          <li
            key={row.name}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 px-3 py-1.5",
              row.isMe
                ? "border-primary bg-primary-soft"
                : "border-transparent bg-background",
            )}
          >
            <span className="w-6 text-center font-bold font-heading">
              {["🥇", "🥈", "🥉"][i] ?? i + 1}
            </span>
            <PlayerAvatar row={row} className="size-9 text-xl shadow-none" />
            <span className="flex-1 font-bold">{row.name}</span>
            <span className="font-bold font-heading tabular-nums">
              {row.total}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FinalPodium({
  leaderboard,
  onRestart,
}: {
  leaderboard: Row[];
  onRestart: () => void;
}) {
  const top = leaderboard.slice(0, 3);
  const myPlace = leaderboard.findIndex((r) => r.isMe) + 1;
  // Ordinea vizuală pe podium: locul 2, 1, 3.
  const podium = [top[1], top[0], top[2]].filter(Boolean);
  const steps = {
    1: { h: "h-44", bg: "bg-fun-yellow", medal: "🥇" },
    2: { h: "h-32", bg: "bg-fun-blue", medal: "🥈" },
    3: { h: "h-24", bg: "bg-fun-orange", medal: "🥉" },
  } as const;

  return (
    <div className="m-auto w-full max-w-xl animate-pop text-center">
      <p className="text-6xl" aria-hidden="true">
        {myPlace === 1 ? "🏆" : "🎉"}
      </p>
      <h1 className="mt-2 font-bold text-4xl sm:text-5xl">
        {myPlace === 1 ? "Ai câștigat!" : `Locul ${myPlace}! Bravo!`}
      </h1>
      <p className="mt-2 font-bold text-lg text-muted-foreground">
        Iată podiumul grupei.
      </p>

      <div className="mt-10 flex items-end justify-center gap-3">
        {podium.map((row) => {
          const place = (leaderboard.indexOf(row) + 1) as 1 | 2 | 3;
          const step = steps[place];
          return (
            <div
              key={row.name}
              className="flex w-28 animate-pop flex-col items-center gap-2"
              style={{ animationDelay: `${(4 - place) * 150}ms` }}
            >
              <PlayerAvatar row={row} className="size-14 text-3xl" />
              <span
                className={cn(
                  "font-bold font-heading text-lg",
                  row.isMe && "text-primary",
                )}
              >
                {row.name}
              </span>
              <span className="font-bold text-muted-foreground text-sm tabular-nums">
                ⭐ {row.total}
              </span>
              <div
                className={cn(
                  "grid w-full place-items-start justify-center rounded-t-3xl pt-3 text-4xl shadow-[inset_0_-6px_0_0_rgb(0_0_0/0.12)]",
                  step.h,
                  step.bg,
                )}
              >
                {step.medal}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button onClick={onRestart} variant="outline" size="lg">
          <RotateCcw /> Mai joc o dată
        </Button>
        <Link href="/elev" className={buttonVariants({ size: "lg" })}>
          Înapoi acasă 🏠
        </Link>
      </div>
    </div>
  );
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

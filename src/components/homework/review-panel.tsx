"use client";

import { CheckCircle2, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { reviewProblem, setHomeworkBonus } from "@/app/mentor/teme/actions";
import { ProblemStatusBadge, StatusBadge } from "@/components/common/status";
import { Field, FieldError } from "@/components/mentor-content/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ProblemAttempt, ProblemState } from "@/lib/db/homework";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ReviewProblem = {
  id: string;
  title: string;
  required: boolean;
  state: ProblemState;
  submissionId?: string;
  feedback?: string;
  attempts: ProblemAttempt[];
  /** Enunțul, randat pe server. */
  statement: React.ReactNode;
  /** Ultima variantă, cu evidențierea sintaxei (randată pe server). */
  latest?: React.ReactNode;
};

/** Evaluarea lucrării unui elev: fiecare problemă (acceptată / de refăcut) și bonusul temei. */
export function ReviewPanel({
  assignmentId,
  studentId,
  studentName,
  problems,
  maxBonus,
  bonus,
  note,
}: {
  assignmentId: string;
  studentId: string;
  studentName: string;
  problems: ReviewProblem[];
  maxBonus: number;
  bonus: number | null;
  note: string;
}) {
  return (
    <div className="grid gap-5">
      <ol className="grid gap-4">
        {problems.map((p, i) => (
          <ProblemReview
            key={p.id}
            problem={p}
            number={i + 1}
            studentName={studentName}
          />
        ))}
      </ol>
      <BonusForm
        assignmentId={assignmentId}
        studentId={studentId}
        max={maxBonus}
        initial={bonus}
        initialNote={note}
        anySubmitted={problems.some((p) => p.attempts.length > 0)}
      />
    </div>
  );
}

function ProblemReview({
  problem: p,
  number,
  studentName,
}: {
  problem: ReviewProblem;
  number: number;
  studentName: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState(p.feedback ?? "");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [showStatement, setShowStatement] = useState(false);
  const [older, setOlder] = useState(false);
  const statementId = useId();
  const olderId = useId();

  function review(status: "accepted" | "needs_changes") {
    if (!p.submissionId) return;
    const id = p.submissionId;
    startTransition(async () => {
      const r = await reviewProblem(id, { status, feedback });
      if (!r.ok) {
        setError(r.errors?.feedback ?? r.message);
        toast.error(r.message);
        return;
      }
      setError(undefined);
      toast.success(r.message);
      router.refresh();
    });
  }

  return (
    <li className="grid cut gap-4 bg-card p-5">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-xl leading-tight">
          <span className="text-muted-foreground">Problema {number} · </span>
          {p.title}
        </h2>
        <ProblemStatusBadge status={p.state} />
        {!p.required ? <StatusBadge>Opțională</StatusBadge> : null}
      </header>

      <div>
        <button
          type="button"
          aria-expanded={showStatement}
          aria-controls={statementId}
          onClick={() => setShowStatement((o) => !o)}
          className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              showStatement && "rotate-180",
            )}
            aria-hidden="true"
          />
          Enunțul
        </button>
        <div
          id={statementId}
          hidden={!showStatement}
          className="mt-2 grid gap-2 text-sm leading-relaxed"
        >
          {p.statement}
        </div>
      </div>

      {p.attempts.length === 0 ? (
        <p className="bg-muted/60 px-3 py-4 text-center text-muted-foreground text-sm">
          {studentName} nu a trimis încă această problemă.
        </p>
      ) : (
        <>
          <div className="grid gap-2">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">
                {p.attempts.length === 1
                  ? "Trimiterea"
                  : `Ultima trimitere (din ${p.attempts.length})`}
              </span>
              <span className="text-muted-foreground">
                {formatDateTime(p.attempts[0].at)}
              </span>
              {p.attempts[0].late ? (
                <StatusBadge tone="danger">După termen</StatusBadge>
              ) : null}
            </p>
            {p.latest}
          </div>

          {p.attempts.length > 1 ? (
            <div className="grid gap-2">
              <button
                type="button"
                aria-expanded={older}
                aria-controls={olderId}
                onClick={() => setOlder((o) => !o)}
                className="flex h-9 cut-xs items-center justify-between gap-3 bg-secondary px-3 font-bold font-heading text-xs uppercase tracking-wide hover:bg-muted"
              >
                Variantele anterioare ({p.attempts.length - 1})
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform",
                    older && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>
              <ol id={olderId} hidden={!older} className="grid gap-2">
                {p.attempts.slice(1).map((a, i) => (
                  <li key={a.id} className="grid gap-1">
                    <p className="text-muted-foreground text-xs">
                      Trimiterea {p.attempts.length - 1 - i} ·{" "}
                      {formatDateTime(a.at)}
                      {a.late ? " · după termen" : ""}
                    </p>
                    <pre className="max-h-56 overflow-auto bg-[#0d1117] p-3 font-mono text-[#e6edf3] text-sm leading-6">
                      {a.code}
                    </pre>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <Field
            id={`fb-${p.id}`}
            label="Feedback pentru elev"
            hint="Ce a făcut bine și ce poate îmbunătăți. Elevul îl vede lângă problemă."
          >
            <Textarea
              id={`fb-${p.id}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-24"
              maxLength={3000}
              aria-invalid={error ? true : undefined}
            />
          </Field>
          {error ? <FieldError>{error}</FieldError> : null}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="cta"
              disabled={pending}
              onClick={() => review("accepted")}
            >
              <CheckCircle2 /> Acceptă
            </Button>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => review("needs_changes")}
            >
              <RotateCcw /> Cere refacere
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

function BonusForm({
  assignmentId,
  studentId,
  max,
  initial,
  initialNote,
  anySubmitted,
}: {
  assignmentId: string;
  studentId: string;
  max: number;
  initial: number | null;
  initialNote: string;
  anySubmitted: boolean;
}) {
  const router = useRouter();
  const [bonus, setBonus] = useState(initial ?? 0);
  const [note, setNote] = useState(initialNote);
  const [pending, startTransition] = useTransition();

  return (
    <section aria-labelledby="bonus" className="grid cut gap-4 bg-xp-soft p-5">
      <div>
        <h2 id="bonus" className="flex items-center gap-2 text-xl">
          <Sparkles className="size-5 text-xp-foreground" aria-hidden="true" />
          Bonus de calitate pe toată tema
        </h2>
        <p className="text-sm">
          Între 0 și {max} XP, pentru calitatea întregii teme. Îl poți schimba
          oricând; se corectează, nu se adună.
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Bonusul de calitate"
        className="flex flex-wrap gap-1.5"
      >
        {Array.from({ length: max + 1 }, (_, n) => (
          <label
            // Valorile 0..max sunt fixe.
            // biome-ignore lint/suspicious/noArrayIndexKey: listă fixă de valori
            key={n}
            className={cn(
              "slant grid h-10 min-w-12 cursor-pointer place-items-center px-3 font-extrabold font-heading text-lg tabular-nums has-focus-visible:ring-3 has-focus-visible:ring-ring/70",
              bonus === n
                ? "bg-foreground text-background"
                : "bg-card hover:bg-muted",
            )}
          >
            <input
              type="radio"
              name="bonus"
              className="sr-only"
              checked={bonus === n}
              onChange={() => setBonus(n)}
            />
            {n === 0 ? "0" : `+${n}`}
          </label>
        ))}
      </div>
      <Field id="bonus-note" label="Comentariu pe toată tema" optional>
        <Textarea
          id="bonus-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          className="min-h-16 bg-card"
        />
      </Field>
      <Button
        className="w-fit"
        disabled={pending || !anySubmitted}
        onClick={() =>
          startTransition(async () => {
            const r = await setHomeworkBonus(assignmentId, studentId, {
              bonus,
              note,
            });
            if (r.ok) toast.success(r.message);
            else toast.error(r.message);
            router.refresh();
          })
        }
      >
        {pending ? "Se salvează…" : "Salvează bonusul"}
      </Button>
      {!anySubmitted ? (
        <p className="text-muted-foreground text-xs">
          Bonusul se dă după ce elevul trimite tema.
        </p>
      ) : null}
    </section>
  );
}

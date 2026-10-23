"use client";

import {
  CheckCircle2,
  Lock,
  MessageSquareQuote,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useId, useState } from "react";
import { reviewSubmission } from "@/app/mentor/teme/actions";
import { SubmissionStatusBadge, XpBadge } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionStatus } from "@/lib/data/types";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { describe, FieldError, FormMessage } from "./field";
import { useMentorForm } from "./use-mentor-form";

/** Exemple de feedback din PROJECT.md §7.4. */
const PHRASES = [
  "Excelentă treabă! Soluția ta este clară și ușor de înțeles.",
  "Efort bun! Încearcă să simplifici a doua parte.",
  "Te rog să verifici condiția buclei și să trimiți soluția corectată.",
];

type Decision = "reviewed" | "needs_changes";

const BONUS_VALUES = [0, 1, 2, 3, 4, 5];

export function ReviewForm({
  submissionId,
  assignmentId,
  studentName,
  status,
  submissionXp,
  currentBonus,
  maxBonusXp,
  allowResubmit,
  isResubmission,
  previousFeedback,
}: {
  submissionId: string;
  assignmentId: string;
  studentName: string;
  status: Exclude<SubmissionStatus, "not_started">;
  submissionXp: number;
  currentBonus?: number;
  maxBonusXp: number;
  allowResubmit: boolean;
  isResubmission: boolean;
  previousFeedback?: { text: string; at: string };
}) {
  const [feedback, setFeedback] = useState("");
  const [bonus, setBonus] = useState(currentBonus ?? 0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [result, setResult] = useState<Decision | null>(null);
  const bonusName = useId();
  const first = studentName.split(" ")[0];

  const { errors, pending, formRef, onSubmit, state } = useMentorForm(
    async (prev, fd) => {
      const res = await reviewSubmission(prev, fd);
      if (res.status === "success") setResult(fd.get("decision") as Decision);
      return res;
    },
    (fd) => setDecision(fd.get("decision") as Decision),
  );

  function insert(phrase: string) {
    setFeedback((f) => (f.trim() ? `${f.trimEnd()} ${phrase}` : phrase));
  }

  const shownStatus: Exclude<SubmissionStatus, "not_started"> =
    result ?? status;
  const max = Math.min(maxBonusXp, 5);

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="grid gap-5"
      aria-describedby="review-privacy"
    >
      <input type="hidden" name="submissionId" value={submissionId} />
      <input type="hidden" name="assignmentId" value={assignmentId} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-muted-foreground text-sm">Stare acum</p>
        <SubmissionStatusBadge status={shownStatus} />
      </div>

      {previousFeedback ? (
        <figure className="rounded-lg border bg-muted/40 p-3 text-sm">
          <figcaption className="mb-1.5 flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
            <MessageSquareQuote className="size-3.5" aria-hidden="true" />
            Feedback anterior · {formatDateTime(previousFeedback.at)}
          </figcaption>
          <blockquote>{previousFeedback.text}</blockquote>
        </figure>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="feedback">Feedback pentru {first}</Label>
        <Textarea
          {...describe("feedback", errors.feedback, "hint")}
          name="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-32"
          maxLength={2000}
          placeholder="Ce a mers bine și ce poate îmbunătăți."
        />
        {errors.feedback ? (
          <FieldError id="feedback-error">{errors.feedback}</FieldError>
        ) : (
          <p id="feedback-hint" className="text-muted-foreground text-xs">
            Obligatoriu când ceri corecturi. Scrie constructiv și concret.
          </p>
        )}
        <div className="grid gap-1.5">
          <p className="text-muted-foreground text-xs">Exemple de formulări</p>
          <ul className="flex flex-wrap gap-1.5">
            {PHRASES.map((p) => (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => insert(p)}
                  className="inline-flex max-w-full items-start gap-1 rounded-full border bg-card px-2.5 py-1 text-left text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={`Adaugă în feedback: ${p}`}
                >
                  <Plus
                    className="mt-0.5 size-3 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {p}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p
          id="review-privacy"
          className="flex items-start gap-1.5 text-muted-foreground text-xs"
        >
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Feedback-ul este privat: îl văd doar {first} și mentorii autorizați ai
          clasei.
        </p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-2 font-medium text-sm leading-none">
          Bonus de calitate
        </legend>
        <div className="grid grid-cols-6 gap-1 rounded-lg bg-muted p-1">
          {BONUS_VALUES.filter((n) => n <= max).map((n) => (
            <label
              key={n}
              className={cn(
                "grid h-9 cursor-pointer place-items-center rounded-md font-semibold text-sm tabular-nums transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                bonus === n
                  ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="bonusXp"
                value={n}
                checked={bonus === n}
                onChange={() => setBonus(n)}
                className="sr-only"
                aria-label={`${n} XP bonus`}
                id={`${bonusName}-${n}`}
              />
              {n}
            </label>
          ))}
        </div>
        {errors.bonusXp ? (
          <FieldError>{errors.bonusXp}</FieldError>
        ) : (
          <p className="text-muted-foreground text-xs">
            Răsplătește claritatea, efortul și atingerea obiectivelor temei, nu
            este o notă. Se acordă când marchezi trimiterea ca revizuită și îl
            poți actualiza după corecturi.
          </p>
        )}
      </fieldset>

      <div className="grid gap-2 rounded-lg border bg-card p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span>Trimitere validă</span>
          <XpBadge amount={2} />
        </div>
        <p className="-mt-1 text-muted-foreground text-xs">
          {submissionXp > 0
            ? "Deja acordat, o singură dată, la prima trimitere validă."
            : "Se acordă o singură dată, la prima trimitere validă."}
          {isResubmission
            ? " Retrimiterea nu adaugă alte XP pentru trimitere."
            : ""}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span>Bonus de calitate</span>
          <XpBadge amount={bonus} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-2 font-medium">
          <span>Total pentru această temă</span>
          <XpBadge amount={2 + bonus} />
        </div>
      </div>

      {errors.decision ? <FieldError>{errors.decision}</FieldError> : null}

      {result ? (
        <output className="flex items-start gap-2 rounded-lg bg-success-soft px-3 py-2.5 text-sm">
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-success"
            aria-hidden="true"
          />
          {result === "reviewed"
            ? `Gata. ${first} primește feedback-ul${bonus > 0 ? ` și +${bonus} XP bonus` : ""}.`
            : `Gata. ${first} primește o notificare și poate retrimite tema.`}
        </output>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="submit"
          name="decision"
          value="reviewed"
          size="lg"
          disabled={pending}
        >
          <CheckCircle2 aria-hidden="true" />
          {pending && decision === "reviewed"
            ? "Se salvează…"
            : "Marchează ca revizuită"}
        </Button>
        <Button
          type="submit"
          name="decision"
          value="needs_changes"
          size="lg"
          variant="outline"
          disabled={pending || !allowResubmit}
        >
          <RotateCcw aria-hidden="true" />
          {pending && decision === "needs_changes"
            ? "Se trimite…"
            : "Cere corecturi"}
        </Button>
      </div>
      {!allowResubmit ? (
        <p className="text-muted-foreground text-xs">
          Tema nu permite retrimiteri, deci nu poți cere corecturi.
        </p>
      ) : null}
      {state.status === "error" ? (
        <FormMessage message={state.message} />
      ) : null}
    </form>
  );
}

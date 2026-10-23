"use client";

import {
  Check,
  FileQuestion,
  type LucideIcon,
  MailCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";
import {
  type ReviewDecision,
  type ReviewState,
  reviewApplication,
} from "@/app/admin/aplicatii/actions";
import { FieldError } from "@/components/auth/form-fields";
import { ApplicationStatusBadge } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationStatus } from "@/lib/data/types";

type Applicant = { id: string; fullName: string; email: string };
type Decided = Extract<ReviewState, { status: "success" }>;

const INITIAL: ReviewState = { status: "idle" };

/** Acțiunile de verificare: aprobare, cerere de informații, respingere. */
export function ApplicationReview({
  applicant,
  status,
}: {
  applicant: Applicant;
  status: ApplicationStatus;
}) {
  const [decided, setDecided] = useState<Decided | null>(null);

  if (decided)
    return (
      <div className="grid gap-3" aria-live="polite">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Stare nouă:</span>
          <ApplicationStatusBadge status={decided.newStatus} />
        </div>
        <p className="text-sm">{OUTCOME[decided.decision]}</p>
        {decided.note ? (
          <blockquote className="whitespace-pre-line rounded-lg border-l-2 bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
            {decided.note}
          </blockquote>
        ) : null}
        <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground text-xs">
          Demo: decizia nu se salvează. La reîncărcarea paginii vezi din nou
          starea inițială.
        </p>
      </div>
    );

  return (
    <div className="grid gap-2">
      <DecisionDialog
        decision="approve"
        applicant={applicant}
        onDone={setDecided}
      />
      <DecisionDialog
        decision="request_info"
        applicant={applicant}
        onDone={setDecided}
        again={status === "needs_info"}
      />
      <DecisionDialog
        decision="reject"
        applicant={applicant}
        onDone={setDecided}
      />
    </div>
  );
}

const OUTCOME: Record<ReviewDecision, string> = {
  approve:
    "Contul de mentor a fost creat. Aplicantul primește pe email un link de activare unic, valabil 48 de ore.",
  request_info:
    "Aplicantul primește mesajul pe email. Aplicația rămâne deschisă până răspunde.",
  reject:
    "Aplicantul primește pe email decizia și motivul. Nu se creează niciun cont.",
};

const CONFIG: Record<
  ReviewDecision,
  {
    trigger: string;
    icon: LucideIcon;
    variant: "default" | "outline" | "destructive";
    submit: string;
    pending: string;
    note?: { label: string; hint: string; placeholder: string };
    toast: string;
  }
> = {
  approve: {
    trigger: "Aprobă",
    icon: ShieldCheck,
    variant: "default",
    submit: "Aprobă și trimite linkul",
    pending: "Se aprobă…",
    toast: "Aplicația a fost aprobată",
  },
  request_info: {
    trigger: "Cere informații",
    icon: FileQuestion,
    variant: "outline",
    submit: "Trimite cererea",
    pending: "Se trimite…",
    note: {
      label: "Mesaj pentru aplicant",
      hint: "Aplicantul primește mesajul pe email. Cere doar ce este necesar pentru verificare.",
      placeholder:
        "Ex.: Ne poți spune la ce școală sau organizație predai în prezent?",
    },
    toast: "Cererea de informații a fost trimisă",
  },
  reject: {
    trigger: "Respinge",
    icon: XCircle,
    variant: "destructive",
    submit: "Respinge aplicația",
    pending: "Se respinge…",
    note: {
      label: "Motivul respingerii",
      hint: "Motivul este trimis aplicantului pe email. Scrie-l clar și politicos.",
      placeholder:
        "Ex.: Momentan primim mentori doar din organizațiile partenere ale programului.",
    },
    toast: "Aplicația a fost respinsă",
  },
};

function DecisionDialog({
  decision,
  applicant,
  onDone,
  again,
}: {
  decision: ReviewDecision;
  applicant: Applicant;
  onDone: (d: Decided) => void;
  again?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  const c = CONFIG[decision];
  const Icon = c.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRound((r) => r + 1);
      }}
    >
      <DialogTrigger
        render={<Button variant={c.variant} className="w-full justify-start" />}
      >
        <Icon aria-hidden="true" />
        {again ? "Cere alte informații" : c.trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DecisionForm
          key={round}
          decision={decision}
          applicant={applicant}
          onDone={(d) => {
            setOpen(false);
            onDone(d);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function DecisionForm({
  decision,
  applicant,
  onDone,
}: {
  decision: ReviewDecision;
  applicant: Applicant;
  onDone: (d: Decided) => void;
}) {
  const c = CONFIG[decision];
  const [state, action, pending] = useActionState(
    async (prev: ReviewState, formData: FormData) => {
      const result = await reviewApplication(prev, formData);
      if (result.status === "success") {
        toast.success(c.toast, {
          description: `${applicant.fullName} va primi un email. Demo: decizia nu se salvează.`,
        });
        onDone(result);
      } else if (result.status === "error" && result.message)
        toast.error(result.message);
      return result;
    },
    INITIAL,
  );
  const failed = state.status === "error" ? state : null;
  const noteId = `note-${decision}`;

  return (
    <form action={action} noValidate className="grid gap-4">
      <input type="hidden" name="id" value={applicant.id} />
      <input type="hidden" name="decision" value={decision} />
      <DialogHeader>
        <DialogTitle>{TITLES[decision]}</DialogTitle>
        <p className="text-sm">
          Aplicant: <span className="font-medium">{applicant.fullName}</span>
        </p>
        <DialogDescription>
          {decision === "approve" ? (
            <>
              Se creează contul de mentor pentru{" "}
              <strong className="break-all font-medium text-foreground">
                {applicant.email}
              </strong>
              . Aplicantul primește pe email un link securizat de activare,
              valabil 48 de ore și care poate fi folosit o singură dată.
            </>
          ) : decision === "request_info" ? (
            <>
              Aplicația trece în starea „Informații necesare” până când
              aplicantul răspunde.
            </>
          ) : (
            <>
              Aplicația se închide și nu se creează niciun cont. Decizia nu
              poate fi anulată din această pagină.
            </>
          )}
        </DialogDescription>
      </DialogHeader>

      {decision === "approve" ? (
        <ul className="grid gap-2 rounded-lg border bg-muted/40 p-3.5 text-sm">
          {[
            "Mentorul își alege singur parola, din linkul de activare.",
            "Nu trimitem niciodată parole pe email.",
            "Se autentifică apoi cu adresa de email, fără username.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <Check
                className="mt-0.5 size-4 shrink-0 text-success"
                aria-hidden="true"
              />
              {t}
            </li>
          ))}
        </ul>
      ) : null}

      {c.note ? (
        <div className="grid gap-2">
          <Label htmlFor={noteId}>{c.note.label}</Label>
          <Textarea
            id={noteId}
            name="note"
            rows={4}
            maxLength={1000}
            required
            defaultValue={failed?.note}
            placeholder={c.note.placeholder}
            aria-invalid={failed?.noteError ? true : undefined}
            aria-describedby={
              failed?.noteError ? `${noteId}-error` : `${noteId}-hint`
            }
          />
          {failed?.noteError ? (
            <FieldError id={`${noteId}-error`}>{failed.noteError}</FieldError>
          ) : (
            <p id={`${noteId}-hint`} className="text-muted-foreground text-xs">
              {c.note.hint}
            </p>
          )}
        </div>
      ) : null}

      <DialogFooter>
        <DialogClose render={<Button variant="outline" type="button" />}>
          Anulează
        </DialogClose>
        <Button
          type="submit"
          variant={decision === "reject" ? "destructive" : "default"}
          disabled={pending}
        >
          {decision === "approve" ? <MailCheck aria-hidden="true" /> : null}
          {pending ? c.pending : c.submit}
        </Button>
      </DialogFooter>
    </form>
  );
}

const TITLES: Record<ReviewDecision, string> = {
  approve: "Aprobi această aplicație?",
  request_info: "Cere informații suplimentare",
  reject: "Respingi această aplicație?",
};

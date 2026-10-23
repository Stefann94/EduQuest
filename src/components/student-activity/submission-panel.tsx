"use client";

import {
  CheckCircle2,
  FileText,
  Link2,
  Lock,
  Send,
  Upload,
  X,
} from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { toast } from "sonner";
import {
  type SubmitAssignmentState,
  submitAssignment,
} from "@/app/(student)/teme/[id]/actions";
import { SubmissionStatusBadge } from "@/components/common/status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionStatus } from "@/lib/data/types";
import { formatFileSize } from "@/lib/format";
import { DemoNote, FieldError } from "./field-error";

const ACCEPT = ".py,.html,.css,.js,.java,.txt,.pdf,.zip";
const EXTENSIONS = ACCEPT.split(",");
const MAX_FILES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

const INITIAL: SubmitAssignmentState = { status: "idle" };

/** Zona de trimitere: formularul sau starea „Trimisă”, după caz. */
export function SubmissionPanel({
  assignmentId,
  state,
  allowResubmit,
  hasSubmission,
}: {
  assignmentId: string;
  state: SubmissionStatus;
  allowResubmit: boolean;
  hasSubmission: boolean;
}) {
  const canSubmitNow = state === "not_started" || state === "needs_changes";
  const [open, setOpen] = useState(canSubmitNow);
  // Cheia golește formularul când elevul vrea să trimită încă o variantă.
  const [round, setRound] = useState(0);

  if (!canSubmitNow && !allowResubmit) {
    return (
      <section className="flex gap-3 rounded-xl border bg-card p-5 shadow-xs">
        <Lock
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">Trimiterea este închisă</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Mentorul nu a permis retrimiterea acestei teme.
          </p>
        </div>
      </section>
    );
  }

  if (!open) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-5 shadow-xs">
        <div className="min-w-0">
          <h2 className="font-semibold">Vrei să îmbunătățești soluția?</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {state === "submitted"
              ? "Poți trimite o variantă nouă până când mentorul o revizuiește."
              : "Poți trimite o variantă îmbunătățită. Mentorul o poate revizui din nou."}
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Send /> Trimite o variantă nouă
        </Button>
      </section>
    );
  }

  return (
    <SubmissionForm
      key={round}
      assignmentId={assignmentId}
      isResubmission={hasSubmission}
      allowResubmit={allowResubmit}
      onAgain={() => setRound((r) => r + 1)}
    />
  );
}

function SubmissionForm({
  assignmentId,
  isResubmission,
  allowResubmit,
  onAgain,
}: {
  assignmentId: string;
  isResubmission: boolean;
  allowResubmit: boolean;
  onAgain: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: SubmitAssignmentState, formData: FormData) => {
      const result = await submitAssignment(assignmentId, prev, formData);
      if (result.status === "success")
        toast.success(
          result.isResubmission
            ? "Varianta nouă a fost trimisă"
            : "Tema a fost trimisă",
          { description: "Mentorul va primi o notificare." },
        );
      return result;
    },
    INITIAL,
  );
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  if (state.status === "success") {
    return (
      <section
        aria-labelledby="trimisa-title"
        className="rounded-xl border bg-card p-5 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="trimisa-title" className="font-semibold">
                {state.isResubmission
                  ? "Varianta nouă a fost trimisă"
                  : "Tema a fost trimisă"}
              </h2>
              <SubmissionStatusBadge status="submitted" />
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {state.atLabel}. Mentorul o va revizui și îți va lăsa feedback.
            </p>
            <ul className="mt-3 grid gap-1 text-sm">
              {state.summary.textChars > 0 ? (
                <li className="flex items-center gap-1.5">
                  <FileText
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  Text: {state.summary.textChars} caractere
                </li>
              ) : null}
              {state.summary.files.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <Upload
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
              {state.summary.link ? (
                <li className="flex min-w-0 items-center gap-1.5">
                  <Link2
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="truncate">{state.summary.link}</span>
                </li>
              ) : null}
            </ul>
            <p className="mt-3 text-sm">
              {state.submissionXp > 0
                ? "Primești +2 XP pentru trimitere. Bonusul de calitate vine după review."
                : "Retrimiterile nu mai aduc +2 XP, dar mentorul poate actualiza bonusul de calitate."}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <DemoNote>
            Demo: trimiterea se salvează după conectarea la baza de date.
          </DemoNote>
          {allowResubmit ? (
            <Button variant="outline" className="w-fit" onClick={onAgain}>
              Trimite altă variantă
            </Button>
          ) : null}
        </div>
      </section>
    );
  }

  const errors = state.status === "error" ? state.errors : {};
  const filesMessages = [...fileErrors, ...(errors.files ?? [])];

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const problems: string[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      if (!f.name.includes(".") || !EXTENSIONS.includes(ext))
        problems.push(`${f.name}: tip de fișier nepermis.`);
      else if (f.size === 0)
        problems.push(`${f.name}: fișierul este gol și nu poate fi trimis.`);
      else if (f.size > MAX_BYTES)
        problems.push(`${f.name}: depășește limita de 5 MB.`);
      else if (next.some((x) => x.name === f.name && x.size === f.size))
        problems.push(`${f.name}: fișierul este deja în listă.`);
      else if (next.length >= MAX_FILES)
        problems.push(`${f.name}: poți atașa cel mult ${MAX_FILES} fișiere.`);
      else next.push(f);
    }
    setFiles(next);
    setFileErrors(problems);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData();
    data.set("text", text);
    data.set("link", link.trim());
    data.set(
      "files",
      JSON.stringify(files.map((f) => ({ name: f.name, size: f.size }))),
    );
    startTransition(() => formAction(data));
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="form-title"
      className="rounded-xl border bg-card shadow-xs"
    >
      <div className="border-b px-5 py-4">
        <h2 id="form-title" className="font-semibold text-base">
          {isResubmission ? "Trimite o variantă nouă" : "Trimite tema"}
        </h2>
        <p className="text-muted-foreground text-sm">
          Lipește codul, atașează fișiere sau adaugă un link. Ajunge cel puțin
          unul dintre ele.
        </p>
      </div>

      <div className="grid gap-5 p-5">
        <div className="grid gap-2">
          <Label htmlFor="sub-text">Cod sau text</Label>
          <Textarea
            id="sub-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Lipește aici codul sau explică soluția…"
            spellCheck={false}
            className="min-h-40 font-mono text-[13px] md:text-[13px]"
            aria-invalid={errors.text ? true : undefined}
            aria-describedby={errors.text ? "sub-text-error" : undefined}
          />
          <FieldError id="sub-text-error" messages={errors.text} />
        </div>

        <div className="grid gap-2">
          <span id="sub-files-label" className="font-medium text-sm">
            Fișiere
          </span>
          <div>
            <input
              id="sub-files"
              type="file"
              multiple
              accept={ACCEPT}
              className="peer sr-only"
              aria-labelledby="sub-files-label"
              aria-describedby="sub-files-hint"
              aria-invalid={filesMessages.length > 0 ? true : undefined}
              disabled={files.length >= MAX_FILES}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="sub-files"
              className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3.5 font-medium text-sm transition-colors hover:bg-muted peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              <Upload className="size-4" aria-hidden="true" />
              Alege fișiere
            </label>
          </div>
          <p id="sub-files-hint" className="text-muted-foreground text-xs">
            .py, .html, .css, .js, .java, .txt, .pdf sau .zip · cel mult{" "}
            {MAX_FILES} fișiere, fiecare de până la 5 MB.
          </p>
          {files.length > 0 ? (
            <ul className="grid gap-2" aria-label="Fișiere selectate">
              {files.map((f) => (
                <li
                  key={`${f.name}-${f.size}`}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <FileText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                    {formatFileSize(Math.max(1, Math.round(f.size / 1024)))}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Elimină ${f.name}`}
                    onClick={() => {
                      setFiles(files.filter((x) => x !== f));
                      setFileErrors([]);
                    }}
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
          <FieldError id="sub-files-error" messages={filesMessages} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sub-link">Link (opțional)</Label>
          <Input
            id="sub-link"
            type="url"
            inputMode="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            autoComplete="off"
            aria-invalid={errors.link ? true : undefined}
            aria-describedby={errors.link ? "sub-link-error" : "sub-link-hint"}
          />
          {errors.link ? (
            <FieldError id="sub-link-error" messages={errors.link} />
          ) : (
            <p id="sub-link-hint" className="text-muted-foreground text-xs">
              De exemplu, un proiect pe GitHub Pages, Replit sau CodePen.
            </p>
          )}
        </div>

        <FieldError id="sub-form-error" messages={errors.form} />

        <div className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Button type="submit" disabled={pending}>
            <Send /> {pending ? "Se trimite…" : "Trimite"}
          </Button>
          <p className="text-muted-foreground text-xs">
            {isResubmission
              ? "Retrimiterile nu mai aduc +2 XP."
              : "+2 XP pentru o trimitere validă."}{" "}
            Demo: trimiterea se salvează după conectarea la baza de date.
          </p>
        </div>
      </div>
    </form>
  );
}

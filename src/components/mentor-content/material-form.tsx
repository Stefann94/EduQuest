"use client";

import { FileText, Lock, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveMaterial } from "@/app/mentor/materiale/actions";
import { Section } from "@/components/common/section";
import { MATERIAL_KIND } from "@/components/learning/material-kind";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MaterialKind, PublicationStatus } from "@/lib/data/types";
import { formatFileSize } from "@/lib/format";
import { Callout } from "./callout";
import type { MaterialDraft } from "./drafts";
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
import { useMentorForm } from "./use-mentor-form";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

const KINDS: MaterialKind[] = ["article", "pdf", "link", "video"];

export function MaterialForm({
  draft,
  classes,
  readOnlyReason,
}: {
  draft: MaterialDraft;
  classes: { id: string; name: string }[];
  /** Dacă e setat, formularul se afișează doar pentru citire. */
  readOnlyReason?: string;
}) {
  const [kind, setKind] = useState<MaterialKind>(draft.kind);
  const [classId, setClassId] = useState(draft.classId);
  const [language, setLanguage] = useState(draft.codeLanguage);
  const [status, setStatus] = useState<PublicationStatus>(draft.status);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string>();
  const keepFile = !file && !!draft.file;

  const { errors, pending, formRef, onSubmit, state } = useMentorForm(
    saveMaterial,
    (fd) => {
      // Fișierul nu se trimite prin Server Action (limita de 1 MB);
      // în demo trimitem doar numele și mărimea, ca să le validăm pe server.
      fd.delete("file");
      fd.set("fileName", file?.name ?? "");
      fd.set("fileSize", String(file?.size ?? 0));
      fd.set("keepFile", keepFile ? "1" : "0");
    },
  );

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFileError(undefined);
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Alege un fișier PDF.");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      setFileError(
        `Fișierul are ${formatFileSize(Math.round(f.size / 1024))}. Limita este 10 MB.`,
      );
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile({ name: f.name, size: f.size });
  }

  const classItems = [
    ...classes.map((c) => ({ value: c.id, label: c.name })),
    { value: GLOBAL, label: "Resursă globală (toți elevii)" },
  ];
  const isEdit = !!draft.id;
  const fileErr = fileError ?? errors.file;

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
                  placeholder="ex. Variabile și tipuri de date"
                  maxLength={120}
                />
              </Field>
              <Field
                id="description"
                label="Descriere scurtă"
                hint="Apare în lista de materiale. O frază sau două."
                error={errors.description}
              >
                <Textarea
                  {...describe(
                    "description",
                    errors.description,
                    "Apare în lista de materiale.",
                  )}
                  name="description"
                  defaultValue={draft.description}
                  className="min-h-20"
                  maxLength={300}
                />
              </Field>
              <Field
                id="topic"
                label="Temă"
                hint="Ajută elevii să găsească materialul, de exemplu „Python · Bucle”."
                error={errors.topic}
              >
                <Input
                  {...describe("topic", errors.topic, "hint")}
                  name="topic"
                  defaultValue={draft.topic}
                  placeholder="ex. Python · Bazele"
                  maxLength={60}
                />
              </Field>
            </div>
          </Section>

          <Section title="Conținut">
            <div className="grid gap-5">
              <FieldSet legend="Tipul materialului" error={errors.kind}>
                <ChoiceGroup
                  name="kind"
                  value={kind}
                  onChange={setKind}
                  className="grid-cols-2 sm:grid-flow-row sm:grid-cols-4"
                  choices={KINDS.map((k) => {
                    const Icon = MATERIAL_KIND[k].icon;
                    return {
                      value: k,
                      label: MATERIAL_KIND[k].label,
                      icon: <Icon aria-hidden="true" />,
                    };
                  })}
                />
              </FieldSet>

              {kind === "article" ? (
                <>
                  <Field
                    id="content"
                    label="Conținutul lecției"
                    hint="Lasă un rând liber între paragrafe. Rândurile care încep cu „- ” devin o listă."
                    error={errors.content}
                  >
                    <Textarea
                      {...describe("content", errors.content, "hint")}
                      name="content"
                      defaultValue={draft.content}
                      className="min-h-56"
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Field id="code" label="Exemplu de cod" optional>
                      <Textarea
                        id="code"
                        name="code"
                        defaultValue={draft.code}
                        spellCheck={false}
                        className="min-h-32 font-mono text-[13px]"
                        placeholder={'print("Salut!")'}
                      />
                    </Field>
                    <Field
                      id="codeLanguage"
                      label="Limbaj"
                      error={errors.codeLanguage}
                    >
                      <SelectField
                        id="codeLanguage"
                        name="codeLanguage"
                        value={language}
                        onValueChange={setLanguage}
                        items={[...CODE_LANGUAGES]}
                        error={errors.codeLanguage}
                      />
                    </Field>
                  </div>
                </>
              ) : null}

              {kind === "pdf" ? (
                <div className="grid gap-2">
                  <label
                    htmlFor="file"
                    className="font-medium text-sm leading-none"
                  >
                    Fișier PDF
                  </label>
                  {keepFile && draft.file ? (
                    <p className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                      <FileText
                        className="size-4 text-destructive"
                        aria-hidden="true"
                      />
                      <span className="font-medium">{draft.file.name}</span>
                      <span className="text-muted-foreground">
                        {formatFileSize(draft.file.sizeKb)} · fișierul actual
                      </span>
                    </p>
                  ) : null}
                  <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-4">
                    <Upload
                      className="size-5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      {...describe("file", fileErr, "hint")}
                      type="file"
                      name="file"
                      accept=".pdf,application/pdf"
                      onChange={pickFile}
                      className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                  {fileErr ? (
                    <FieldError id="file-error">{fileErr}</FieldError>
                  ) : (
                    <p id="file-hint" className="text-muted-foreground text-xs">
                      {file
                        ? `Ales: ${file.name} (${formatFileSize(Math.max(1, Math.round(file.size / 1024)))}).`
                        : keepFile
                          ? "Alege un fișier nou doar dacă vrei să îl înlocuiești. Doar PDF, cel mult 10 MB."
                          : "Doar PDF, cel mult 10 MB."}
                    </p>
                  )}
                </div>
              ) : null}

              {kind === "link" || kind === "video" ? (
                <Field
                  id="url"
                  label={kind === "video" ? "Linkul videoclipului" : "Link"}
                  hint={
                    kind === "video"
                      ? "De exemplu un videoclip de pe YouTube sau Vimeo."
                      : "Pagina externă pe care o recomanzi elevilor."
                  }
                  error={errors.url}
                >
                  <Input
                    {...describe("url", errors.url, "hint")}
                    type="url"
                    name="url"
                    inputMode="url"
                    defaultValue={draft.url}
                    placeholder="https://"
                  />
                </Field>
              ) : null}
            </div>
          </Section>
        </div>

        <div className="grid gap-6 lg:sticky lg:top-20">
          <Section title="Publicare">
            <div className="grid gap-5">
              <Field
                id="classId"
                label="Unde apare"
                hint="Resursele globale sunt disponibile tuturor elevilor platformei."
                error={errors.classId}
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
              <Field
                id="tags"
                label="Etichete"
                optional
                hint="Separate prin virgulă, de exemplu: bucle, for, exerciții."
                error={errors.tags}
              >
                <Input
                  {...describe("tags", errors.tags, "hint")}
                  name="tags"
                  defaultValue={draft.tags}
                  placeholder="bucle, for"
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
                      description: "Doar tu îl vezi.",
                    },
                    {
                      value: "published",
                      label: "Publicat",
                      description:
                        classId === GLOBAL
                          ? "Vizibil pentru toți elevii."
                          : "Elevii clasei îl văd și primesc o notificare.",
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
                  : isEdit
                    ? "Salvează modificările"
                    : status === "published"
                      ? "Publică materialul"
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

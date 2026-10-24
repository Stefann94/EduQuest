"use client";

import { FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveItem } from "@/app/mentor/materiale/actions";
import { MATERIAL_KIND } from "@/components/learning/material-kind";
import {
  Field,
  FieldError,
  SelectField,
} from "@/components/mentor-content/field";
import { CODE_LANGUAGES } from "@/components/mentor-content/form-state";
import {
  AddButton,
  ItemControls,
  move,
  newKey,
} from "@/components/mentor-content/list-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ItemKind, LessonItem } from "@/lib/content/items";
import type { ContentBlock } from "@/lib/content/schema";
import { formatFileSize } from "@/lib/format";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BlocksEditor, cleanBlocks } from "./blocks-editor";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

type Example = { key: string; input: string; output: string; note: string };

/** Formularul unui material (nou sau existent), după tipul lui. */
export function ItemEditor({
  lessonId,
  item,
  kind,
  onDone,
}: {
  lessonId: string;
  item?: LessonItem;
  kind: ItemKind;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(item?.title ?? "");
  const [published, setPublished] = useState(item?.published ?? false);

  // Conținutul, pe tipuri (doar cel al tipului ales se trimite).
  const c = item?.content as Record<string, unknown> | undefined;
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    item?.kind === "article"
      ? item.content.blocks
      : [{ type: "paragraph", text: "" }],
  );
  const [url, setUrl] = useState(String(c?.url ?? ""));
  const [note, setNote] = useState(String(c?.note ?? ""));
  const [pdf, setPdf] = useState(item?.kind === "pdf" ? item.content : null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState(() => {
    const p = item?.kind === "problem" ? item.content : undefined;
    return {
      statement: p?.statement ?? "",
      constraints: (p?.constraints ?? []).join("\n"),
      hint: p?.hint ?? "",
      starter: p?.starter ?? "",
      language: p?.language ?? "python",
      solution: p?.solution ?? "",
      output: p?.output ?? "",
      explanation: p?.explanation ?? "",
    };
  });
  const [examples, setExamples] = useState<Example[]>(() =>
    (item?.kind === "problem" ? item.content.examples : []).map((e, i) => ({
      key: `ex-${i}`,
      input: e.input,
      output: e.output,
      note: e.note ?? "",
    })),
  );

  async function upload(file: File) {
    if (
      !file.name.toLowerCase().endsWith(".pdf") ||
      file.type !== "application/pdf"
    ) {
      setErrors({ "content.path": "Alege un fișier PDF." });
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setErrors({ "content.path": "Fișierul are mai mult de 20 MB." });
      return;
    }
    setUploading(true);
    setErrors({});
    const safe = file.name
      .normalize("NFD")
      .replace(/[^\w.-]+/g, "-")
      .toLowerCase();
    const path = `${lessonId}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.storage
      .from("materials")
      .upload(path, file, { contentType: "application/pdf" });
    setUploading(false);
    if (error) {
      setErrors({
        "content.path": "Fișierul nu s-a putut încărca. Încearcă din nou.",
      });
      return;
    }
    setPdf({
      path,
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
  }

  function content(): unknown {
    switch (kind) {
      case "article":
        return { blocks: cleanBlocks(blocks) };
      case "pdf":
        return pdf ?? {};
      case "link":
      case "video":
        return { url: url.trim(), note: note.trim() || undefined };
      case "problem":
        return {
          statement: problem.statement.trim(),
          examples: examples
            .filter((e) => e.input.trim() || e.output.trim())
            .map((e) => ({
              input: e.input,
              output: e.output,
              note: e.note.trim() || undefined,
            })),
          constraints: problem.constraints
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
          hint: problem.hint.trim() || undefined,
          starter: problem.starter || undefined,
          language: problem.language,
          solution: problem.solution,
          output: problem.output || undefined,
          explanation: problem.explanation.trim() || undefined,
        };
    }
  }

  function save() {
    startTransition(async () => {
      const r = await saveItem(lessonId, item?.id ?? null, {
        kind,
        title,
        published,
        content: content(),
      });
      if (!r.ok) {
        setErrors(r.errors ?? {});
        toast.error(r.message);
        return;
      }
      toast.success(r.message);
      router.refresh();
      onDone();
    });
  }

  const err = (k: string) => errors[k];
  const set = (patch: Partial<typeof problem>) =>
    setProblem((p) => ({ ...p, ...patch }));

  return (
    <div className="grid gap-5 border-2 border-primary/40 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold font-heading text-sm uppercase tracking-wider">
          {item ? "Editează" : "Material nou"} · {MATERIAL_KIND[kind].label}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            id="item-published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <label htmlFor="item-published">
            {published ? "Vizibil elevilor" : "Ascuns elevilor"}
          </label>
        </div>
      </div>

      <Field id="item-title" label="Titlu" error={err("title")}>
        <Input
          id="item-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={160}
          aria-invalid={err("title") ? true : undefined}
        />
      </Field>

      {kind === "article" ? (
        <div className="grid gap-2">
          <p className="font-medium text-sm">Conținutul lecției</p>
          <BlocksEditor initial={blocks} onChange={setBlocks} errors={errors} />
          {err("content.blocks") ? (
            <FieldError>{err("content.blocks")}</FieldError>
          ) : null}
        </div>
      ) : null}

      {kind === "pdf" ? (
        <div className="grid gap-2">
          <p className="font-medium text-sm">Fișierul PDF</p>
          {pdf ? (
            <p className="flex items-center gap-2 bg-muted/60 px-3 py-2 text-sm">
              <FileText
                className="size-4 text-destructive"
                aria-hidden="true"
              />
              <span className="font-medium">{pdf.name}</span>
              <span className="text-muted-foreground">
                {formatFileSize(pdf.sizeKb)}
              </span>
            </p>
          ) : null}
          <label className="flex cursor-pointer items-center gap-3 border border-dashed px-4 py-4 text-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/70">
            <Upload
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span>
              {uploading
                ? "Se încarcă…"
                : pdf
                  ? "Alege alt fișier"
                  : "Alege un fișier PDF"}
              <span className="block text-muted-foreground text-xs">
                Doar PDF, cel mult 20 MB.
              </span>
            </span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {err("content.path") ? (
            <FieldError>{err("content.path")}</FieldError>
          ) : null}
        </div>
      ) : null}

      {kind === "link" || kind === "video" ? (
        <div className="grid gap-4">
          <Field
            id="item-url"
            label={kind === "video" ? "Linkul videoclipului" : "Link"}
            error={err("content.url")}
            hint={
              kind === "video"
                ? "De exemplu un videoclip de pe YouTube."
                : "Pagina pe care o recomanzi."
            }
          >
            <Input
              id="item-url"
              type="url"
              inputMode="url"
              value={url}
              placeholder="https://"
              onChange={(e) => setUrl(e.target.value)}
              aria-invalid={err("content.url") ? true : undefined}
            />
          </Field>
          <Field
            id="item-note"
            label="De ce merită deschis"
            optional
            error={err("content.note")}
          >
            <Textarea
              id="item-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
          </Field>
        </div>
      ) : null}

      {kind === "problem" ? (
        <div className="grid gap-4">
          <Field
            id="p-statement"
            label="Enunț"
            error={err("content.statement")}
            hint="Lasă un rând liber între paragrafe. Poți scrie `cod` și **important**."
          >
            <Textarea
              id="p-statement"
              value={problem.statement}
              onChange={(e) => set({ statement: e.target.value })}
              className="min-h-28"
            />
          </Field>

          <div className="grid gap-3">
            <p className="font-medium text-sm">Exemple</p>
            {examples.map((ex, i) => (
              <div key={ex.key} className="grid gap-2 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-heading text-xs uppercase tracking-wider">
                    Exemplul {i + 1}
                  </span>
                  <ItemControls
                    label={`exemplul ${i + 1}`}
                    index={i}
                    count={examples.length}
                    onMove={(from, to) => setExamples(move(examples, from, to))}
                    onRemove={(idx) =>
                      setExamples(examples.filter((_, j) => j !== idx))
                    }
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field id={`${ex.key}-in`} label="Intrare">
                    <Textarea
                      id={`${ex.key}-in`}
                      value={ex.input}
                      spellCheck={false}
                      onChange={(e) =>
                        setExamples(
                          examples.map((x, j) =>
                            j === i ? { ...x, input: e.target.value } : x,
                          ),
                        )
                      }
                      className="min-h-16 font-mono text-sm"
                    />
                  </Field>
                  <Field id={`${ex.key}-out`} label="Ieșire">
                    <Textarea
                      id={`${ex.key}-out`}
                      value={ex.output}
                      spellCheck={false}
                      onChange={(e) =>
                        setExamples(
                          examples.map((x, j) =>
                            j === i ? { ...x, output: e.target.value } : x,
                          ),
                        )
                      }
                      className="min-h-16 font-mono text-sm"
                    />
                  </Field>
                </div>
                <Field id={`${ex.key}-note`} label="Explicație" optional>
                  <Input
                    id={`${ex.key}-note`}
                    value={ex.note}
                    onChange={(e) =>
                      setExamples(
                        examples.map((x, j) =>
                          j === i ? { ...x, note: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
            ))}
            <AddButton
              onClick={() =>
                setExamples([
                  ...examples,
                  { key: newKey("ex"), input: "", output: "", note: "" },
                ])
              }
            >
              Adaugă un exemplu
            </AddButton>
          </div>

          <Field
            id="p-constraints"
            label="Restricții"
            optional
            hint="Câte una pe rând."
          >
            <Textarea
              id="p-constraints"
              value={problem.constraints}
              onChange={(e) => set({ constraints: e.target.value })}
              className="min-h-16"
            />
          </Field>
          <Field id="p-hint" label="Indiciu" optional>
            <Input
              id="p-hint"
              value={problem.hint}
              onChange={(e) => set({ hint: e.target.value })}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Field
              id="p-starter"
              label="Cod de pornire"
              optional
              hint="Apare în „Încearcă singur”."
            >
              <Textarea
                id="p-starter"
                value={problem.starter}
                spellCheck={false}
                onChange={(e) => set({ starter: e.target.value })}
                className="min-h-20 font-mono text-sm"
              />
            </Field>
            <Field id="p-lang" label="Limbaj">
              <SelectField
                id="p-lang"
                name="p-lang"
                value={problem.language}
                onValueChange={(language) => set({ language })}
                items={[...CODE_LANGUAGES]}
              />
            </Field>
          </div>
          <Field
            id="p-solution"
            label="Rezolvarea"
            error={err("content.solution")}
            hint="Ascunsă elevilor până apasă „Arată soluția”."
          >
            <Textarea
              id="p-solution"
              value={problem.solution}
              spellCheck={false}
              onChange={(e) => set({ solution: e.target.value })}
              className="min-h-36 font-mono text-sm"
            />
          </Field>
          <Field id="p-output" label="Ce afișează rezolvarea" optional>
            <Textarea
              id="p-output"
              value={problem.output}
              spellCheck={false}
              onChange={(e) => set({ output: e.target.value })}
              className="min-h-16 font-mono text-sm"
            />
          </Field>
          <Field
            id="p-explanation"
            label="Cum funcționează"
            optional
            hint="Explicația rezolvării, pe pași."
          >
            <Textarea
              id="p-explanation"
              value={problem.explanation}
              onChange={(e) => set({ explanation: e.target.value })}
              className="min-h-24"
            />
          </Field>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="cta"
          onClick={save}
          disabled={pending || uploading}
        >
          {pending
            ? "Se salvează…"
            : item
              ? "Salvează materialul"
              : "Adaugă materialul"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Renunță
        </Button>
      </div>
    </div>
  );
}

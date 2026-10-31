"use client";

import { FileCode2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Field,
  FieldError,
  SelectField,
} from "@/components/mentor-content/field";
import { CODE_LANGUAGES } from "@/components/mentor-content/form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { defaultFileName, type SolutionFile } from "@/lib/content/items";
import { cn } from "@/lib/utils";

const MAX_FILES = 8;

/** Ghicim limbajul după extensie, ca mentorul să nu-l aleagă de fiecare dată. */
function languageOf(name: string, fallback: string) {
  const ext = name.split(".").at(-1)?.toLowerCase();
  const map: Record<string, string> = {
    py: "python",
    html: "html",
    css: "css",
    js: "javascript",
    java: "java",
    json: "json",
    txt: "text",
  };
  return (ext && map[ext]) || fallback;
}

/**
 * Fișierele rezolvării unei probleme, ca taburi: o problemă poate avea mai multe fișiere
 * (ex. main.py și date.json), iar elevul le vede pe toate, tot ca taburi.
 */
export function SolutionFilesEditor({
  files,
  onChange,
  errors,
}: {
  files: SolutionFile[];
  onChange: (files: SolutionFile[]) => void;
  errors: Record<string, string>;
}) {
  const [active, setActive] = useState(0);
  const current = files[Math.min(active, files.length - 1)];
  const i = Math.min(active, files.length - 1);
  const patch = (p: Partial<SolutionFile>) =>
    onChange(files.map((f, j) => (j === i ? { ...f, ...p } : f)));

  function add() {
    const taken = new Set(files.map((f) => f.name));
    let n = files.length + 1;
    while (taken.has(`fisier${n}.txt`)) n++;
    onChange([
      ...files,
      { name: `fisier${n}.txt`, language: "text", code: "" },
    ]);
    setActive(files.length);
  }

  function remove() {
    onChange(files.filter((_, j) => j !== i));
    setActive(Math.max(0, i - 1));
  }

  const err = (k: string) => errors[`content.files.${i}.${k}`];

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-sm">
          Rezolvarea{" "}
          <span className="font-normal text-muted-foreground">
            (ascunsă elevilor până apasă „Arată soluția”)
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={files.length >= MAX_FILES}
        >
          <Plus /> Încă un fișier
        </Button>
      </div>

      <div
        role="tablist"
        aria-label="Fișierele rezolvării"
        className="flex flex-wrap gap-1"
      >
        {files.map((f, j) => (
          <button
            // Fișierele se pot redenumi, deci poziția e identitatea tabului.
            // biome-ignore lint/suspicious/noArrayIndexKey: ordinea fișierelor e fixă
            key={j}
            type="button"
            role="tab"
            aria-selected={j === i}
            onClick={() => setActive(j)}
            className={cn(
              "flex h-9 items-center gap-1.5 px-3 font-mono text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/70",
              j === i
                ? "bg-foreground text-background"
                : "bg-secondary hover:bg-muted",
              Object.keys(errors).some((k) =>
                k.startsWith(`content.files.${j}.`),
              ) && "ring-2 ring-destructive",
            )}
          >
            <FileCode2 className="size-3.5" aria-hidden="true" />
            {f.name || "fără nume"}
          </button>
        ))}
      </div>

      {current ? (
        <div className="grid gap-3 bg-muted/40 p-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
            <Field id="sol-name" label="Numele fișierului" error={err("name")}>
              <Input
                id="sol-name"
                value={current.name}
                placeholder={defaultFileName(current.language)}
                onChange={(e) =>
                  patch({
                    name: e.target.value,
                    language: languageOf(e.target.value, current.language),
                  })
                }
                className="font-mono"
                aria-invalid={err("name") ? true : undefined}
              />
            </Field>
            <Field id="sol-lang" label="Limbaj">
              <SelectField
                id="sol-lang"
                name="sol-lang"
                value={current.language}
                onValueChange={(language) => patch({ language })}
                items={[...CODE_LANGUAGES]}
              />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={files.length <= 1}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 /> Șterge fișierul
            </Button>
          </div>
          <Field
            id="sol-code"
            label="Conținutul fișierului"
            error={err("code")}
          >
            <Textarea
              id="sol-code"
              value={current.code}
              spellCheck={false}
              onChange={(e) => patch({ code: e.target.value })}
              className="min-h-40 font-mono text-sm"
              aria-invalid={err("code") ? true : undefined}
            />
          </Field>
        </div>
      ) : null}
      {errors["content.files"] ? (
        <FieldError>{errors["content.files"]}</FieldError>
      ) : null}
    </div>
  );
}

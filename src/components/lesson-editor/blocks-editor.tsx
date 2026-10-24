"use client";

import {
  Code2,
  Heading2,
  Lightbulb,
  List,
  ListChecks,
  Lock,
  Pilcrow,
} from "lucide-react";
import { useState } from "react";
import { Field, SelectField } from "@/components/mentor-content/field";
import { CODE_LANGUAGES } from "@/components/mentor-content/form-state";
import {
  ItemControls,
  move,
  newKey,
} from "@/components/mentor-content/list-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CALLOUT_TONES, type ContentBlock } from "@/lib/content/schema";

type Keyed = { key: string; block: ContentBlock };

const NEW: Record<string, () => ContentBlock> = {
  heading: () => ({ type: "heading", text: "" }),
  paragraph: () => ({ type: "paragraph", text: "" }),
  code: () => ({ type: "code", language: "python", code: "" }),
  list: () => ({ type: "list", items: [""] }),
  callout: () => ({ type: "callout", tone: "tip", text: "" }),
  keypoints: () => ({ type: "keypoints", items: [""] }),
};

const ADD = [
  { type: "heading", label: "Titlu", icon: Heading2 },
  { type: "paragraph", label: "Paragraf", icon: Pilcrow },
  { type: "code", label: "Cod", icon: Code2 },
  { type: "list", label: "Listă", icon: List },
  { type: "callout", label: "Casetă", icon: Lightbulb },
  { type: "keypoints", label: "De reținut", icon: ListChecks },
] as const;

const LABEL: Record<ContentBlock["type"], string> = {
  heading: "Titlu",
  paragraph: "Paragraf",
  code: "Cod",
  list: "Listă",
  note: "Notă",
  callout: "Casetă",
  table: "Tabel",
  compare: "Greșit / corect",
  trace: "Urmărire pas cu pas",
  boxes: "Variabile ca niște cutii",
  machine: "Funcția ca o mașinărie",
  chars: "Literele unui șir",
  cards: "Carduri",
  steps: "Pași",
  exercise: "Exercițiu",
  keypoints: "De reținut",
};

const TONES: Record<(typeof CALLOUT_TONES)[number], string> = {
  tip: "Sfat",
  info: "Informație",
  warning: "Atenție",
  analogy: "Analogie",
  remember: "De ținut minte",
};

/**
 * Conținutul unei lecții scrise, ca o listă de blocuri (titlu, paragraf, cod, listă…).
 * Fonturile și culorile vin automat după tip. Blocurile speciale create din cod
 * (tabele, urmăriri pas cu pas etc.) se păstrează așa cum sunt.
 */
export function BlocksEditor({
  initial,
  onChange,
  errors,
}: {
  initial: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  errors: Record<string, string>;
}) {
  const [list, setList] = useState<Keyed[]>(() =>
    initial.map((block, i) => ({ key: `b-${i}`, block })),
  );

  function update(next: Keyed[]) {
    setList(next);
    onChange(next.map((k) => k.block));
  }
  const patch = (i: number, block: ContentBlock) =>
    update(list.map((k, j) => (j === i ? { ...k, block } : k)));

  return (
    <div className="grid gap-3">
      {list.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Lecția e goală. Adaugă primul bloc: un titlu sau un paragraf.
        </p>
      ) : null}
      <ol className="grid gap-3">
        {list.map(({ key, block }, i) => (
          <li
            key={key}
            className="grid gap-3 border-l-4 border-l-primary/40 bg-muted/40 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold font-heading text-xs uppercase tracking-wider">
                {i + 1}. {LABEL[block.type]}
              </span>
              <ItemControls
                label={`blocul ${i + 1}`}
                index={i}
                count={list.length}
                onMove={(from, to) => update(move(list, from, to))}
                onRemove={(idx) => update(list.filter((_, j) => j !== idx))}
              />
            </div>
            <BlockFields
              id={`b-${key}`}
              block={block}
              onChange={(b) => patch(i, b)}
              error={
                Object.entries(errors).find(([k]) =>
                  k.startsWith(`content.blocks.${i}`),
                )?.[1]
              }
            />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        {ADD.map((a) => (
          <Button
            key={a.type}
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              update([...list, { key: newKey("b"), block: NEW[a.type]() }])
            }
          >
            <a.icon aria-hidden="true" /> {a.label}
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        În text poți scrie `cod` (între apostrofuri întoarse) și **important**
        (între două steluțe).
      </p>
    </div>
  );
}

function BlockFields({
  id,
  block: b,
  onChange,
  error,
}: {
  id: string;
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  error?: string;
}) {
  switch (b.type) {
    case "heading":
      return (
        <Field id={id} label="Titlul secțiunii" error={error}>
          <Input
            id={id}
            value={b.text}
            onChange={(e) => onChange({ ...b, text: e.target.value })}
          />
        </Field>
      );
    case "paragraph":
    case "note":
      return (
        <Field id={id} label="Text" error={error}>
          <Textarea
            id={id}
            value={b.text}
            onChange={(e) => onChange({ ...b, text: e.target.value })}
            className="min-h-24"
          />
        </Field>
      );
    case "code":
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Field id={`${id}-title`} label="Eticheta" optional>
              <Input
                id={`${id}-title`}
                value={b.title ?? ""}
                placeholder="ex. salut.py"
                onChange={(e) =>
                  onChange({ ...b, title: e.target.value || undefined })
                }
              />
            </Field>
            <Field id={`${id}-lang`} label="Limbaj">
              <SelectField
                id={`${id}-lang`}
                name={`${id}-lang`}
                value={b.language}
                onValueChange={(language) => onChange({ ...b, language })}
                items={[...CODE_LANGUAGES]}
              />
            </Field>
          </div>
          <Field id={id} label="Codul" error={error}>
            <Textarea
              id={id}
              value={b.code}
              spellCheck={false}
              onChange={(e) => onChange({ ...b, code: e.target.value })}
              className="min-h-32 font-mono text-sm"
            />
          </Field>
          <Field id={`${id}-out`} label="Ce afișează programul" optional>
            <Textarea
              id={`${id}-out`}
              value={b.output ?? ""}
              spellCheck={false}
              onChange={(e) =>
                onChange({ ...b, output: e.target.value || undefined })
              }
              className="min-h-16 font-mono text-sm"
            />
          </Field>
        </div>
      );
    case "list":
    case "keypoints":
      return (
        <div className="grid gap-3">
          {b.type === "keypoints" ? (
            <Field id={`${id}-title`} label="Titlu" optional>
              <Input
                id={`${id}-title`}
                value={b.title ?? ""}
                placeholder="De reținut"
                onChange={(e) =>
                  onChange({ ...b, title: e.target.value || undefined })
                }
              />
            </Field>
          ) : null}
          <Field id={id} label="Elementele, câte unul pe rând" error={error}>
            <Textarea
              id={id}
              value={b.items.join("\n")}
              onChange={(e) =>
                onChange({ ...b, items: e.target.value.split("\n") })
              }
              className="min-h-24"
            />
          </Field>
          {b.type === "list" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!b.ordered}
                onChange={(e) =>
                  onChange({ ...b, ordered: e.target.checked || undefined })
                }
                className="size-4 accent-primary"
              />
              Listă numerotată
            </label>
          ) : null}
        </div>
      );
    case "callout":
      return (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <Field id={`${id}-tone`} label="Tipul">
              <SelectField
                id={`${id}-tone`}
                name={`${id}-tone`}
                value={b.tone}
                onValueChange={(tone) =>
                  onChange({ ...b, tone: tone as typeof b.tone })
                }
                items={CALLOUT_TONES.map((t) => ({
                  value: t,
                  label: TONES[t],
                }))}
              />
            </Field>
            <Field id={`${id}-title`} label="Titlu" optional>
              <Input
                id={`${id}-title`}
                value={b.title ?? ""}
                onChange={(e) =>
                  onChange({ ...b, title: e.target.value || undefined })
                }
              />
            </Field>
          </div>
          <Field id={id} label="Text" error={error}>
            <Textarea
              id={id}
              value={b.text}
              onChange={(e) => onChange({ ...b, text: e.target.value })}
              className="min-h-20"
            />
          </Field>
        </div>
      );
    default:
      return (
        <p className="flex items-start gap-2 text-muted-foreground text-sm">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Bloc special, creat odată cu cursul. Se păstrează așa cum e; îl poți
          muta sau șterge.
        </p>
      );
  }
}

/** Curăță blocurile înainte de salvare: listele fără rânduri goale. */
export function cleanBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((b) =>
    b.type === "list" || b.type === "keypoints"
      ? { ...b, items: b.items.map((x) => x.trim()).filter(Boolean) }
      : b,
  );
}

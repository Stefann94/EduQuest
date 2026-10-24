"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/utils";

const INDENT = "    ";

/**
 * Un editor de cod simplu („dev box”): font monospațiat, numere de rând, Tab pentru
 * indentare și Enter care păstrează indentarea rândului. Shift+Tab scoate indentarea.
 * Esc lasă focusul să plece din editor (Tab nu mai e „prins” după Esc).
 */
export function CodeEditor({
  value,
  onChange,
  label,
  language = "python",
  rows = 12,
  readOnly,
  name,
  className,
  describedBy,
}: {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  language?: string;
  rows?: number;
  readOnly?: boolean;
  name?: string;
  className?: string;
  describedBy?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const lines = Math.max(rows, value.split("\n").length);

  function edit(next: string, start: number, end = start) {
    onChange?.(next);
    requestAnimationFrame(() => ref.current?.setSelectionRange(start, end));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (readOnly) return;
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: t } = el;
    if (e.key === "Escape") {
      escaped.current = true;
      return;
    }
    if (e.key === "Tab" && !escaped.current) {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        const removable =
          value.slice(lineStart).match(/^ {1,4}/)?.[0].length ?? 0;
        if (removable === 0) return;
        edit(
          value.slice(0, lineStart) + value.slice(lineStart + removable),
          Math.max(lineStart, s - removable),
        );
      } else {
        edit(value.slice(0, s) + INDENT + value.slice(t), s + INDENT.length);
      }
      return;
    }
    escaped.current = false;
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const line = value.slice(lineStart, s);
      let indent = line.match(/^\s*/)?.[0] ?? "";
      // După „:” (Python), „{” (Java, CSS) sau o etichetă deschisă, indentăm un nivel.
      if (/[:{]\s*$/.test(line) || /<[a-z][^/>]*>\s*$/i.test(line))
        indent += INDENT;
      const insert = `\n${indent}`;
      edit(value.slice(0, s) + insert + value.slice(t), s + insert.length);
    }
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex cut-sm overflow-hidden bg-[#161b22] text-[#e6edf3] focus-within:ring-3 focus-within:ring-ring/70">
        <div
          aria-hidden="true"
          className="select-none bg-[#0d1117] px-3 py-3 text-right font-mono text-[#6e7681] text-sm leading-6"
        >
          {Array.from({ length: lines }, (_, i) => (
            // Numerele de rând nu se reordonează niciodată.
            // biome-ignore lint/suspicious/noArrayIndexKey: listă fixă de numere
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={ref}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={readOnly}
          rows={lines}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          data-language={language}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 resize-none overflow-x-auto whitespace-pre bg-transparent px-3 py-3 font-mono text-sm leading-6 caret-[#f0b72f] outline-none placeholder:text-[#6e7681]"
          placeholder={readOnly ? undefined : "# Scrie codul aici"}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        Tab indentează, Shift+Tab scoate indentarea. Apasă Esc, apoi Tab, ca să
        ieși din editor.
      </p>
    </div>
  );
}

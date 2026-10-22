"use client";

import { Play, RotateCcw, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const TAB = "    ";

/**
 * Editor de cod simplu pentru exerciții. Rularea codului (Python în browser, cu Pyodide)
 * vine într-un pas următor; deocamdată butonul „Rulează” e dezactivat.
 */
export function CodeEditor({ starter }: { starter: string }) {
  const [code, setCode] = useState(starter);
  const lines = code.split("\n").length;

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Tab adaugă spații în loc să mute focusul (important pentru indentarea din Python).
    if (e.key !== "Tab" || e.shiftKey) return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = code.slice(0, start) + TAB + code.slice(end);
    setCode(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + TAB.length;
    });
  }

  return (
    <div className="stagger-rise grid gap-4">
      <div className="overflow-hidden rounded-3xl border-2 border-code bg-code text-code-foreground shadow-[0_5px_0_0_var(--primary-shadow)]">
        <div className="flex items-center justify-between gap-3 border-code-foreground/10 border-b-2 px-4 py-2.5">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="size-3 rounded-full bg-quiz-red" />
            <span className="size-3 rounded-full bg-quiz-yellow" />
            <span className="size-3 rounded-full bg-quiz-green" />
          </div>
          <span className="font-bold font-mono text-sm opacity-70">
            main.py
          </span>
          <button
            type="button"
            onClick={() => setCode(starter)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 font-bold text-sm opacity-70 hover:bg-code-foreground/10 hover:opacity-100"
          >
            <RotateCcw className="size-4" /> De la capăt
          </button>
        </div>
        <div className="flex font-mono text-base leading-7">
          <div
            aria-hidden="true"
            className="select-none py-4 pr-3 pl-4 text-right opacity-40"
          >
            {Array.from({ length: Math.max(lines, 10) }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: numerele de linie sunt chiar indexuri
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <label htmlFor="code" className="sr-only">
            Codul tău
          </label>
          <textarea
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            wrap="off"
            autoCapitalize="off"
            autoComplete="off"
            rows={Math.max(lines, 10)}
            className="min-w-0 flex-1 resize-none bg-transparent py-4 pr-4 caret-primary-foreground outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          size="lg"
          disabled
          title="În curând: rulăm Python direct în browser"
        >
          <Play className="fill-current" /> Rulează (în curând)
        </Button>
        <Button size="lg" variant="outline" disabled>
          <Send /> Trimite mentorului
        </Button>
      </div>

      <div className="sticker p-4">
        <p className="font-bold font-heading text-lg">🖥️ Rezultat</p>
        <p className="mt-1 font-mono text-muted-foreground">
          Aici vei vedea ce afișează programul tău.
        </p>
      </div>
    </div>
  );
}

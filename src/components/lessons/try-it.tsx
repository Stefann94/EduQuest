"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { CodeEditor } from "@/components/code/code-editor";
import { Button } from "@/components/ui/button";

const key = (id: string) => `eduquest:incearca:${id}`;

/**
 * „Încearcă singur”: un editor în care elevul își scrie rezolvarea înainte să se uite
 * la soluție. Nu se trimite nicăieri; ciorna rămâne doar în browserul lui.
 */
export function TryIt({
  itemId,
  starter = "",
  language,
}: {
  itemId: string;
  starter?: string;
  language: string;
}) {
  const [code, setCode] = useState(starter);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key(itemId));
      if (saved !== null) setCode(saved);
    } catch {}
  }, [itemId]);

  function change(next: string) {
    setCode(next);
    try {
      localStorage.setItem(key(itemId), next);
    } catch {}
  }

  return (
    <div className="grid gap-3">
      <CodeEditor
        value={code}
        onChange={change}
        label="Rezolvarea ta"
        language={language}
        rows={8}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Ciorna rămâne salvată pe acest dispozitiv. Rulează codul în editorul
          tău (de exemplu Thonny sau VS Code) pe exemplele de mai sus.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => change(starter)}
          disabled={code === starter}
        >
          <RotateCcw /> Începe din nou
        </Button>
      </div>
    </div>
  );
}

"use client";

import { FileCode2 } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fișierele rezolvării, ca taburi (ex. main.py și date.json). Codul vine deja evidențiat
 * de pe server; aici doar alegem ce fișier se vede. Cu un singur fișier nu apar taburi.
 */
export function SolutionTabs({
  files,
}: {
  files: { name: string; node: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  const id = useId();
  if (files.length === 1) return <>{files[0].node}</>;

  return (
    <div className="grid gap-0">
      <div
        role="tablist"
        aria-label="Fișierele rezolvării"
        className="flex flex-wrap gap-1"
      >
        {files.map((f, i) => (
          <button
            key={f.name}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const next =
                (active + (e.key === "ArrowRight" ? 1 : files.length - 1)) %
                files.length;
              setActive(next);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
            className={cn(
              "flex h-9 items-center gap-1.5 px-3 font-mono text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/70",
              i === active
                ? "bg-[#0d1117] text-[#e6edf3]"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            <FileCode2 className="size-3.5" aria-hidden="true" />
            {f.name}
          </button>
        ))}
      </div>
      {files.map((f, i) => (
        <div
          key={f.name}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
        >
          {f.node}
        </div>
      ))}
    </div>
  );
}

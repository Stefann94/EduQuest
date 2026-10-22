"use client";

import { Check } from "lucide-react";
import { AVATARS, THEMES } from "@/lib/themes";
import { setPrefs, usePrefs } from "@/lib/use-prefs";
import { cn } from "@/lib/utils";

export function ColorPicker({
  className,
  gridClassName,
  legend = "🎨 Culoarea ta",
}: {
  className?: string;
  gridClassName?: string;
  legend?: string;
}) {
  const { theme } = usePrefs();
  return (
    <fieldset className={className}>
      <legend
        className={legend ? "mb-3 font-bold font-heading text-lg" : "sr-only"}
      >
        {legend || "Alege culoarea"}
      </legend>
      <div
        className={cn("stagger-pop grid grid-cols-4 gap-2.5", gridClassName)}
      >
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              data-theme={t.id}
              onClick={(e) => {
                // Culoarea nouă pornește din centrul butonului apăsat.
                const r = e.currentTarget.getBoundingClientRect();
                setPrefs(
                  { theme: t.id },
                  { x: r.left + r.width / 2, y: r.top + r.height / 2 },
                );
              }}
              aria-pressed={active}
              aria-label={`Tema ${t.name}`}
              title={t.name}
              className={cn(
                "group relative grid aspect-square place-items-center rounded-2xl bg-primary text-2xl shadow-[0_4px_0_0_var(--primary-shadow)] outline-none transition-transform hover:-translate-y-0.5 hover:-rotate-6 hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring/40 active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--primary-shadow)]",
                active && "ring-4 ring-foreground/80 ring-offset-2",
              )}
            >
              <span aria-hidden="true">{t.emoji}</span>
              {active ? (
                <span className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-foreground text-background">
                  <Check className="size-4" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AvatarPicker({ className }: { className?: string }) {
  const { avatar } = usePrefs();
  return (
    <fieldset className={className}>
      <legend className="mb-3 font-bold font-heading text-lg">
        😊 Avatarul tău
      </legend>
      <div className="stagger-pop grid grid-cols-6 gap-2">
        {AVATARS.map((a) => {
          const active = a === avatar;
          return (
            <button
              key={a}
              type="button"
              onClick={() => setPrefs({ avatar: a })}
              aria-pressed={active}
              aria-label={`Avatar ${a}`}
              className={cn(
                "grid aspect-square place-items-center rounded-2xl border-2 bg-card text-2xl outline-none transition-transform hover:-translate-y-0.5 hover:-rotate-6 hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring/40",
                active
                  ? "border-primary bg-primary-soft shadow-[0_3px_0_0_var(--primary)]"
                  : "shadow-[0_3px_0_0_var(--border)]",
              )}
            >
              <span aria-hidden="true">{a}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

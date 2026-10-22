"use client";

import { usePrefs } from "@/lib/use-prefs";
import { cn } from "@/lib/utils";

/** Avatarul ales de copil, pe fundal în culoarea temei lui. */
export function UserAvatar({ className }: { className?: string }) {
  const { avatar } = usePrefs();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-2xl shadow-[0_3px_0_0_var(--primary)]",
        className,
      )}
    >
      {avatar}
    </span>
  );
}

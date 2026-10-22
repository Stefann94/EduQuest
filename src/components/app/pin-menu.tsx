"use client";

import { PinJoin } from "@/components/quiz/pin-join";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Intrare rapidă într-un quiz live, de pe orice pagină. */
export function PinMenu() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Intră într-un quiz live cu PIN"
        className={cn(buttonVariants(), "px-3 sm:px-5")}
      >
        <span aria-hidden="true">🎟️</span>
        <span className="hidden sm:inline">Am un PIN</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-96 max-w-[calc(100vw-2rem)] gap-3 rounded-3xl border-2 p-5 shadow-[0_6px_0_0_var(--border)] ring-0"
      >
        <p className="font-bold font-heading text-xl">
          ⚡ Intră în quiz-ul live
        </p>
        <p className="font-semibold text-muted-foreground">
          Scrie PIN-ul de pe ecranul mentorului.
        </p>
        <PinJoin />
      </PopoverContent>
    </Popover>
  );
}

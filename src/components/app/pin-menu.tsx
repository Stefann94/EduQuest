"use client";

import { PinJoin } from "@/components/quiz/pin-join";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NavPopoverContent } from "./nav-popover";

/** Intrare rapidă într-un quiz live, de pe orice pagină. */
export function PinMenu() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Intră într-un quiz live cu PIN"
        className={cn(buttonVariants(), "h-12 px-3 sm:px-5")}
      >
        <span aria-hidden="true">🎟️</span>
        <span className="hidden sm:inline">Am un PIN</span>
      </PopoverTrigger>
      <NavPopoverContent className="w-96 gap-3 p-5">
        <p className="font-bold font-heading text-xl">
          ⚡ Intră în quiz-ul live
        </p>
        <p className="font-semibold text-muted-foreground">
          Scrie PIN-ul de pe ecranul mentorului.
        </p>
        <PinJoin />
      </NavPopoverContent>
    </Popover>
  );
}

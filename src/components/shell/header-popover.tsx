"use client";

import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Distanța de la buton până la fereastră: jumătate din diferența dintre bara de sus (64px)
 * și buton (36px), plus chenarul barei și puțin spațiu pentru săgeată.
 */
const BELOW_HEADER = 22;

/** Fereastra deschisă din bara de sus: pornește sub bară, cu săgeată spre buton. */
export function HeaderPopoverContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PopoverContent
      align="end"
      sideOffset={BELOW_HEADER}
      arrow
      backdrop
      className={cn(
        "max-w-[calc(100vw-1.5rem)] gap-0 rounded-xl border p-0 shadow-lg ring-0",
        className,
      )}
    >
      {children}
    </PopoverContent>
  );
}

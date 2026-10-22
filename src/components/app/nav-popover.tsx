"use client";

import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Distanța de la buton până la fereastră: cât grosimea barei de sus de sub buton
 * (padding + chenar + umbră) plus loc pentru săgeată, ca fereastra să înceapă sub bară.
 */
const BELOW_TOP_BAR = 34;

/** Fereastra deschisă din bara de sus: sub bară, cu săgeată și fundal estompat. */
export function NavPopoverContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <PopoverContent
      align="end"
      sideOffset={BELOW_TOP_BAR}
      arrow
      backdrop
      className={cn(
        "max-w-[calc(100vw-2rem)] rounded-3xl border-2 shadow-[0_6px_0_0_var(--border)] ring-0",
        className,
      )}
    >
      {children}
    </PopoverContent>
  );
}

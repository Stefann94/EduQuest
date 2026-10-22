"use client";

import { Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AvatarPicker, ColorPicker } from "./theme-picker";
import { UserAvatar } from "./user-avatar";

/** Avatarul din bara de sus: deschide alegerea culorii și a avatarului. */
export function PersonalizeButton({
  name,
  hint,
  className,
}: {
  name: string;
  hint?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Personalizează culoarea și avatarul"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-11 gap-3 p-1 text-left min-[1400px]:h-auto min-[1400px]:py-1 min-[1400px]:pr-4 min-[1400px]:pl-1",
          className,
        )}
      >
        <UserAvatar className="size-9 text-xl shadow-none min-[1400px]:size-10" />
        <span className="hidden min-w-0 max-w-40 flex-1 min-[1400px]:block">
          <span className="block truncate">{name}</span>
          {hint ? (
            <span className="block truncate font-sans font-semibold text-muted-foreground text-xs tracking-normal">
              {hint}
            </span>
          ) : null}
        </span>
        <Palette className="hidden size-5 text-primary min-[1400px]:block" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-80 max-w-[calc(100vw-2rem)] gap-5 rounded-3xl border-2 p-5 shadow-[0_6px_0_0_var(--border)] ring-0"
      >
        <ColorPicker />
        <AvatarPicker />
      </PopoverContent>
    </Popover>
  );
}

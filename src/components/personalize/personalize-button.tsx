"use client";

import { Palette } from "lucide-react";
import { NavPopoverContent } from "@/components/app/nav-popover";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
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
          "h-12 gap-3 p-1 text-left min-[1400px]:py-1 min-[1400px]:pr-4 min-[1400px]:pl-1",
          className,
        )}
      >
        <UserAvatar className="size-9 text-xl shadow-none" />
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
      <NavPopoverContent className="w-80 gap-5 p-5">
        <ColorPicker />
        <AvatarPicker />
      </NavPopoverContent>
    </Popover>
  );
}

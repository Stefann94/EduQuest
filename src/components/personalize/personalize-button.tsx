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

export function PersonalizeButton({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Personalizează culoarea și avatarul"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-auto gap-2.5 py-1.5 pr-4 pl-1.5",
          compact && "pr-1.5",
        )}
      >
        <UserAvatar className="size-9 text-xl" />
        {compact ? null : (
          <>
            <span className="hidden sm:inline">{name}</span>
            <Palette className="size-4 text-primary" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-80 gap-5 rounded-3xl border-2 p-5 shadow-[0_6px_0_0_var(--border)] ring-0"
      >
        <ColorPicker />
        <AvatarPicker />
      </PopoverContent>
    </Popover>
  );
}

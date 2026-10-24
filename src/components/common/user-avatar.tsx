import type { AvatarId } from "@/lib/data/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

// Avatarele pe care le pot alege elevii (folosite și în quiz-ul live).
export const AVATARS: Record<AvatarId, { emoji: string; label: string }> = {
  fox: { emoji: "🦊", label: "Vulpe" },
  panda: { emoji: "🐼", label: "Panda" },
  owl: { emoji: "🦉", label: "Bufniță" },
  cat: { emoji: "🐱", label: "Pisică" },
  robot: { emoji: "🤖", label: "Robot" },
  rocket: { emoji: "🚀", label: "Rachetă" },
  octopus: { emoji: "🐙", label: "Caracatiță" },
  penguin: { emoji: "🐧", label: "Pinguin" },
};

const SIZES = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-lg",
  lg: "size-14 text-2xl",
  xl: "size-18 text-3xl",
} as const;

/**
 * Avatarul unui utilizator, într-un hexagon. Cu `avatar` afișează personajul ales,
 * altfel inițialele numelui.
 */
export function UserAvatar({
  name,
  avatar,
  size = "sm",
  className,
}: {
  name: string;
  avatar?: AvatarId;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      title={name}
      className={cn(
        "hex grid shrink-0 select-none place-items-center font-extrabold font-heading",
        avatar
          ? "bg-secondary text-secondary-foreground"
          : "bg-cyan text-cyan-foreground",
        SIZES[size],
        className,
      )}
    >
      {avatar ? AVATARS[avatar].emoji : initials(name)}
    </span>
  );
}

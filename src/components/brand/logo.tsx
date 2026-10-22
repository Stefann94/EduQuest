import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M12 9.5c-2 0-3 1-3 3v1.6c0 .9-.6 1.4-1.5 1.4.9 0 1.5.5 1.5 1.4v1.6c0 2 1 3 3 3M20 9.5c2 0 3 1 3 3v1.6c0 .9.6 1.4 1.5 1.4-.9 0-1.5.5-1.5 1.4v1.6c0 2-1 3-3 3"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
      <path
        d="m16 12.2 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z"
        className="fill-xp"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg font-semibold text-lg tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark />
      <span>
        Edu<span className="text-primary">Quest</span>
      </span>
    </Link>
  );
}

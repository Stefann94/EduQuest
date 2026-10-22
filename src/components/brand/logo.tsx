import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-9 shrink-0 -rotate-6", className)}
    >
      <rect
        y="2"
        width="32"
        height="30"
        rx="10"
        className="fill-primary-shadow"
      />
      <rect width="32" height="29" rx="10" className="fill-primary" />
      <path
        d="M12 8.5c-2 0-3 1-3 3v1.6c0 .9-.6 1.4-1.5 1.4.9 0 1.5.5 1.5 1.4v1.6c0 2 1 3 3 3M20 8.5c2 0 3 1 3 3v1.6c0 .9.6 1.4 1.5 1.4-.9 0-1.5.5-1.5 1.4v1.6c0 2-1 3-3 3"
        fill="none"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
      <path
        d="m16 11.2 1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z"
        className="fill-fun-yellow"
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
        "group flex items-center gap-2 rounded-2xl font-heading font-semibold text-2xl tracking-tight outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
        className,
      )}
    >
      <LogoMark className="transition-transform group-hover:rotate-6" />
      <span>
        Edu<span className="text-primary">Quest</span>
      </span>
    </Link>
  );
}

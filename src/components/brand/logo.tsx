import { CodeXml } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <CodeXml className="size-[18px]" strokeWidth={2.25} />
    </span>
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
        "flex items-center gap-2.5 rounded-lg font-semibold text-[17px] tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
    >
      <LogoMark />
      <span>EduQuest</span>
    </Link>
  );
}

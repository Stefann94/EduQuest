import Link from "next/link";
import { cn } from "@/lib/utils";

/** Semnul mic: un bloc galben oblic cu „EQ”. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-8 shrink-0 place-items-center bg-cta pr-3.5 pl-2.5 font-extrabold font-heading text-cta-foreground text-lg uppercase [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)]",
        className,
      )}
    >
      EQ
    </span>
  );
}

/** Logo-ul complet: numele platformei pe un bloc galben oblic. */
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
        "flex shrink-0 items-center outline-none focus-visible:ring-3 focus-visible:ring-ring/70",
        className,
      )}
    >
      <span className="bg-cta py-0.5 pr-5 pl-3.5 font-extrabold font-heading text-[22px] text-cta-foreground uppercase tracking-wide [clip-path:polygon(0_0,100%_0,calc(100%-12px)_100%,0_100%)]">
        EduQuest
      </span>
    </Link>
  );
}

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Antetul unei pagini: titlu, descriere, acțiuni și (opțional) un link înapoi. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {back ? (
        <Link
          href={back.href}
          className="-ml-1 flex w-fit items-center gap-0.5 rounded-md px-1 text-muted-foreground text-sm hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 max-w-3xl">
          <h1 className="text-balance font-extrabold text-4xl leading-[0.95] sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-muted-foreground">{description}</p>
          ) : null}
          {meta ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

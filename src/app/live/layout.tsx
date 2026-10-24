import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Quiz live" };

/** Quiz-ul live ocupă tot ecranul, în afara cadrului obișnuit al elevului. */
export default function LiveLayout({ children }: LayoutProps<"/live">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
        <Logo />
        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <LogOut /> Ieși
        </Link>
      </header>
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:py-10">
        {/* Pagina citește sesiunea, deci stă într-un <Suspense>. */}
        <div className="mx-auto w-full max-w-5xl">
          <Suspense>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
          <a href="#functionalitati" className="hover:text-foreground">
            Funcționalități
          </a>
          <a href="#cum-functioneaza" className="hover:text-foreground">
            Cum funcționează
          </a>
          <a href="#siguranta" className="hover:text-foreground">
            Siguranță
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/autentificare"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "hidden sm:inline-flex",
            )}
          >
            Autentificare
          </Link>
          <Link
            href="/intra"
            className={buttonVariants({ size: "lg", className: "px-4" })}
          >
            Intră cu PIN
          </Link>
        </div>
      </div>
    </header>
  );
}

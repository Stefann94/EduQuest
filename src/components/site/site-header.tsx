import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#functionalitati", label: "Ce poți face", emoji: "🎮" },
  { href: "#cum-functioneaza", label: "Cum merge", emoji: "🚀" },
  { href: "#parinti", label: "Pentru părinți", emoji: "💛" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 px-3">
      <div className="sticker mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-full px-3 pl-5 sm:h-18">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 font-bold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <span aria-hidden="true">{l.emoji}</span> {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/autentificare"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "hidden rounded-full sm:inline-flex",
            )}
          >
            Intră în cont
          </Link>
          <Link href="/intra" className={cn(buttonVariants(), "rounded-full")}>
            Am un PIN 🎟️
          </Link>
        </div>
      </div>
    </header>
  );
}

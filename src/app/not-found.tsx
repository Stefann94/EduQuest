import { SearchX } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex max-w-md flex-col items-center rounded-xl border bg-card p-8 shadow-xs">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <SearchX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-semibold text-xl">Pagina nu a fost găsită</h1>
        <p className="mt-1 text-muted-foreground">
          Pagina nu există sau nu ai acces la ea. Verifică adresa sau
          întoarce-te la pagina principală.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  );
}

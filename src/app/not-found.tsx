import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="sticker p-8 text-center">
        <p className="text-7xl" aria-hidden="true">
          🔍
        </p>
        <h1 className="mt-4 font-bold text-3xl">
          Ups! Pagina asta nu există 🙈
        </h1>
        <p className="mt-2 font-semibold text-muted-foreground">
          Poate ai găsit un bug… sau doar un link greșit.
        </p>
        <Link
          href="/"
          className={buttonVariants({ size: "lg", className: "mt-6" })}
        >
          Înapoi acasă 🏠
        </Link>
      </div>
    </AuthShell>
  );
}

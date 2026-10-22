import Link from "next/link";
import { AuthShell } from "@/components/site/auth-shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <AuthShell>
      <div className="text-center">
        <pre className="mx-auto w-fit rounded-2xl bg-code px-5 py-4 text-left font-mono text-code-foreground">
          <span className="text-quiz-red">Error</span>: pagina nu există (404)
        </pre>
        <h1 className="mt-6 font-bold text-2xl tracking-tight">
          Ups, ai găsit un bug… sau doar un link greșit.
        </h1>
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg" }), "mt-6 h-11 px-6")}
        >
          Înapoi la pagina principală
        </Link>
      </div>
    </AuthShell>
  );
}

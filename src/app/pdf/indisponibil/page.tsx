import { FileX } from "lucide-react";
import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "PDF indisponibil" };

/** Când PDF-ul nu mai există sau nu ai acces la el (deschis într-un tab nou). */
export default function PdfUnavailable() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo />
      <div className="flex max-w-md flex-col items-center rounded-xl border bg-card p-8 shadow-xs">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <FileX className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-semibold text-xl">PDF-ul nu e disponibil</h1>
        <p className="mt-1 text-muted-foreground">
          Fișierul a fost șters sau nu ai acces la el. Închide tabul și
          întoarce-te la lecție.
        </p>
      </div>
    </div>
  );
}

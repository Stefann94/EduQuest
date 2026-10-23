import { Settings } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { InviteCodeStatusBadge } from "./class-status";
import { CopyButton } from "./copy-button";

/** Codul de invitație al clasei, cu starea lui și butonul de copiere. */
export function InviteCodeCard({
  classId,
  code,
  active,
  archived,
}: {
  classId: string;
  code: string;
  active: boolean;
  archived: boolean;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Cod de invitație</h2>
        <InviteCodeStatusBadge active={active} />
      </div>
      <p className="mt-4 rounded-lg border border-dashed bg-muted/40 py-3 text-center font-mono font-semibold text-2xl tracking-[0.3em]">
        {code}
      </p>
      <p className="mt-3 text-muted-foreground text-sm">
        {archived
          ? "Clasa este arhivată și nu mai primește elevi noi."
          : active
            ? "Elevii introduc acest cod la „Alătură-te unei clase”."
            : "Codul este dezactivat: elevii noi nu se pot înscrie cu el."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <CopyButton
          value={code}
          label="Copiază codul"
          successMessage={`Codul ${code} a fost copiat.`}
        />
        <Link
          href={`/mentor/clase/${classId}/setari`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <Settings aria-hidden="true" /> Gestionează codul
        </Link>
      </div>
    </section>
  );
}

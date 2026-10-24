import { Link2Off } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, linkClass } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Linkul nu mai este valabil" };

export default function InvalidLinkPage() {
  return (
    <AuthCard
      title="Linkul nu mai este valabil"
      description="Linkurile din email pot fi folosite o singură dată și expiră după un timp."
      footer={
        <Link href="/autentificare" className={linkClass}>
          Înapoi la autentificare
        </Link>
      }
    >
      <p className="flex gap-2.5 rounded-lg border bg-muted/40 p-3.5 text-muted-foreground text-sm">
        <Link2Off className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Pentru parolă, cere un link nou din{" "}
          <Link href="/recuperare-parola" className={linkClass}>
            recuperarea parolei
          </Link>
          . Pentru activarea contului de mentor, scrie-ne la admin@eduquest.ro
          și îți trimitem o invitație nouă.
        </span>
      </p>
    </AuthCard>
  );
}

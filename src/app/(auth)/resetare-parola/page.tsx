import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, linkClass } from "@/components/auth/auth-card";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Alege o parolă nouă" };

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Alege o parolă nouă"
      description="Parola nouă o înlocuiește pe cea veche pentru contul tău."
      footer={
        <>
          Linkul nu mai funcționează?{" "}
          <Link href="/recuperare-parola" className={linkClass}>
            Cere un link nou
          </Link>
        </>
      }
    >
      <p className="flex gap-2.5 rounded-lg border bg-muted/40 p-3.5 text-muted-foreground text-sm">
        <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Linkul de resetare este valabil 60 de minute și poate fi folosit o
        singură dată.
      </p>
      {/* Demo: tokenul ar veni din linkul primit pe email și s-ar verifica pe server. */}
      <ResetForm token="demo-token" />
    </AuthCard>
  );
}

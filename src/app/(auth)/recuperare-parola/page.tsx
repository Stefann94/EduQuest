import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, linkClass } from "@/components/auth/auth-card";
import { RecoveryForm } from "@/components/auth/recovery-form";

export const metadata: Metadata = { title: "Recuperează parola" };

export default function RecoveryPage() {
  return (
    <AuthCard
      title="Ai uitat parola?"
      description="Scrie adresa de email a contului și îți trimitem un link cu care îți alegi o parolă nouă."
      footer={
        <>
          Ți-ai amintit parola?{" "}
          <Link href="/autentificare" className={linkClass}>
            Intră în cont
          </Link>
        </>
      }
    >
      <RecoveryForm />
    </AuthCard>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, linkClass } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Creează un cont de elev" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Creează un cont de elev"
      description="Contul îți dă acces la clasele în care te înscrii cu un cod de la mentor, la materiale și la quiz-urile de exersare."
      footer={
        <>
          Ai deja cont?{" "}
          <Link href="/autentificare" className={linkClass}>
            Intră în cont
          </Link>
          <span className="mt-1 block text-xs">
            Vrei să predai?{" "}
            <Link href="/aplicare-mentor" className={linkClass}>
              Aplică pentru un cont de mentor
            </Link>
          </span>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

import { Clock, Link2Off } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivationForm } from "@/components/auth/activation-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Activează contul de mentor" };

// Emailul vine din invitația primită pe email (sesiunea creată de /auth/confirm),
// nu dintr-un câmp pe care l-ar putea schimba utilizatorul.
async function SessionActivationForm() {
  const profile = await getSessionProfile();
  return <ActivationForm email={profile?.email ?? ""} />;
}

export default function ActivationPage() {
  return (
    <AuthCard
      title="Activează contul de mentor"
      description="Aplicația ta a fost aprobată. Alege o parolă ca să intri în contul de mentor."
    >
      <ul className="grid gap-2.5 rounded-lg border bg-muted/40 p-4 text-muted-foreground text-sm">
        <li className="flex gap-2.5">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Linkul de activare poate fi folosit o singură dată și este valabil
            48 de ore de la aprobare.
          </span>
        </li>
        <li className="flex gap-2.5">
          <Link2Off className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Dacă linkul a expirat sau a fost deja folosit, scrie-ne la{" "}
            <span className="font-medium text-foreground">
              admin@eduquest.ro
            </span>{" "}
            și îți trimitem unul nou. Parola nu ți-o trimitem niciodată pe
            email.
          </span>
        </li>
      </ul>
      <Suspense>
        <SessionActivationForm />
      </Suspense>
    </AuthCard>
  );
}

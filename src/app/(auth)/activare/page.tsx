import { Clock, Link2Off } from "lucide-react";
import type { Metadata } from "next";
import { ActivationForm } from "@/components/auth/activation-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getMentorApplication } from "@/lib/data/queries";

export const metadata: Metadata = { title: "Activează contul de mentor" };

// Demo: emailul vine din aplicația aprobată. Cu Supabase, linkul din email conține un
// token verificat pe server, iar emailul se citește din token.
const DEMO_APPLICATION = "app-4";

export default async function ActivationPage() {
  const application = await getMentorApplication(DEMO_APPLICATION);
  const email = application?.email ?? "";

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
      <ActivationForm email={email} token="demo-token" />
    </AuthCard>
  );
}

import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { MentorApplicationForm } from "@/components/auth/mentor-application-form";

export const metadata: Metadata = { title: "Aplică pentru un cont de mentor" };

export default function MentorApplicationPage() {
  return (
    <AuthCard
      className="max-w-2xl"
      title="Aplică pentru un cont de mentor"
      description="Conturile de mentor se activează doar după ce un administrator verifică aplicația. Completarea durează în jur de 5 minute."
    >
      <MentorApplicationForm />
    </AuthCard>
  );
}

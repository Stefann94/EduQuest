import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Autentificare" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Bine ai revenit"
      description="Intră în cont ca să continui cu clasele, temele și quiz-urile tale."
    >
      <LoginForm />
    </AuthCard>
  );
}

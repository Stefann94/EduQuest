import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Autentificare" };

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
      <p className="mt-6 text-center text-muted-foreground text-sm">
        Ai doar un PIN de joc?{" "}
        <Link
          href="/intra"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Intră ca invitat
        </Link>
      </p>
    </AuthShell>
  );
}

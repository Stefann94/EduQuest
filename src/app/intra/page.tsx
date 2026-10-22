import type { Metadata } from "next";
import Link from "next/link";
import { JoinForm } from "@/components/quiz/join-form";
import { AuthShell } from "@/components/site/auth-shell";

export const metadata: Metadata = { title: "Intră cu PIN" };

export default function JoinPage() {
  return (
    <AuthShell>
      <JoinForm />
      <p className="mt-6 text-center text-muted-foreground text-sm">
        Ai cont de elev?{" "}
        <Link
          href="/autentificare"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Autentifică-te
        </Link>
      </p>
    </AuthShell>
  );
}

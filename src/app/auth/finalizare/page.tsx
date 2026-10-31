import type { Metadata } from "next";
import { Suspense } from "react";
import { FinishSignIn } from "./finish-sign-in";

export const metadata: Metadata = { title: "Se deschide contul" };

export default function FinishSignInPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background p-6">
      <Suspense>
        <FinishSignIn />
      </Suspense>
    </main>
  );
}

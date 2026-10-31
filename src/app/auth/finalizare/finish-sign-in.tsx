"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Doar adrese din site (fără „//alt-site”), ca după autentificare. */
function safePath(next: string | null) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

/**
 * Finalizează un link din email care aduce sesiunea în fragmentul adresei
 * (#access_token=…&refresh_token=…): o salvează în cookie-uri și merge mai departe.
 */
export function FinishSignIn() {
  const params = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      setFailed(true);
      window.location.replace("/link-invalid");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    void supabase.auth
      .setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setFailed(true);
          window.location.replace("/link-invalid");
          return;
        }
        // Navigare completă: serverul vede imediat noile cookie-uri de sesiune.
        window.location.replace(safePath(params.get("next")));
      });
  }, [params]);

  return (
    <p className="text-muted-foreground" aria-live="polite">
      {failed ? "Linkul nu mai este valabil…" : "Se deschide contul…"}
    </p>
  );
}

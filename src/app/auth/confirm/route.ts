import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { safeNext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "recovery",
  "email",
  "email_change",
  "magiclink",
];

/**
 * Linkurile din emailuri (confirmare cont, invitație de mentor, resetare parolă).
 * Verifică tokenul pe server, creează sesiunea și duce utilizatorul mai departe.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const supabase = await createSupabaseServerClient();

  let ok = false;
  if (tokenHash && type && TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const target = request.nextUrl.clone();
  target.search = "";
  if (!ok && !tokenHash && !code) {
    // Invitațiile trimise de server (inviteUserByEmail) întorc sesiunea în fragmentul
    // adresei (#access_token=…), pe care serverul nu-l vede. Browserul păstrează
    // fragmentul la redirecționare, iar pagina de finalizare îl citește.
    target.pathname = "/auth/finalizare";
    target.searchParams.set("next", next);
    return NextResponse.redirect(target);
  }
  target.pathname = ok ? next : "/link-invalid";
  return NextResponse.redirect(target);
}

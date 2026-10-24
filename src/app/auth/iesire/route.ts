import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Închide sesiunea (ex. cont suspendat) și duce la autentificare. */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const target = request.nextUrl.clone();
  target.pathname = "/autentificare";
  target.search = "";
  return NextResponse.redirect(target);
}

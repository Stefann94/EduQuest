import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Paginile deschise fără cont. Restul platformei cere autentificare.
const PUBLIC_PATHS = [
  "/autentificare",
  "/inregistrare",
  "/aplicare-mentor",
  "/recuperare-parola",
  "/auth",
  "/link-invalid",
];
// Pagini la care ajungi dintr-un link primit pe email (sesiune temporară).
const LINK_PATHS = ["/resetare-parola", "/activare"];

const startsWith = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Reîmprospătează sesiunea Supabase la fiecare cerere și trimite la autentificare
 * pe cine nu e logat. Rolul (elev, mentor, admin) se verifică în fiecare layout.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options);
      },
    },
  });

  // getClaims verifică semnătura tokenului (nu se bazează doar pe cookie).
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  if (
    !loggedIn &&
    !startsWith(path, PUBLIC_PATHS) &&
    !startsWith(path, LINK_PATHS)
  ) {
    const target = request.nextUrl.clone();
    target.pathname = "/autentificare";
    target.search = path === "/" ? "" : `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(target);
  }
  if (loggedIn && startsWith(path, ["/autentificare", "/inregistrare"])) {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    target.search = "";
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = {
  // Fără fișierele statice și imagini.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

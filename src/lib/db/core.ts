import "server-only";
import { cache } from "react";
import type { AvatarId, Role } from "@/lib/data/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Toate citirile aplicației trec prin clientul cu sesiunea utilizatorului, deci prin
// regulile RLS din supabase/migrations. Un rând pe care contul nu are voie să-l vadă
// pur și simplu nu vine; accesul nu depinde de verificări făcute doar în interfață.

/** Clientul Supabase al cererii curente (unul singur pe cerere). */
export const db = cache(createSupabaseServerClient);

/** O eroare a bazei de date devine o excepție cu un mesaj clar (pagina de eroare). */
export function must<T>(
  label: string,
  result: { data: T | null; error: { message: string } | null },
): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data as T;
}

/** Un id din URL care nu e uuid înseamnă „nu există”, nu o eroare a bazei de date. */
export const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/** Un utilizator așa cum îl văd ceilalți: nume și avatar (fără email). */
export type Person = {
  id: string;
  displayName: string;
  avatar: AvatarId;
  username?: string;
  role: Role;
};

export const PERSON_FIELDS =
  "id, display_name, avatar, username, role" as const;

export function toPerson(p: {
  id: string;
  display_name: string;
  avatar: string | null;
  username: string | null;
  role: Role;
}): Person {
  return {
    id: p.id,
    displayName: p.display_name,
    avatar: (p.avatar ?? "fox") as AvatarId,
    username: p.username ?? undefined,
    role: p.role,
  };
}

/** Pentru generateStaticParams: un id de probă, paginile reale se randează la cerere. */
export const placeholderParams = <K extends string>(...keys: K[]) => [
  Object.fromEntries(
    keys.map((k) => [k, "00000000-0000-0000-0000-000000000000"]),
  ) as Record<K, string>,
];

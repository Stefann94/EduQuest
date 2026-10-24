"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionProfile } from "@/lib/auth";
import { db, isUuid } from "@/lib/db/core";

const ids = z.array(z.string().refine(isUuid)).max(200);

/** Marchează notificări ca citite (RLS: doar pe ale tale; fără id-uri = toate). */
export async function markNotificationsRead(only?: string[]) {
  const me = await getSessionProfile();
  if (!me) return { ok: false };
  const supabase = await db();
  let q = supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", me.id)
    .eq("read", false);
  if (only) {
    const parsed = ids.safeParse(only);
    if (!parsed.success) return { ok: false };
    q = q.in("id", parsed.data);
  }
  const { error } = await q;
  revalidatePath("/", "layout");
  return { ok: !error };
}

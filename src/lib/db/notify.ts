import "server-only";
import type { NotificationKind } from "@/lib/data/types";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Notifică elevii unor clase (temă nouă, lecție nouă, quiz live). Elevii nu pot scrie
 * notificări pentru alții, deci scrierea se face cu cheia de server.
 * Se apelează DOAR din acțiuni care au verificat deja că mentorul predă în acele clase.
 */
export async function notifyClassStudents(
  classIds: string[],
  note: { kind: NotificationKind; title: string; body?: string; href: string },
) {
  const admin = supabaseAdmin();
  if (!admin || classIds.length === 0) return;
  const { data: members } = await admin
    .from("class_members")
    .select("student_id, class_id")
    .in("class_id", classIds);
  const students = [...new Set((members ?? []).map((m) => m.student_id))];
  if (students.length === 0) return;
  await admin.from("notifications").insert(
    students.map((user_id) => ({
      user_id,
      kind: note.kind,
      title: note.title,
      body: note.body ?? "",
      href: note.href,
    })),
  );
}

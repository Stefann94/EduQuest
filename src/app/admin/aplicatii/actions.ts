"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { ApplicationStatus } from "@/lib/data/types";
import { getMentorApplication } from "@/lib/db/admin";
import { siteOrigin } from "@/lib/site-url";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReviewDecision = "approve" | "request_info" | "reject";

export type ReviewState =
  | { status: "idle" }
  | { status: "error"; message?: string; noteError?: string; note?: string }
  | {
      status: "success";
      decision: ReviewDecision;
      newStatus: ApplicationStatus;
      note?: string;
    };

const NEW_STATUS: Record<ReviewDecision, ApplicationStatus> = {
  approve: "approved",
  request_info: "needs_info",
  reject: "rejected",
};

const NOTE_REQUIRED: Record<ReviewDecision, string | null> = {
  approve: null,
  request_info: "Scrie ce informații îi mai trebuie aplicantului să trimită.",
  reject: "Scrie motivul respingerii. Aplicantul îl va primi pe email.",
};

/**
 * Decizia unui administrator asupra unei aplicații de mentor.
 * Verifică pe server rolul, existența aplicației și starea ei, apoi salvează decizia.
 */
export async function reviewApplication(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const viewer = await requireUser("admin");
  if (viewer.role !== "admin")
    return {
      status: "error",
      message: "Nu ai dreptul să faci această acțiune.",
    };

  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!(raw in NEW_STATUS))
    return { status: "error", message: "Acțiune necunoscută." };
  const decision = raw as ReviewDecision;

  const application = await getMentorApplication(id);
  if (!application)
    return { status: "error", message: "Aplicația nu mai există." };
  if (application.status !== "pending" && application.status !== "needs_info")
    return {
      status: "error",
      message: "Aplicația a primit deja o decizie finală.",
    };

  const required = NOTE_REQUIRED[decision];
  if (required && note.length === 0)
    return { status: "error", noteError: required, note };
  if (required && note.length < 10)
    return {
      status: "error",
      noteError: "Scrie cel puțin 10 caractere, ca mesajul să fie clar.",
      note,
    };
  if (note.length > 1000)
    return {
      status: "error",
      noteError: "Mesajul poate avea cel mult 1000 de caractere.",
      note,
    };

  // La aprobare: contul de mentor se creează printr-o invitație pe email (link unic,
  // cu termen limitat), în care mentorul își alege singur parola.
  if (decision === "approve") {
    const admin = supabaseAdmin();
    if (!admin)
      return { status: "error", message: "Serverul nu are cheile Supabase." };
    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(application.email, {
        data: { display_name: application.fullName },
        redirectTo: `${await siteOrigin()}/auth/confirm?next=/activare`,
      });
    if (inviteError || !invited.user)
      return {
        status: "error",
        message:
          inviteError?.code === "email_exists"
            ? "Există deja un cont cu această adresă de email. Verifică-l în pagina Utilizatori."
            : "Invitația nu a putut fi trimisă. Încearcă din nou.",
      };
    // Rolul se schimbă doar aici, pe server: un cont nou e mereu de elev.
    const { error: roleError } = await admin
      .from("profiles")
      .update({ role: "mentor" })
      .eq("id", invited.user.id);
    if (roleError)
      return { status: "error", message: "Contul nu a putut fi făcut mentor." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("mentor_applications")
    .update({ status: NEW_STATUS[decision], review_note: note || null })
    .eq("id", application.id);
  if (error)
    return { status: "error", message: "Decizia nu a putut fi salvată." };
  revalidatePath("/admin", "layout");

  return {
    status: "success",
    decision,
    newStatus: NEW_STATUS[decision],
    note: note || undefined,
  };
}

"use server";

import { getMentorApplication, getViewer } from "@/lib/data/queries";
import type { ApplicationStatus } from "@/lib/data/types";

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
 * Verifică pe server rolul, existența aplicației și starea ei. În demo nu salvează nimic.
 */
export async function reviewApplication(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const viewer = await getViewer("admin");
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

  // Demo: aici s-ar salva decizia și s-ar trimite emailul către aplicant.
  // La aprobare: cont de mentor creat, plus un link de activare unic, cu termen limitat.
  return {
    status: "success",
    decision,
    newStatus: NEW_STATUS[decision],
    note: note || undefined,
  };
}

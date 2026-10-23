"use server";

import { getUser, getViewer } from "@/lib/data/queries";
import type { AccountStatus } from "@/lib/data/types";

export type AccountAction = "suspend" | "reactivate" | "deactivate";

export type AccountState =
  | { status: "idle" }
  | { status: "error"; message?: string; reasonError?: string; reason?: string }
  | { status: "success"; userId: string; newStatus: AccountStatus };

const NEW_STATUS: Record<AccountAction, AccountStatus> = {
  suspend: "suspended",
  reactivate: "active",
  deactivate: "deactivated",
};

/** Din ce stări se poate aplica fiecare acțiune. */
const ALLOWED_FROM: Record<AccountAction, AccountStatus[]> = {
  suspend: ["active"],
  reactivate: ["suspended", "deactivated"],
  deactivate: ["active", "suspended"],
};

/**
 * Schimbă starea unui cont. Verifică pe server: rolul de administrator, că
 * administratorul nu își modifică propriul cont și că trecerea este permisă.
 * Rolul utilizatorului nu se poate schimba de aici. În demo nu salvează nimic.
 */
export async function changeAccountStatus(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const viewer = await getViewer("admin");
  if (viewer.role !== "admin")
    return {
      status: "error",
      message: "Nu ai dreptul să faci această acțiune.",
    };

  const userId = String(formData.get("userId") ?? "");
  const raw = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  // Starea curentă văzută în interfață (în demo, modificările anterioare nu se salvează).
  const shown = String(formData.get("currentStatus") ?? "");

  if (!(raw in NEW_STATUS))
    return { status: "error", message: "Acțiune necunoscută." };
  const action = raw as AccountAction;

  const user = await getUser(userId);
  if (!user) return { status: "error", message: "Contul nu mai există." };
  if (user.id === viewer.id)
    return {
      status: "error",
      message: "Nu îți poți modifica propriul cont din această pagină.",
    };

  const current = (["active", "suspended", "deactivated"] as const).includes(
    shown as AccountStatus,
  )
    ? (shown as AccountStatus)
    : user.status;
  if (!ALLOWED_FROM[action].includes(current))
    return {
      status: "error",
      message: "Acțiunea nu se potrivește cu starea actuală a contului.",
    };

  if (reason.length === 0)
    return {
      status: "error",
      reasonError: "Scrie motivul. Rămâne în istoricul contului.",
      reason,
    };
  if (reason.length < 5)
    return {
      status: "error",
      reasonError: "Scrie cel puțin 5 caractere.",
      reason,
    };
  if (reason.length > 500)
    return {
      status: "error",
      reasonError: "Motivul poate avea cel mult 500 de caractere.",
      reason,
    };

  // Demo: aici s-ar salva starea și motivul, s-ar închide sesiunile active
  // (la suspendare sau dezactivare) și s-ar anunța utilizatorul pe email.
  return { status: "success", userId: user.id, newStatus: NEW_STATUS[action] };
}

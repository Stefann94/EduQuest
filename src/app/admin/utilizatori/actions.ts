"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import type { AccountStatus } from "@/lib/data/types";
import { getAccountStatus, setAccountStatus } from "@/lib/db/admin";

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
 * Rolul utilizatorului nu se poate schimba de aici.
 */
export async function changeAccountStatus(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const viewer = await requireUser("admin");
  if (viewer.role !== "admin")
    return {
      status: "error",
      message: "Nu ai dreptul să faci această acțiune.",
    };

  const userId = String(formData.get("userId") ?? "");
  const raw = String(formData.get("action") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!(raw in NEW_STATUS))
    return { status: "error", message: "Acțiune necunoscută." };
  const action = raw as AccountAction;

  const user = await getAccountStatus(userId);
  if (!user) return { status: "error", message: "Contul nu mai există." };
  if (user.id === viewer.id)
    return {
      status: "error",
      message: "Nu îți poți modifica propriul cont din această pagină.",
    };

  const current = user.status;
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

  // Suspendarea și dezactivarea blochează autentificarea și închid sesiunile deschise.
  if (!(await setAccountStatus(user.id, NEW_STATUS[action])))
    return {
      status: "error",
      message: "Modificarea nu s-a putut salva. Încearcă din nou.",
    };
  revalidatePath("/admin", "layout");
  return { status: "success", userId: user.id, newStatus: NEW_STATUS[action] };
}

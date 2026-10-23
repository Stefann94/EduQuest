"use server";

import { getViewer } from "@/lib/data/queries";
import {
  fieldErrors,
  generateInviteCode,
  readClassDetails,
  submittedValues,
} from "./class-schema";
import {
  type ClassFieldErrors,
  type ClassFormValues,
  formatSchedule,
} from "./schedule";

export type CreateClassState =
  | { status: "idle" }
  | { status: "success"; name: string; schedule: string; code: string }
  | { status: "error"; errors: ClassFieldErrors; values: ClassFormValues };

/** Creează o clasă nouă și îi generează codul de invitație. În demo nu salvează nimic. */
export async function createClass(
  _prev: CreateClassState,
  formData: FormData,
): Promise<CreateClassState> {
  await getViewer("mentor");
  const parsed = readClassDetails(formData);
  if (!parsed.success)
    return {
      status: "error",
      errors: fieldErrors(parsed.error),
      values: submittedValues(formData),
    };
  return {
    status: "success",
    name: parsed.data.name,
    schedule: formatSchedule(parsed.data),
    code: generateInviteCode(),
  };
}

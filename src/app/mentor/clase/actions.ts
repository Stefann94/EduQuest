"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db/core";
import { fieldErrors, readClassDetails, submittedValues } from "./class-schema";
import {
  type ClassFieldErrors,
  type ClassFormValues,
  formatSchedule,
} from "./schedule";

export type CreateClassState =
  | { status: "idle" }
  | {
      status: "success";
      id: string;
      name: string;
      schedule: string;
      code: string;
    }
  | { status: "error"; errors: ClassFieldErrors; values: ClassFormValues };

/** Creează o clasă nouă. Codul de invitație (unic) îl generează baza de date. */
export async function createClass(
  _prev: CreateClassState,
  formData: FormData,
): Promise<CreateClassState> {
  const me = await requireUser("mentor");
  const parsed = readClassDetails(formData);
  if (!parsed.success)
    return {
      status: "error",
      errors: fieldErrors(parsed.error),
      values: submittedValues(formData),
    };
  const schedule = formatSchedule(parsed.data);
  const supabase = await db();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description,
      schedule,
      mentor_id: me.id,
    })
    .select("id, invite_code")
    .single();
  if (error || !data)
    return {
      status: "error",
      errors: { name: "Clasa nu s-a putut crea. Încearcă din nou." },
      values: submittedValues(formData),
    };
  revalidatePath("/mentor", "layout");
  return {
    status: "success",
    id: data.id,
    name: parsed.data.name,
    schedule,
    code: data.invite_code,
  };
}

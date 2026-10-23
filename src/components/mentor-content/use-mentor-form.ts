"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { DEMO_NOTE, type FormState, IDLE } from "./form-state";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Leagă un formular de o Server Action prin useActionState.
 * Trimitem din `onSubmit` (nu prin `action`), ca React să nu golească formularul
 * după o eroare de validare. `prepare` poate completa FormData (liste dinamice, fișiere).
 */
export function useMentorForm(
  action: Action,
  prepare?: (formData: FormData) => void,
) {
  const [state, dispatch, pending] = useActionState(action, IDLE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message, { description: state.detail ?? DEMO_NOTE });
    } else if (state.status === "error") {
      toast.error(state.message);
      // Mutăm focusul pe primul câmp cu eroare.
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(e.currentTarget, submitter);
    prepare?.(formData);
    startTransition(() => dispatch(formData));
  }

  const errors = state.status === "error" ? state.errors : {};
  return { state, pending, errors, formRef, onSubmit };
}

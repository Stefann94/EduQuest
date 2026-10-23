"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Copiază un text (de exemplu codul de invitație) și confirmă cu un mesaj. */
export function CopyButton({
  value,
  label = "Copiază",
  successMessage = "Copiat în clipboard.",
  variant = "outline",
  size = "sm",
  iconOnly = false,
}: {
  value: string;
  label?: string;
  successMessage?: string;
  variant?: "outline" | "secondary" | "ghost" | "default";
  size?: "sm" | "default" | "icon-sm" | "icon";
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nu am putut copia. Selectează textul și copiază-l manual.");
    }
  }

  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      aria-label={iconOnly ? label : undefined}
    >
      <Icon aria-hidden="true" />
      {iconOnly ? null : copied ? "Copiat" : label}
    </Button>
  );
}

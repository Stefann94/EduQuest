"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

/** Intrare rapidă într-un quiz live, pentru elevii logați (fără nickname). */
export function PinJoin({
  className,
  onColor = false,
}: {
  className?: string;
  /** Pe fundal în culoarea temei: butonul devine alb ca să se vadă. */
  onColor?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [pin, setPin] = useState("");
  const ready = pin.length === PIN_LENGTH;

  return (
    <form
      className={cn("stagger-zoom flex flex-col gap-3 sm:flex-row", className)}
      onSubmit={(e) => {
        e.preventDefault();
        // Demo: fără sesiuni reale încă, mergem la quiz-ul demo.
        if (ready) router.push("/live");
      }}
    >
      <label htmlFor={id} className="sr-only">
        PIN quiz
      </label>
      <Input
        id={id}
        value={pin}
        onChange={(e) =>
          setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
        }
        inputMode="numeric"
        autoComplete="off"
        placeholder="PIN: 000000"
        className="h-14 flex-1 text-center font-bold font-mono text-2xl tracking-[0.25em] placeholder:tracking-normal"
      />
      <Button
        type="submit"
        size="lg"
        variant={onColor ? "outline" : "default"}
        disabled={!ready}
        className="h-14"
      >
        Intră <ArrowRight />
      </Button>
    </form>
  );
}

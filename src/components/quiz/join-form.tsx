"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PIN_LENGTH = 6;
const NICKNAME_MAX = 16;

export function JoinForm() {
  const router = useRouter();
  const [step, setStep] = useState<"pin" | "nickname">("pin");
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");

  const pinReady = pin.length === PIN_LENGTH;
  const nicknameReady = nickname.trim().length >= 2;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "pin") {
      if (pinReady) setStep("nickname");
      return;
    }
    // Demo: deocamdată nu există sesiuni reale, așa că mergem direct la quiz-ul demo.
    if (nicknameReady) router.push("/live");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-pop rounded-3xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8"
    >
      {step === "pin" ? (
        <>
          <h1 className="font-bold text-2xl tracking-tight">Intră în joc</h1>
          <p className="mt-1 text-muted-foreground">
            Scrie PIN-ul de pe ecranul mentorului.
          </p>
          <Label htmlFor="pin" className="sr-only">
            PIN
          </Label>
          <Input
            id="pin"
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
            }
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="000000"
            aria-describedby="pin-help"
            className="mt-6 h-16 text-center font-bold font-mono text-3xl tracking-[0.4em] md:text-3xl"
          />
          <p id="pin-help" className="mt-2 text-muted-foreground text-sm">
            {PIN_LENGTH} cifre
          </p>
          <Button
            type="submit"
            disabled={!pinReady}
            className="mt-6 h-12 w-full gap-2 text-base"
          >
            Continuă <ArrowRight />
          </Button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep("pin")}
            className="-ml-1 flex items-center gap-1 rounded-md px-1 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> PIN {pin}
          </button>
          <h1 className="mt-3 font-bold text-2xl tracking-tight">
            Cum te cheamă în joc?
          </h1>
          <p className="mt-1 text-muted-foreground">
            Alege un nickname. Nu folosi numele complet.
          </p>
          <Label htmlFor="nickname" className="sr-only">
            Nickname
          </Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX))}
            autoComplete="off"
            autoFocus
            placeholder="ex. PythonNinja"
            className="mt-6 h-14 text-center font-semibold text-xl md:text-xl"
          />
          <Button
            type="submit"
            disabled={!nicknameReady}
            className="mt-6 h-12 w-full gap-2 text-base"
          >
            Intră în joc <ArrowRight />
          </Button>
        </>
      )}
    </form>
  );
}

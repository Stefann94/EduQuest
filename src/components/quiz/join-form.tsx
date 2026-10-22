"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AvatarPicker,
  ColorPicker,
} from "@/components/personalize/theme-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;
const NICKNAME_MAX = 16;
const STEPS = ["pin", "nickname", "style"] as const;
type Step = (typeof STEPS)[number];

export function JoinForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [nickname, setNickname] = useState("");

  const pinReady = pin.length === PIN_LENGTH;
  const nicknameReady = nickname.trim().length >= 2;
  const stepIndex = STEPS.indexOf(step);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "pin" && pinReady) setStep("nickname");
    else if (step === "nickname" && nicknameReady) setStep("style");
    // Demo: deocamdată nu există sesiuni reale, așa că mergem direct la quiz-ul demo.
    else if (step === "style") router.push("/live");
  }

  return (
    <form onSubmit={handleSubmit} className="sticker p-6 sm:p-8">
      <div className="mb-6 flex gap-2" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "h-2.5 flex-1 rounded-full transition-colors",
              i <= stepIndex ? "bg-primary" : "bg-secondary",
            )}
          />
        ))}
      </div>

      {step !== "pin" ? (
        <button
          type="button"
          onClick={() => setStep(STEPS[stepIndex - 1])}
          className="-ml-1 mb-2 flex items-center gap-1 rounded-lg px-1 font-bold text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Înapoi
        </button>
      ) : null}

      {step === "pin" && (
        <div key="pin" className="animate-pop">
          <h1 className="font-bold text-3xl">Intră în joc! 🎟️</h1>
          <p className="mt-1 font-semibold text-muted-foreground">
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
            className="mt-6 h-18 text-center font-bold font-mono text-4xl tracking-[0.35em]"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!pinReady}
            className="mt-6 w-full"
          >
            Continuă <ArrowRight />
          </Button>
        </div>
      )}

      {step === "nickname" && (
        <div key="nickname" className="animate-pop">
          <h1 className="font-bold text-3xl">Cum te cheamă? ✏️</h1>
          <p className="mt-1 font-semibold text-muted-foreground">
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
            className="mt-6 h-16 text-center font-bold text-2xl"
          />
          <Button
            type="submit"
            size="lg"
            disabled={!nicknameReady}
            className="mt-6 w-full"
          >
            Continuă <ArrowRight />
          </Button>
        </div>
      )}

      {step === "style" && (
        <div key="style" className="grid animate-pop gap-6">
          <div>
            <h1 className="font-bold text-3xl">Arată-ne stilul tău! ✨</h1>
            <p className="mt-1 font-semibold text-muted-foreground">
              Așa te vor vedea ceilalți în joc, {nickname.trim()}.
            </p>
          </div>
          <ColorPicker />
          <AvatarPicker />
          <Button type="submit" size="lg" className="w-full">
            Hai în joc! 🚀
          </Button>
        </div>
      )}
    </form>
  );
}

"use client";

import { Play, Radio, Users } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startLiveSession } from "@/app/mentor/live/actions";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * „Deschide o sesiune” pentru un quiz live: alegi clasa, iar acțiunea deschide sala de
 * așteptare (cod unic de 6 cifre) și te duce în panoul de control.
 */
export function LiveQuizStart({
  quizId,
  questionCount,
  classes,
  size = "default",
  variant = "cta",
  label = "Deschide o sesiune",
}: {
  quizId: string;
  questionCount: number;
  classes: { id: string; name: string }[];
  size?: "default" | "sm" | "lg";
  variant?: "cta" | "outline" | "default";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<string | null>(null);

  const start = (classId: string) => {
    setChosen(classId);
    startTransition(async () => {
      // La reușită, acțiunea redirecționează spre panoul de control.
      const r = await startLiveSession({ quizId, classId });
      if (r && !r.ok) {
        toast.error(r.message);
        setChosen(null);
      }
    });
  };

  if (questionCount === 0)
    return (
      <span
        className={cn(
          buttonVariants({ variant: "outline", size }),
          "pointer-events-none opacity-60",
        )}
        title="Adaugă întâi întrebări"
      >
        <Radio aria-hidden="true" /> Fără întrebări
      </span>
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonVariants({ variant, size })}>
        <Radio aria-hidden="true" /> {label}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 gap-3 p-3">
        <div className="grid gap-0.5">
          <PopoverTitle className="font-bold font-heading uppercase tracking-wide">
            Pentru ce clasă?
          </PopoverTitle>
          <PopoverDescription className="text-xs">
            Primești un cod de 6 cifre. Jocul începe când apeși „Începe”.
          </PopoverDescription>
        </div>
        {classes.length > 0 ? (
          <ul className="grid gap-1">
            {classes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(c.id)}
                  className="flex w-full cut-xs items-center gap-2 bg-muted/60 px-3 py-2 text-left font-medium text-sm outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-3 focus-visible:ring-ring/70 disabled:opacity-60"
                >
                  <Users className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  {pending && chosen === c.id ? (
                    <span className="text-xs">Se deschide…</span>
                  ) : (
                    <Play className="size-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Nu ai clase active.{" "}
            <Link href="/mentor/clase" className="text-primary underline">
              Creează o clasă
            </Link>
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

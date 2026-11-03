"use client";

import { CircleCheck, CircleSlash, Hand } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { setHomeworkChoice } from "@/app/(student)/teme/[id]/actions";
import { Button } from "@/components/ui/button";
import type { HomeworkChoice } from "@/lib/db/homework";
import { cn } from "@/lib/utils";

/**
 * La o temă opțională, elevul spune dacă o face, ca mentorul să nu-l aștepte degeaba.
 * Alegerea se poate schimba oricând; trimiterea unei rezolvări o face automat „o fac”.
 */
export function OptionalChoice({
  assignmentId,
  choice,
}: {
  assignmentId: string;
  choice: HomeworkChoice;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (c: "accepted" | "declined") =>
    start(async () => {
      const r = await setHomeworkChoice(assignmentId, c);
      if (r.ok) toast.success(r.message);
      else toast.error(r.message);
      router.refresh();
    });

  const Icon =
    choice === "accepted"
      ? CircleCheck
      : choice === "declined"
        ? CircleSlash
        : Hand;
  return (
    <section
      aria-label="Tema opțională"
      className={cn(
        "flex cut-sm flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4",
        choice === "accepted"
          ? "bg-success-soft"
          : choice === "declined"
            ? "bg-muted"
            : "bg-cyan/10",
      )}
    >
      <Icon className="size-6 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 basis-64">
        <p className="font-bold font-heading uppercase tracking-wide">
          {choice === "accepted"
            ? "Ai ales să faci tema"
            : choice === "declined"
              ? "Ai ales să nu faci tema"
              : "Tema e opțională. O faci?"}
        </p>
        <p className="text-muted-foreground text-sm">
          {choice === "declined"
            ? "Mentorul vede că nu o faci și nu te mai așteaptă. Te poți răzgândi oricând."
            : choice === "accepted"
              ? "Mentorul vede că o faci și îți așteaptă rezolvarea."
              : "Spune-i mentorului dacă o faci, ca să nu te aștepte degeaba."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {choice !== "accepted" ? (
          <Button
            variant="cta"
            size="sm"
            disabled={pending}
            onClick={() => choose("accepted")}
          >
            <CircleCheck aria-hidden="true" />
            {choice === "declined" ? "M-am răzgândit, o fac" : "O fac"}
          </Button>
        ) : null}
        {choice !== "declined" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => choose("declined")}
          >
            <CircleSlash aria-hidden="true" />
            {choice === "accepted" ? "Nu o mai fac" : "Nu o fac"}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

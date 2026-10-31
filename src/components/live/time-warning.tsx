import { Hourglass } from "lucide-react";
import { LAST_SECONDS } from "@/lib/live";

/**
 * Avertismentul din ultimele 15 secunde ale unei întrebări live. Apare cu o animație
 * scurtă (o singură dată) și rămâne până expiră timpul.
 */
export function TimeWarning({
  left,
  seconds,
}: {
  left: number;
  seconds: number;
}) {
  // La întrebările scurte (≤ 15 s) avertismentul n-ar avea rost: tot timpul e „ultimul”.
  if (seconds <= LAST_SECONDS || left <= 0 || left > LAST_SECONDS) return null;
  return (
    <output className="pop-in slant inline-flex items-center gap-2 bg-xp px-4 py-1.5 font-bold font-heading text-sm text-white uppercase tracking-wide">
      <Hourglass className="size-4" aria-hidden="true" />
      Mai sunt {LAST_SECONDS} secunde!
    </output>
  );
}

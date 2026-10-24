import { Swords } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDateTime, now, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

/** Timpul până la început, în zile/ore/minute (ora din demo, nu a browserului). */
function countdown(iso: string) {
  const ms = Math.max(0, new Date(iso).getTime() - now().getTime());
  const min = Math.floor(ms / 60000);
  const days = Math.floor(min / 1440);
  const hours = Math.floor((min % 1440) / 60);
  const minutes = min % 60;
  return days > 0
    ? [
        { value: days, label: days === 1 ? "zi" : "zile" },
        { value: hours, label: "ore" },
        { value: minutes, label: "min" },
      ]
    : [
        { value: hours, label: "ore" },
        { value: minutes, label: "min" },
      ];
}

/** Următorul quiz live („arena”), cu numărătoare inversă și locul pentru PIN. */
export function ArenaCard({
  session,
}: {
  session?: {
    title: string;
    className: string;
    startsAt: string;
    players: number;
    live: boolean;
  };
}) {
  if (!session)
    return (
      <section className="cut grid gap-3 bg-card p-6">
        <p className="flex items-center gap-2 font-bold font-heading text-muted-foreground text-sm uppercase tracking-widest">
          <Swords className="size-4" aria-hidden="true" />
          Arena live
        </p>
        <h2 className="font-extrabold text-3xl leading-none">
          Nicio arenă programată
        </h2>
        <p className="text-muted-foreground text-sm">
          Până la următorul quiz live, încearcă un quiz de exersare.
        </p>
        <Link
          href="/quiz"
          className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-2")}
        >
          Quiz-uri de exersare
        </Link>
      </section>
    );

  return (
    <section className="relative cut overflow-hidden bg-[linear-gradient(140deg,var(--primary),#8a3a22_75%)] p-6 text-primary-foreground">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 -right-5 size-40 bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.12)_0_8px,transparent_8px_16px)]"
      />
      <p className="relative flex items-center gap-2 font-bold font-heading text-sm uppercase tracking-widest">
        <span
          aria-hidden="true"
          className="size-2 animate-pulse rounded-full bg-cta"
        />
        Arena live · {formatDateTime(session.startsAt)}
      </p>
      <h2 className="relative mt-2 font-extrabold text-4xl leading-[0.95]">
        {session.title}
      </h2>
      <p className="relative mt-1 text-sm opacity-90">
        {session.className} · {plural(session.players, "jucător", "jucători")}
      </p>

      {session.live ? (
        <p className="relative mt-4 inline-block bg-black/15 px-3 py-1.5 font-bold font-heading uppercase tracking-wide">
          A început, intră acum
        </p>
      ) : (
        <div className="relative mt-4">
          <p className="sr-only">
            Începe în{" "}
            {countdown(session.startsAt)
              .map((c) => `${c.value} ${c.label}`)
              .join(", ")}
          </p>
          <div aria-hidden="true" className="flex gap-2">
            {countdown(session.startsAt).map((c) => (
              <span
                key={c.label}
                className="min-w-16 bg-black/15 px-3 py-1.5 text-center"
              >
                <b className="block font-extrabold font-heading text-3xl tabular-nums leading-none">
                  {String(c.value).padStart(2, "0")}
                </b>
                <span className="text-[11px] uppercase tracking-widest opacity-80">
                  {c.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Locurile pentru PIN-ul de 6 cifre, primit de la mentor la început. */}
      <div aria-hidden="true" className="relative mt-4 flex gap-1.5">
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: locuri fixe
            key={i}
            className="grid h-12 flex-1 -skew-x-6 place-items-center bg-black/15 font-extrabold font-heading text-2xl text-primary-foreground/50"
          >
            ·
          </span>
        ))}
      </div>
      <p className="relative mt-2 text-xs opacity-85">
        Intri cu PIN-ul de 6 cifre pe care ți-l dă mentorul la început.
      </p>

      <Link
        href="/live"
        className={cn(
          buttonVariants({ variant: "cta", size: "lg" }),
          "relative mt-4 h-12 w-full text-lg",
        )}
      >
        Intră în arenă ▸
      </Link>
    </section>
  );
}

import { Swords } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 6;

/** Quiz-ul live deschis acum („arena”), cu locul pentru PIN. Nu există sesiuni programate. */
export function ArenaCard({
  session,
}: {
  session?: {
    title: string;
    className: string;
    players: number;
    running: boolean;
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
          Nicio arenă deschisă
        </h2>
        <p className="text-muted-foreground text-sm">
          Mentorul deschide quiz-urile live în timpul întâlnirilor. Până atunci,
          exersează.
        </p>
        <Link
          href="/quiz"
          className={cn(buttonVariants({ variant: "cta", size: "lg" }), "mt-2")}
        >
          Quiz-urile tale
        </Link>
      </section>
    );

  return (
    <section className="relative cut overflow-hidden bg-[linear-gradient(140deg,var(--primary),#8a3a22_75%)] p-6 text-primary-foreground">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-5 -right-5 size-40 bg-[repeating-linear-gradient(-45deg,rgb(255_255_255/0.07)_0_8px,transparent_8px_16px)]"
      />
      <p className="relative flex items-center gap-2 font-bold font-heading text-sm uppercase tracking-widest">
        <span aria-hidden="true" className="size-2 rounded-full bg-cta" />
        Arena live · {session.running ? "în desfășurare" : "deschisă acum"}
      </p>
      <h2 className="relative mt-2 font-extrabold text-4xl leading-[0.95]">
        {session.title}
      </h2>
      <p className="relative mt-1 text-sm opacity-90">
        {session.className} · {plural(session.players, "jucător", "jucători")}
      </p>

      <p className="relative mt-4 inline-block bg-black/15 px-3 py-1.5 font-bold font-heading uppercase tracking-wide">
        {session.running ? "A început, intră acum" : "Se așteaptă jucătorii"}
      </p>

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

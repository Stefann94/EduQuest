import { UserAvatar } from "@/components/common/user-avatar";
import type { AvatarId } from "@/lib/data/types";

/** Cardul elevului: avatar, nume, locul cel mai bun și trei cifre. */
export function PlayerCard({
  name,
  avatar,
  rankLine,
  stats,
}: {
  name: string;
  avatar?: AvatarId;
  rankLine?: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <section
      aria-label="Profilul tău"
      className="cut grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 border-cyan border-l-4 bg-card p-5"
    >
      <UserAvatar name={name} avatar={avatar} size="xl" />
      <div className="min-w-0">
        <p className="truncate font-extrabold font-heading text-2xl uppercase leading-tight">
          {name}
        </p>
        {rankLine ? (
          <p className="font-bold font-heading text-sm text-xp uppercase tracking-widest">
            {rankLine}
          </p>
        ) : null}
      </div>
      <dl className="col-span-2 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col-reverse bg-background px-3 py-2"
          >
            <dt className="mt-1 text-muted-foreground text-xs">{s.label}</dt>
            <dd className="font-extrabold font-heading text-[26px] tabular-nums leading-none">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

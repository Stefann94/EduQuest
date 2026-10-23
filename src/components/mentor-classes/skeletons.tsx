import { Skeleton } from "@/components/ui/skeleton";

/** Antetul unei clase, cât timp se încarcă. */
export function ClassHeaderSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/** O secțiune de clasă, cât timp se încarcă: un titlu și câteva rânduri. */
export function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-2 rounded-xl border bg-card p-3 shadow-xs">
        {Array.from({ length: rows }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rânduri statice de încărcare
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Prezentarea clasei, cât timp se încarcă: cifre cheie și două blocuri. */
export function OverviewSkeleton() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: carduri statice de încărcare
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

/** Locul antetului clasei cât timp se încarcă. */
export function ClassHeaderSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/** Locul conținutului unei secțiuni: câteva carduri / rânduri. */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: rows }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rânduri fixe, fără conținut
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Locul unei pagini cu antet (material, problemă). */
export function DetailSkeleton() {
  return (
    <div className="grid gap-6" aria-hidden="true">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-96 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

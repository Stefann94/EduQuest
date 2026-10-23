import { Skeleton } from "@/components/ui/skeleton";

// Schelete pentru paginile care citesc `params` (afișate cât se încarcă datele).

function HeaderSkeleton() {
  return (
    <div className="grid gap-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <HeaderSkeleton />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

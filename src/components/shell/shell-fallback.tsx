import { Logo } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Cadrul afișat cât timp se citește sesiunea: bara de sus și un schelet de pagină.
 * Are aceeași înălțime ca bara reală, ca pagina să nu sară când se încarcă.
 */
export function ShellFallback() {
  return (
    <div className="flex min-h-dvh flex-col" aria-busy="true">
      <header className="sticky top-0 z-[45] border-b-2 bg-background/90">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-2 px-4 sm:px-6 xl:px-0">
          <Logo className="mr-4" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="hidden h-10 w-28 sm:block" />
            <Skeleton className="size-10" />
          </div>
        </div>
      </header>
      <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:py-8 xl:px-0">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-5 w-96 max-w-full" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-48 lg:col-span-2" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </main>
      <span className="sr-only">Se încarcă…</span>
    </div>
  );
}

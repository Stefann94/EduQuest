import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";

// Cadru comun pentru paginile simple, centrate: intrare cu PIN, autentificare.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="bg-dots absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
      <div className="absolute -top-24 -left-24 -z-10 size-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -right-24 -bottom-24 -z-10 size-96 rounded-full bg-primary/20 blur-3xl" />
      <FloatingShapes />
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center px-4">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="relative w-full max-w-md">
          <Mascot className="absolute -top-20 -right-4 z-10 size-24 rotate-12 animate-float sm:-right-12" />
          {children}
        </div>
      </main>
    </div>
  );
}

function FloatingShapes() {
  const shapes = [
    "top-[18%] left-[8%] size-10 rounded-xl rotate-12 bg-primary/40",
    "top-[70%] left-[12%] size-8 rounded-full bg-primary/30",
    "top-[30%] right-[10%] size-7 rounded-full bg-primary/50",
    "bottom-[12%] right-[22%] size-9 rounded-xl -rotate-12 bg-primary/35",
  ];
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 hidden md:block">
      {shapes.map((s) => (
        <span key={s} className={`absolute animate-float ${s}`} />
      ))}
    </div>
  );
}

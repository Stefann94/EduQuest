import { Suspense } from "react";
import { LiveGame } from "@/components/quiz/live-game";
import { requireUser } from "@/lib/auth";

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto grid w-full max-w-md gap-6 py-6 text-center">
          <p className="text-muted-foreground">Se conectează…</p>
        </div>
      }
    >
      <Content />
    </Suspense>
  );
}

async function Content() {
  const me = await requireUser("student");
  return <LiveGame me={{ id: me.id, name: me.displayName }} />;
}

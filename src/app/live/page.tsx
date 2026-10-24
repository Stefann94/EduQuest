import { LiveGame } from "@/components/quiz/live-game";
import { requireUser } from "@/lib/auth";

export default async function LivePage() {
  const me = await requireUser("student");
  return <LiveGame me={{ id: me.id, name: me.displayName }} />;
}

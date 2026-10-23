import { LiveGame } from "@/components/quiz/live-game";
import { getViewer } from "@/lib/data/queries";

export default async function LivePage() {
  const me = await getViewer("student");
  return <LiveGame me={{ name: me.displayName, avatar: me.avatar }} />;
}

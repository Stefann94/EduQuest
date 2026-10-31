import { redirect } from "next/navigation";

// Quiz-urile au două secțiuni (Live și Pentru clase); se deschide prima.
export default function MentorQuizzesPage() {
  redirect("/mentor/quiz/live");
}

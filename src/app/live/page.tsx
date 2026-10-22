import type { Metadata } from "next";
import { LiveQuizDemo } from "@/components/quiz/live-quiz-demo";

export const metadata: Metadata = { title: "Quiz live" };

export default function LiveQuizPage() {
  return <LiveQuizDemo />;
}

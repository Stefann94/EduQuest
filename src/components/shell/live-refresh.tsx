"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Tabelele urmărite în timp real (vezi migrarea realtime_everything). RLS filtrează
// evenimentele: fiecare utilizator le primește doar pe cele pe care le poate citi.
const TABLES = [
  "notifications",
  "attendance_meetings",
  "attendance_records",
  "class_members",
  "classes",
  "homework_assignments",
  "homework_problems",
  "homework_reviews",
  "homeworks",
  "lesson_classes",
  "lesson_items",
  "lessons",
  "live_sessions",
  "live_results",
  "mentor_applications",
  "problem_submissions",
  "quiz_assignments",
  "quiz_attempts",
  "quiz_questions",
  "quizzes",
  "xp_transactions",
] as const;

/**
 * Pagina se actualizează singură: orice schimbare relevantă din baza de date (o temă
 * trimisă, o evaluare, XP, un material nou, o notificare…) reîmprospătează datele de pe
 * server, fără reîncărcare. Starea din formulare rămâne neatinsă.
 */
export function LiveRefresh() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Mai multe schimbări una după alta (ex. o temă cu 3 probleme) → o singură reîmprospătare.
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };
    let channel = supabase.channel("live-refresh");
    for (const table of TABLES)
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh,
      );
    // Realtime aplică RLS după tokenul utilizatorului: îl dăm înainte de abonare (altfel
    // evenimentele vin cu „401 Unauthorized”) și la fiecare reînnoire a sesiunii.
    let cancelled = false;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      await supabase.realtime.setAuth(data.session?.access_token ?? null);
      channel.subscribe();
    });
    const { data: auth } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void supabase.realtime.setAuth(session?.access_token ?? null);
      },
    );
    // La revenirea în tab: datele pot fi vechi dacă tabul a stat în fundal.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      auth.subscription.unsubscribe();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [router]);
  return null;
}

-- Tot ce se trimite sau se schimbă apare pe loc, fără refresh: browserul ascultă
-- (Supabase Realtime) schimbările din tabelele de mai jos și reîmprospătează pagina.
-- Realtime aplică RLS: fiecare primește doar evenimentele pentru rândurile pe care le poate citi.
-- Fără cheile răspunsurilor (quiz_answer_keys) și fără jocul live (care se citește la secundă).
do $$
declare t text;
begin
  foreach t in array array[
    'attendance_meetings', 'attendance_records', 'class_members', 'classes',
    'homework_assignments', 'homework_problems', 'homework_reviews', 'homeworks',
    'lesson_classes', 'lesson_items', 'lessons', 'live_sessions', 'live_results',
    'mentor_applications', 'problem_submissions', 'quiz_assignments', 'quiz_attempts',
    'quiz_questions', 'quizzes', 'xp_transactions'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

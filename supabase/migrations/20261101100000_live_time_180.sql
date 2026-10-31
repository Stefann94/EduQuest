-- Timpul pe întrebare la quiz-uri: până la 180 de secunde (înainte 120).
alter table public.quiz_questions drop constraint quiz_questions_time_sec_check;
alter table public.quiz_questions add constraint quiz_questions_time_sec_check
  check (time_sec between 5 and 180);

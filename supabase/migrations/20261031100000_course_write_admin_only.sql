-- Cursurile globale le văd toți elevii, deci doar administratorii le pot crea sau modifica
-- din platformă (scripturile de conținut lucrează cu cheia de server, deci nu sunt afectate).
-- Un mentor nu își poate muta lecțiile sau quiz-urile într-un curs global, iar un quiz se
-- poate lega doar de lecțiile autorului lui.

drop policy courses_insert on public.courses;
drop policy courses_update on public.courses;
drop policy courses_delete on public.courses;
create policy courses_insert on public.courses for insert to authenticated
  with check (private.is_admin() and author_id = (select auth.uid()));
create policy courses_update on public.courses for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy courses_delete on public.courses for delete to authenticated
  using (private.is_admin());

drop policy lessons_update on public.lessons;
create policy lessons_update on public.lessons for update to authenticated
  using (private.can_edit_lesson(id))
  with check (author_id = (select auth.uid()) and course_id is null);

drop policy quizzes_update on public.quizzes;
create policy quizzes_update on public.quizzes for update to authenticated
  using (private.can_edit_quiz(id))
  with check (author_id = (select auth.uid()) and course_id is null);

drop policy quiz_lessons_write on public.quiz_lessons;
create policy quiz_lessons_write on public.quiz_lessons for all to authenticated
  using (private.can_edit_quiz(quiz_id))
  with check (private.can_edit_quiz(quiz_id) and private.can_edit_lesson(lesson_id));

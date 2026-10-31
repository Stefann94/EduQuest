-- Un `insert ... returning` (ex. `.insert().select("id")`) verifică și politica de
-- SELECT pe rândul nou. Funcțiile de vizibilitate (`can_view_class(id)` etc.) caută
-- rândul în tabel, dar în aceeași instrucțiune nu-l văd încă, așa că mentorul nu
-- putea crea clase, lecții, teme sau quiz-uri. Verificăm întâi direct coloana de
-- proprietar a rândului, apoi regulile de până acum.

drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select to authenticated
  using (
    (mentor_id = (select auth.uid()) and private.me_active())
    or private.can_view_class(id)
    or private.is_admin()
  );

drop policy if exists lessons_select on public.lessons;
create policy lessons_select on public.lessons for select to authenticated
  using (
    (author_id = (select auth.uid()) and private.me_active())
    or private.can_view_lesson(id)
  );

drop policy if exists homeworks_select on public.homeworks;
create policy homeworks_select on public.homeworks for select to authenticated
  using (
    (author_id = (select auth.uid()) and private.me_active())
    or private.homework_visible(id)
  );

drop policy if exists quizzes_select on public.quizzes;
create policy quizzes_select on public.quizzes for select to authenticated
  using (
    (author_id = (select auth.uid()) and private.me_active())
    or private.can_view_quiz(id)
  );

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses for select to authenticated
  using (
    (author_id = (select auth.uid()) and private.me_active())
    or private.can_view_course(id)
  );

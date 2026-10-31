-- Înțelegerea la clase: pe fiecare quiz, nu doar per total. Rândurile au acum și quiz-ul;
-- totalul (pe lecții, din toate quiz-urile) se adună în aplicație. Întrebările fără lecție
-- intră și ele (lesson_id null), ca un quiz fără etichete să aibă totuși rezultate.
drop function if exists public.class_quiz_mastery(uuid);

create function public.class_quiz_mastery(p_class uuid)
returns table (student_id uuid, display_name text, quiz_id uuid, quiz_title text,
               lesson_id uuid, lesson_title text, correct bigint, total bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_class_mentor(p_class) then
    raise exception 'Doar mentorul clasei vede această analiză.' using errcode = '42501';
  end if;
  return query
    with latest as (
      select distinct on (a.quiz_id, a.student_id) a.*
      from public.quiz_attempts a
      join public.quiz_assignments qa on qa.quiz_id = a.quiz_id and qa.class_id = p_class
      join public.class_members m on m.class_id = p_class and m.student_id = a.student_id
      order by a.quiz_id, a.student_id, a.at desc
    ), answers as (
      select l.student_id, l.quiz_id, nullif(r ->> 'lesson_id', '')::uuid as lesson_id,
             (r ->> 'correct')::boolean as ok
      from latest l, jsonb_array_elements(l.results) r
    )
    select a.student_id, p.display_name, a.quiz_id, q.title, a.lesson_id, ls.title,
           count(*) filter (where a.ok), count(*)
    from answers a
    join public.profiles p on p.id = a.student_id
    join public.quizzes q on q.id = a.quiz_id
    left join public.lessons ls on ls.id = a.lesson_id
    group by a.student_id, p.display_name, a.quiz_id, q.title, a.lesson_id, ls.title
    order by p.display_name, q.title, ls.title;
end;
$$;

revoke all on function public.class_quiz_mastery(uuid) from public, anon;
grant execute on function public.class_quiz_mastery(uuid) to authenticated;

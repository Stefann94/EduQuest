-- Mentorul arhivează un quiz când nu mai vrea să fie folosit: elevii nu-l mai pot
-- rezolva (încercările vechi rămân), iar un quiz live arhivat nu mai pornește sesiuni.

alter table public.quizzes add column archived boolean not null default false;

CREATE OR REPLACE FUNCTION public.submit_quiz(p_quiz uuid, p_answers smallint[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  q public.quizzes%rowtype;
  v_correct integer;
  v_total integer;
  v_previous integer;
  v_class uuid;
  v_results jsonb;
  v_source public.xp_source;
  v_xp integer;
begin
  select * into q from public.quizzes where id = p_quiz;
  if q.id is null or not private.can_view_quiz(q.id) or not private.has_role('student') then
    raise exception 'Quiz indisponibil.' using errcode = '42501';
  end if;
  if q.archived then
    raise exception 'Quiz-ul a fost arhivat de mentor.' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'question_id', qq.id, 'lesson_id', qq.lesson_id,
           'correct', k.correct = p_answers[qq.position]) order by qq.position), '[]'),
         count(*), count(*) filter (where k.correct = p_answers[qq.position])
  into v_results, v_total, v_correct
  from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
  where qq.quiz_id = q.id;

  select count(*) into v_previous from public.quiz_attempts where quiz_id = q.id and student_id = v_me;
  insert into public.quiz_attempts (quiz_id, student_id, answers, results, correct, total)
  values (q.id, v_me, coalesce(p_answers, '{}'), v_results, v_correct, v_total);

  -- XP-ul merge la clasa prin care elevul a primit quiz-ul (dacă există).
  select qa.class_id into v_class
  from public.quiz_assignments qa
  join public.class_members m on m.class_id = qa.class_id and m.student_id = v_me
  where qa.quiz_id = q.id limit 1;
  v_source := case when v_class is null then 'practice_quiz' else 'class_quiz' end::public.xp_source;

  if v_previous = 0 and v_total > 0 then
    v_xp := round(q.xp * v_correct::numeric / v_total);
    if v_xp > 0 then
      insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
      values (v_me, v_class, v_source, v_xp, 'Quiz: ' || q.title, 'quiz:' || q.id || ':' || v_me)
      on conflict (event_key) do nothing;
    end if;
  elsif v_previous = 1 then
    insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
    values (v_me, v_class, v_source, 1, 'Quiz refăcut: ' || q.title, 'quiz-retake:' || q.id || ':' || v_me)
    on conflict (event_key) do nothing;
  end if;

  return jsonb_build_object(
    'correct', v_correct,
    'total', v_total,
    'key', (
      select jsonb_agg(jsonb_build_object('position', qq.position, 'correct', k.correct, 'explanation', k.explanation)
                       order by qq.position)
      from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
      where qq.quiz_id = q.id
    )
  );
end;
$function$;

create or replace function public.create_live_session(p_quiz uuid, p_class uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_title text;
begin
  if not private.is_class_mentor(p_class) or not private.can_edit_quiz(p_quiz) then
    raise exception 'Nu poți porni un quiz live pentru această clasă.' using errcode = '42501';
  end if;
  if not private.quiz_is_live(p_quiz) then
    raise exception 'Quiz-ul nu e un quiz live.' using errcode = '22023';
  end if;
  if (select archived from public.quizzes where id = p_quiz) then
    raise exception 'Quiz-ul e arhivat. Scoate-l din arhivă ca să-l joci.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.quiz_questions where quiz_id = p_quiz) then
    raise exception 'Quiz-ul nu are întrebări.' using errcode = '22023';
  end if;
  select title into v_title from public.quizzes where id = p_quiz;
  insert into public.live_sessions (quiz_id, class_id, title, code, created_by, status)
  values (p_quiz, p_class, v_title, private.new_live_code(), (select auth.uid()), 'lobby')
  returning id into v_id;
  return v_id;
end;
$$;

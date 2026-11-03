-- Punctaj parțial la întrebările cu mai multe răspunsuri corecte (fără să recompensăm
-- „bifez tot”):  credit = max(0, corecte_bifate / total_corecte − greșite_bifate / total_greșite).
-- Toate bifate → 0; jumătate din cele corecte, fără greșeli → 0,5; exact cele corecte → 1.
-- La întrebările simple rămâne 0 sau 1. Aceeași regulă e în src/lib/quiz-answers.ts.

create or replace function private.answer_credit(
  p_key integer, p_answer integer, p_options integer, p_multi boolean
) returns numeric
language sql immutable set search_path = '' as $$
  select case
    when p_answer is null or p_answer < 0 then 0::numeric
    when not p_multi then (p_answer = p_key)::integer::numeric
    else greatest(0::numeric,
      bit_count((p_answer & p_key)::bit(32))::numeric / nullif(bit_count(p_key::bit(32)), 0)
      - coalesce(bit_count((p_answer & ~p_key & ((1 << p_options) - 1))::bit(32))::numeric
                 / nullif(p_options - bit_count(p_key::bit(32)), 0), 0))
  end
$$;

-- Scorul unei încercări poate avea zecimale (ex. 3,5 din 5).
alter table public.quiz_attempts alter column correct type numeric(6, 2);

create or replace function public.submit_quiz(p_quiz uuid, p_answers smallint[])
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  q public.quizzes%rowtype;
  v_correct numeric;
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

  with scored as (
    select qq.id, qq.lesson_id, qq.position,
           coalesce(k.correct = p_answers[qq.position], false) as ok,
           round(private.answer_credit(k.correct, p_answers[qq.position], cardinality(qq.options), qq.multi), 2) as credit
    from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
    where qq.quiz_id = q.id
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'question_id', id, 'lesson_id', lesson_id, 'correct', ok, 'credit', credit)
           order by position), '[]'),
         count(*), coalesce(sum(credit), 0)
  into v_results, v_total, v_correct
  from scored;

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
    v_xp := round(q.xp * v_correct / v_total);
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
$$;

-- Live: punctele (500 + bonus de viteză) se înmulțesc cu creditul răspunsului.
create or replace function public.answer_live(p_session uuid, p_position integer, p_answer integer)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_correct smallint;
  v_options integer;
  v_seconds integer;
  v_multi boolean;
  v_elapsed numeric;
  v_credit numeric;
  v_points integer;
begin
  select * into s from public.live_sessions where id = p_session;
  if s.id is null or s.status <> 'running' or s.reveal or s.current_question <> p_position then
    raise exception 'Întrebarea s-a închis.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.live_players where session_id = s.id and student_id = v_me) then
    raise exception 'Intră întâi cu codul sesiunii.' using errcode = '42501';
  end if;
  select k.correct, cardinality(qq.options), qq.time_sec, qq.multi
  into v_correct, v_options, v_seconds, v_multi
  from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
  where qq.quiz_id = s.quiz_id and qq.position = p_position;
  v_elapsed := extract(epoch from (now() - s.question_started_at));
  -- O secundă de toleranță pentru drumul prin rețea.
  if v_elapsed > v_seconds + 1 then
    raise exception 'Timpul a expirat.' using errcode = '22023';
  end if;
  if (v_multi and (p_answer < 1 or p_answer >= (1 << v_options)))
     or (not v_multi and (p_answer < 0 or p_answer >= v_options)) then
    raise exception 'Variantă inexistentă.' using errcode = '22023';
  end if;
  v_credit := private.answer_credit(v_correct, p_answer, v_options, v_multi);
  v_points := round(v_credit * (500 + 500 * greatest(0, v_seconds - v_elapsed) / v_seconds))::integer;
  insert into public.live_answers (session_id, student_id, position, answer, correct, points)
  values (s.id, v_me, p_position, p_answer, p_answer = v_correct, v_points)
  on conflict do nothing;
end;
$$;

-- Înțelegerea: suma creditelor (încercările vechi, fără credit, contează 0 sau 1).
drop function if exists public.class_quiz_mastery(uuid);

create function public.class_quiz_mastery(p_class uuid)
returns table (student_id uuid, display_name text, quiz_id uuid, quiz_title text,
               lesson_id uuid, lesson_title text, correct numeric, total bigint)
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
             coalesce((r ->> 'credit')::numeric, ((r ->> 'correct')::boolean)::integer::numeric) as credit
      from latest l, jsonb_array_elements(l.results) r
    )
    select a.student_id, p.display_name, a.quiz_id, q.title, a.lesson_id, ls.title,
           sum(a.credit), count(*)
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

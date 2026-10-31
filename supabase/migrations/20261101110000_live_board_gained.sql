-- Clasamentul live arată și câte puncte a luat fiecare elev la ultima întrebare (+x),
-- ca diferențele dintre jucători să se vadă după fiecare rundă.

create or replace function public.live_state(p_session uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_mentor boolean;
  v_total integer;
  v_seconds integer := 40;
  q record;
  v_question jsonb;
  v_counts jsonb;
  v_mine jsonb;
  v_board jsonb;
begin
  select * into s from public.live_sessions where id = p_session;
  if s.id is null or not private.can_view_class(s.class_id) then
    raise exception 'Sesiune indisponibilă.' using errcode = '42501';
  end if;
  v_mentor := private.is_class_mentor(s.class_id);
  if not v_mentor and not exists (
    select 1 from public.live_players where session_id = s.id and student_id = v_me
  ) then
    raise exception 'Intră întâi cu codul sesiunii.' using errcode = '42501';
  end if;
  select count(*) into v_total from public.quiz_questions where quiz_id = s.quiz_id;

  if s.status = 'running' and s.current_question between 1 and v_total then
    select qq.prompt, qq.code, qq.options, qq.time_sec, qq.multi, k.correct, k.explanation into q
    from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
    where qq.quiz_id = s.quiz_id and qq.position = s.current_question;
    v_seconds := q.time_sec;
    v_question := jsonb_build_object(
      'prompt', q.prompt, 'code', q.code, 'options', to_jsonb(q.options), 'multi', q.multi);
    if s.reveal then
      select coalesce(jsonb_agg((
               select count(*) from public.live_answers a
               where a.session_id = s.id and a.position = s.current_question
                 and case when q.multi then (a.answer & (1 << i)) <> 0 else a.answer = i end
             )::integer order by i), '[]')
      into v_counts
      from generate_series(0, cardinality(q.options) - 1) as i;
      v_question := v_question || jsonb_build_object(
        'correct', q.correct, 'explanation', q.explanation, 'counts', v_counts);
    end if;
  end if;

  select jsonb_build_object(
           'answer', a.answer,
           'correct', case when s.reveal then a.correct end,
           'points', case when s.reveal then a.points end)
  into v_mine
  from public.live_answers a
  where a.session_id = s.id and a.student_id = v_me and a.position = s.current_question;

  -- Clasamentul quiz-ului (puncte, nu XP): fără întrebarea curentă până la dezvăluire.
  select coalesce(jsonb_agg(to_jsonb(b) order by b.rank, b.name), '[]') into v_board
  from (
    select p.student_id as id, coalesce(pr.username, pr.display_name) as name, pr.avatar,
           coalesce(sum(a.points), 0)::integer as score,
           rank() over (order by coalesce(sum(a.points), 0) desc)::integer as rank,
           coalesce(sum(a.points) filter (where a.position = s.current_question), 0)::integer as gained,
           r.xp
    from public.live_players p
    join public.profiles pr on pr.id = p.student_id
    left join public.live_answers a
      on a.session_id = p.session_id and a.student_id = p.student_id
     and (s.reveal or s.status = 'ended' or a.position < s.current_question)
    left join public.live_results r on r.session_id = p.session_id and r.student_id = p.student_id
    where p.session_id = s.id
    group by p.student_id, pr.username, pr.display_name, pr.avatar, r.xp
  ) b;

  return jsonb_build_object(
    'status', s.status,
    'title', s.title,
    'code', case when v_mentor then s.code end,
    'current', s.current_question,
    'total', v_total,
    'seconds', v_seconds,
    'startedAt', s.question_started_at,
    'now', now(),
    'reveal', s.reveal,
    'showBoard', s.show_board,
    'question', v_question,
    'mine', v_mine,
    'players', (select count(*) from public.live_players where session_id = s.id),
    'answered', (select count(*) from public.live_answers where session_id = s.id and position = s.current_question),
    'board', v_board,
    'isMentor', v_mentor
  );
end;
$$;

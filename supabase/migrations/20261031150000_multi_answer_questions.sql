-- Întrebări cu mai multe răspunsuri corecte, și 40 de secunde implicit pe întrebare.
--
-- La o întrebare cu `multi`, răspunsul (și cheia) e o mască de biți peste variante:
-- varianta i aleasă ⇔ bitul i e 1 (ex. variantele 1 și 3 → 0b101 = 5). Răspunsul e corect
-- doar dacă setul ales e exact setul corect, deci submit_quiz (egalitate) rămâne la fel.

alter table public.quiz_questions add column multi boolean not null default false;
alter table public.quiz_questions alter column time_sec set default 40;

-- Cheia: o întrebare simplă are un index (0..n-1); una multiplă o mască nenulă (1..2^n-1).
create function private.check_answer_key() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_multi boolean; v_n integer;
begin
  select qq.multi, cardinality(qq.options) into v_multi, v_n
  from public.quiz_questions qq where qq.id = new.question_id;
  if v_multi then
    if new.correct < 1 or new.correct >= (1 << v_n) then
      raise exception 'Alege cel puțin un răspuns corect.' using errcode = '23514';
    end if;
  elsif new.correct >= v_n then
    raise exception 'Varianta corectă nu există.' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger quiz_answer_keys_check before insert or update on public.quiz_answer_keys
  for each row execute function private.check_answer_key();

-- Starea jocului live: `multi` pe întrebare; la o întrebare multiplă, câți au bifat fiecare variantă.
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
    select p.student_id as id, pr.display_name as name, pr.avatar,
           coalesce(sum(a.points), 0)::integer as score,
           rank() over (order by coalesce(sum(a.points), 0) desc)::integer as rank,
           r.xp
    from public.live_players p
    join public.profiles pr on pr.id = p.student_id
    left join public.live_answers a
      on a.session_id = p.session_id and a.student_id = p.student_id
     and (s.reveal or s.status = 'ended' or a.position < s.current_question)
    left join public.live_results r on r.session_id = p.session_id and r.student_id = p.student_id
    where p.session_id = s.id
    group by p.student_id, pr.display_name, pr.avatar, r.xp
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

-- Răspunsul live: la o întrebare multiplă, `p_answer` e masca variantelor bifate.
create or replace function public.answer_live(p_session uuid, p_position integer, p_answer integer) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_correct smallint;
  v_options integer;
  v_seconds integer;
  v_multi boolean;
  v_elapsed numeric;
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
  v_points := case when p_answer = v_correct
    then 500 + round(500 * greatest(0, v_seconds - v_elapsed) / v_seconds)::integer
    else 0 end;
  insert into public.live_answers (session_id, student_id, position, answer, correct, points)
  values (s.id, v_me, p_position, p_answer, p_answer = v_correct, v_points)
  on conflict do nothing;
end;
$$;

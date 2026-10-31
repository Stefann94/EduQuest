-- Quiz-uri live separate de cele date claselor, timp pe fiecare întrebare și, în joc,
-- după fiecare întrebare: câți elevi au ales fiecare variantă, apoi clasamentul.
-- Nu există programare: mentorul deschide o sesiune și le dă elevilor codul.

-- Un quiz e fie live (jucat în sesiuni cu cod), fie dat claselor (rezolvat oricând).
alter table public.quizzes add column live boolean not null default false;

-- Timpul de răspuns, separat pentru fiecare întrebare (doar în quiz-ul live).
alter table public.quiz_questions
  add column time_sec smallint not null default 20 check (time_sec between 5 and 120);

-- După dezvăluirea răspunsului, mentorul arată clasamentul de până acum.
alter table public.live_sessions add column show_board boolean not null default false;

-- Quiz-urile deja jucate live și nedate niciunei clase devin quiz-uri live.
update public.quizzes q set live = true
where q.course_id is null
  and exists (select 1 from public.live_sessions s where s.quiz_id = q.id)
  and not exists (select 1 from public.quiz_assignments a where a.quiz_id = q.id);

-- Întrebările quiz-urilor live își păstrează timpul pe care îl aveau în sesiuni.
update public.quiz_questions qq set time_sec = least(120, greatest(5, s.question_seconds))
from (
  select distinct on (quiz_id) quiz_id, question_seconds
  from public.live_sessions order by quiz_id, created_at desc
) s
where s.quiz_id = qq.quiz_id;

create function private.quiz_is_live(qid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select live from public.quizzes where id = qid), false);
$$;
revoke all on function private.quiz_is_live(uuid) from public, anon;
grant execute on function private.quiz_is_live(uuid) to authenticated;

-- Un quiz live nu se dă claselor (se joacă doar în sesiuni).
drop policy if exists quiz_assign_write on public.quiz_assignments;
create policy quiz_assign_write on public.quiz_assignments for all to authenticated
  using (private.can_edit_quiz(quiz_id) and private.is_class_mentor(class_id))
  with check (
    private.can_edit_quiz(quiz_id)
    and private.is_class_mentor(class_id)
    and not private.quiz_is_live(quiz_id)
  );

-- Sesiune nouă: doar dintr-un quiz live al mentorului, pentru una din clasele lui.
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

-- ---------------------------------------------------------------------------
-- Starea jocului: timpul întrebării curente, după dezvăluire câți au ales fiecare
-- variantă, apoi (show_board) clasamentul de până acum.
-- ---------------------------------------------------------------------------
create or replace function public.live_state(p_session uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_mentor boolean;
  v_total integer;
  v_seconds integer := 20;
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
    select qq.prompt, qq.code, qq.options, qq.time_sec, k.correct, k.explanation into q
    from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
    where qq.quiz_id = s.quiz_id and qq.position = s.current_question;
    v_seconds := q.time_sec;
    v_question := jsonb_build_object('prompt', q.prompt, 'code', q.code, 'options', to_jsonb(q.options));
    if s.reveal then
      select coalesce(jsonb_agg(coalesce(c.n, 0) order by i), '[]') into v_counts
      from generate_series(0, cardinality(q.options) - 1) as i
      left join (
        select answer, count(*)::integer as n from public.live_answers
        where session_id = s.id and position = s.current_question
        group by answer
      ) c on c.answer = i;
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

-- Răspunsul elevului, în timpul întrebării curente (fiecare întrebare are timpul ei).
create or replace function public.answer_live(p_session uuid, p_position integer, p_answer integer) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_correct smallint;
  v_options integer;
  v_seconds integer;
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
  select k.correct, cardinality(qq.options), qq.time_sec into v_correct, v_options, v_seconds
  from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
  where qq.quiz_id = s.quiz_id and qq.position = p_position;
  v_elapsed := extract(epoch from (now() - s.question_started_at));
  -- O secundă de toleranță pentru drumul prin rețea.
  if v_elapsed > v_seconds + 1 then
    raise exception 'Timpul a expirat.' using errcode = '22023';
  end if;
  if p_answer < 0 or p_answer >= v_options then
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

-- Comenzile mentorului: start → (răspunsuri) → reveal (variante) → board (clasament) → next.
create or replace function public.live_control(p_session uuid, p_action text) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.live_sessions%rowtype; v_total integer;
begin
  select * into s from public.live_sessions where id = p_session for update;
  if s.id is null or not private.is_class_mentor(s.class_id) then
    raise exception 'Nu poți controla această sesiune.' using errcode = '42501';
  end if;
  if s.status = 'ended' then
    raise exception 'Sesiunea s-a încheiat.' using errcode = '22023';
  end if;
  select count(*) into v_total from public.quiz_questions where quiz_id = s.quiz_id;

  if p_action = 'start' then
    if s.status = 'running' then return; end if;
    if v_total = 0 then
      raise exception 'Quiz-ul nu are întrebări.' using errcode = '22023';
    end if;
    update public.live_sessions
    set status = 'running', current_question = 1, question_started_at = now(),
        reveal = false, show_board = false
    where id = s.id;
  elsif p_action = 'reveal' then
    if s.status <> 'running' then
      raise exception 'Jocul nu a început.' using errcode = '22023';
    end if;
    update public.live_sessions set reveal = true where id = s.id;
  elsif p_action = 'board' then
    if s.status <> 'running' or not s.reveal then
      raise exception 'Dezvăluie întâi răspunsul.' using errcode = '22023';
    end if;
    update public.live_sessions set show_board = true where id = s.id;
  elsif p_action = 'next' then
    if s.status <> 'running' then
      raise exception 'Jocul nu a început.' using errcode = '22023';
    end if;
    if s.current_question >= v_total then
      perform private.finish_live(s.id);
    else
      update public.live_sessions
      set current_question = current_question + 1, question_started_at = now(),
          reveal = false, show_board = false
      where id = s.id;
    end if;
  elsif p_action = 'finish' then
    perform private.finish_live(s.id);
  else
    raise exception 'Comandă necunoscută.' using errcode = '22023';
  end if;
end;
$$;

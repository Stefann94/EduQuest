-- Quiz-ul live jucat cu adevărat: cine a intrat în sesiune, întrebarea curentă, răspunsurile
-- (cu timpul măsurat de server), clasamentul și XP-ul de la final (5/4/3/2/1).
-- Elevii citesc starea jocului prin live_state, la fiecare secundă; răspunsul corect
-- ajunge la ei doar după ce mentorul îl dezvăluie.

alter table public.live_sessions
  add column current_question smallint not null default 0,
  add column question_started_at timestamptz,
  add column question_seconds smallint not null default 20 check (question_seconds between 5 and 120),
  add column reveal boolean not null default false;

create table public.live_players (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (session_id, student_id)
);

create table public.live_answers (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  position smallint not null,
  answer smallint not null,
  correct boolean not null,
  points integer not null,
  answered_at timestamptz not null default now(),
  primary key (session_id, student_id, position)
);

alter table public.live_players enable row level security;
alter table public.live_answers enable row level security;

grant select on public.live_players to authenticated;
create policy live_players_select on public.live_players for select to authenticated
  using (private.can_view_class((select class_id from public.live_sessions s where s.id = session_id)));

-- Răspunsurile: ale tale; mentorul clasei le vede pe toate. Scrierea doar prin answer_live.
grant select on public.live_answers to authenticated;
create policy live_answers_select on public.live_answers for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.is_class_mentor((select class_id from public.live_sessions s where s.id = session_id))
  );

-- ---------------------------------------------------------------------------
-- Încheierea: locurile (la punctaj egal, același loc) și XP-ul, o singură dată.
-- ---------------------------------------------------------------------------
create function private.finish_live(p_session uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare s public.live_sessions%rowtype; r record; v_xp integer;
begin
  select * into s from public.live_sessions where id = p_session for update;
  if s.id is null or s.status = 'ended' then return; end if;
  update public.live_sessions set status = 'ended', ended_at = now(), reveal = true where id = s.id;
  for r in
    select p.student_id, coalesce(sum(a.points), 0)::integer as score,
           rank() over (order by coalesce(sum(a.points), 0) desc)::integer as rnk
    from public.live_players p
    left join public.live_answers a on a.session_id = p.session_id and a.student_id = p.student_id
    where p.session_id = s.id
    group by p.student_id
  loop
    v_xp := case r.rnk when 1 then 5 when 2 then 4 when 3 then 3 when 4 then 2 else 1 end;
    insert into public.live_results (session_id, student_id, score, rank, xp)
    values (s.id, r.student_id, r.score, r.rnk, v_xp)
    on conflict (session_id, student_id) do update set score = excluded.score, rank = excluded.rank, xp = excluded.xp;
    insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
    values (r.student_id, s.class_id, 'live_quiz', v_xp,
            'Quiz live: ' || s.title || ' (locul ' || r.rnk || ')', 'live:' || s.id || ':' || r.student_id)
    on conflict (event_key) do nothing;
  end loop;
end;
$$;
revoke all on function private.finish_live(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Elevul intră cu codul (doar în sesiunile claselor lui, cât timp nu s-au încheiat).
-- ---------------------------------------------------------------------------
create function public.join_live(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare s public.live_sessions%rowtype;
begin
  if not private.has_role('student') then
    raise exception 'Doar elevii intră în quiz-ul live.' using errcode = '42501';
  end if;
  select * into s from public.live_sessions
  where code = regexp_replace(coalesce(p_code, ''), '\s', '', 'g') and status in ('scheduled', 'lobby', 'running');
  if s.id is null then
    raise exception 'Cod greșit sau sesiune încheiată.' using errcode = 'P0002';
  end if;
  if not private.is_class_member(s.class_id) then
    raise exception 'Sesiunea e pentru altă clasă.' using errcode = '42501';
  end if;
  insert into public.live_players (session_id, student_id) values (s.id, (select auth.uid()))
  on conflict do nothing;
  return s.id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Starea jocului, pentru elev și mentor. Fără răspunsul corect înainte de dezvăluire.
-- ---------------------------------------------------------------------------
create function public.live_state(p_session uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_mentor boolean;
  v_total integer;
  q record;
  v_question jsonb;
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
    select qq.prompt, qq.code, qq.options, k.correct, k.explanation into q
    from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
    where qq.quiz_id = s.quiz_id and qq.position = s.current_question;
    v_question := jsonb_build_object('prompt', q.prompt, 'code', q.code, 'options', to_jsonb(q.options));
    if s.reveal then
      v_question := v_question || jsonb_build_object('correct', q.correct, 'explanation', q.explanation);
    end if;
  end if;

  select jsonb_build_object(
           'answer', a.answer,
           'correct', case when s.reveal then a.correct end,
           'points', case when s.reveal then a.points end)
  into v_mine
  from public.live_answers a
  where a.session_id = s.id and a.student_id = v_me and a.position = s.current_question;

  -- Clasamentul: fără punctele întrebării curente până la dezvăluire.
  select coalesce(jsonb_agg(to_jsonb(b) order by b.rank, b.name), '[]') into v_board
  from (
    select p.student_id as id, pr.display_name as name, pr.avatar,
           coalesce(sum(a.points), 0)::integer as score,
           rank() over (order by coalesce(sum(a.points), 0) desc)::integer as rank
    from public.live_players p
    join public.profiles pr on pr.id = p.student_id
    left join public.live_answers a
      on a.session_id = p.session_id and a.student_id = p.student_id
     and (s.reveal or s.status = 'ended' or a.position < s.current_question)
    where p.session_id = s.id
    group by p.student_id, pr.display_name, pr.avatar
  ) b;

  return jsonb_build_object(
    'status', s.status,
    'title', s.title,
    'code', case when v_mentor then s.code end,
    'current', s.current_question,
    'total', v_total,
    'seconds', s.question_seconds,
    'startedAt', s.question_started_at,
    'now', now(),
    'reveal', s.reveal,
    'question', v_question,
    'mine', v_mine,
    'players', (select count(*) from public.live_players where session_id = s.id),
    'answered', (select count(*) from public.live_answers where session_id = s.id and position = s.current_question),
    'board', v_board,
    'isMentor', v_mentor
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Răspunsul elevului: doar la întrebarea curentă, în timp; primul răspuns rămâne.
-- Punctaj: 0 dacă e greșit, altfel 500 + până la 500 pentru viteză.
-- ---------------------------------------------------------------------------
create function public.answer_live(p_session uuid, p_position integer, p_answer integer) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s public.live_sessions%rowtype;
  v_me uuid := (select auth.uid());
  v_correct smallint;
  v_options integer;
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
  v_elapsed := extract(epoch from (now() - s.question_started_at));
  -- O secundă de toleranță pentru drumul prin rețea.
  if v_elapsed > s.question_seconds + 1 then
    raise exception 'Timpul a expirat.' using errcode = '22023';
  end if;
  select k.correct, cardinality(qq.options) into v_correct, v_options
  from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
  where qq.quiz_id = s.quiz_id and qq.position = p_position;
  if p_answer < 0 or p_answer >= v_options then
    raise exception 'Variantă inexistentă.' using errcode = '22023';
  end if;
  v_points := case when p_answer = v_correct
    then 500 + round(500 * greatest(0, s.question_seconds - v_elapsed) / s.question_seconds)::integer
    else 0 end;
  insert into public.live_answers (session_id, student_id, position, answer, correct, points)
  values (s.id, v_me, p_position, p_answer, p_answer = v_correct, v_points)
  on conflict do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Comenzile mentorului: start, dezvăluie răspunsul, următoarea întrebare, încheie.
-- ---------------------------------------------------------------------------
create function public.live_control(p_session uuid, p_action text) returns void
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
    set status = 'running', current_question = 1, question_started_at = now(), reveal = false
    where id = s.id;
  elsif p_action = 'reveal' then
    if s.status <> 'running' then
      raise exception 'Jocul nu a început.' using errcode = '22023';
    end if;
    update public.live_sessions set reveal = true where id = s.id;
  elsif p_action = 'next' then
    if s.status <> 'running' then
      raise exception 'Jocul nu a început.' using errcode = '22023';
    end if;
    if s.current_question >= v_total then
      perform private.finish_live(s.id);
    else
      update public.live_sessions
      set current_question = current_question + 1, question_started_at = now(), reveal = false
      where id = s.id;
    end if;
  elsif p_action = 'finish' then
    perform private.finish_live(s.id);
  else
    raise exception 'Comandă necunoscută.' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.join_live(text) from public, anon;
revoke all on function public.live_state(uuid) from public, anon;
revoke all on function public.answer_live(uuid, integer, integer) from public, anon;
revoke all on function public.live_control(uuid, text) from public, anon;
grant execute on function public.join_live(text) to authenticated;
grant execute on function public.live_state(uuid) to authenticated;
grant execute on function public.answer_live(uuid, integer, integer) to authenticated;
grant execute on function public.live_control(uuid, text) to authenticated;

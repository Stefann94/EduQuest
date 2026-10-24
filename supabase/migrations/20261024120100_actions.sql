-- Acțiunile sensibile, ca funcții în baza de date. Fiecare verifică cine o apelează
-- și respectă regulile de XP din docs/PROJECT.md §7.5 și §10:
-- * +2 XP pentru prezență și pentru o trimitere validă, o singură dată;
-- * bonus de calitate 0–max, ajustabil de mentor (se recalculează, nu se adună);
-- * nimeni nu-și poate modifica singur XP-ul.

-- Intrarea într-o clasă cu codul de invitație.
create function public.join_class(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_class uuid;
begin
  if not private.has_role('student') then
    raise exception 'Doar elevii pot intra într-o clasă cu cod.' using errcode = '42501';
  end if;
  select id into v_class from public.classes
  where invite_code = upper(trim(p_code)) and invite_code_active and status = 'active';
  if v_class is null then
    raise exception 'Cod invalid sau expirat.' using errcode = 'P0002';
  end if;
  insert into public.class_members (class_id, student_id)
  values (v_class, (select auth.uid()))
  on conflict do nothing;
  return v_class;
end;
$$;

-- Clasamentul unei clase: XP total în clasă; la egalitate, același loc (1, 2, 2, 4).
create function public.class_leaderboard(p_class uuid)
returns table (student_id uuid, display_name text, avatar text, xp bigint, rank bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.can_view_class(p_class) then
    raise exception 'Nu ai acces la această clasă.' using errcode = '42501';
  end if;
  return query
    select m.student_id, p.display_name, p.avatar, coalesce(sum(x.amount), 0)::bigint as xp,
           rank() over (order by coalesce(sum(x.amount), 0) desc)::bigint
    from public.class_members m
    join public.profiles p on p.id = m.student_id
    left join public.xp_transactions x on x.student_id = m.student_id and x.class_id = p_class
    where m.class_id = p_class
    group by m.student_id, p.display_name, p.avatar
    order by 4 desc, 2;
end;
$$;

-- Trimiterea (sau retrimiterea) unei teme. Prima trimitere validă aduce +2 XP.
create function public.submit_assignment(
  p_assignment uuid, p_text text default null, p_files jsonb default '[]', p_link text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  a public.assignments%rowtype;
  v_sub public.submissions%rowtype;
  v_mentor uuid;
  v_name text;
begin
  select * into a from public.assignments where id = p_assignment and status = 'published';
  if a.id is null or not private.is_class_member(a.class_id) then
    raise exception 'Tema nu există sau nu e în clasele tale.' using errcode = '42501';
  end if;
  if coalesce(trim(p_text), '') = '' and coalesce(jsonb_array_length(p_files), 0) = 0
     and coalesce(trim(p_link), '') = '' then
    raise exception 'Adaugă cod, un fișier sau un link.' using errcode = '22023';
  end if;

  select * into v_sub from public.submissions where assignment_id = a.id and student_id = v_me;
  if v_sub.id is not null and v_sub.status <> 'needs_changes' and not a.allow_resubmit then
    raise exception 'Mentorul nu permite retrimiterea acestei teme.' using errcode = '42501';
  end if;

  if v_sub.id is null then
    insert into public.submissions (assignment_id, student_id, status, submission_xp)
    values (a.id, v_me, 'submitted', 2)
    returning * into v_sub;
    insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
    values (v_me, a.class_id, 'submission', 2, 'Temă trimisă: ' || a.title, 'submission:' || v_sub.id)
    on conflict (event_key) do nothing;
  else
    update public.submissions set status = 'submitted' where id = v_sub.id;
  end if;

  insert into public.submission_attempts (submission_id, text, files, link)
  values (v_sub.id, nullif(trim(p_text), ''), coalesce(p_files, '[]'), nullif(trim(p_link), ''));

  select mentor_id into v_mentor from public.classes where id = a.class_id;
  select display_name into v_name from public.profiles where id = v_me;
  insert into public.notifications (user_id, kind, title, href)
  values (
    v_mentor,
    case when v_sub.feedback_at is null then 'submission_new' else 'resubmission' end::public.notification_kind,
    v_name || case when v_sub.feedback_at is null then ' a trimis: ' else ' a retrimis: ' end || a.title,
    '/mentor/teme/' || a.id || '/' || v_sub.id
  );
  return v_sub.id;
end;
$$;

-- Review-ul mentorului: feedback, stare și bonusul de calitate (0–max_bonus_xp).
create function public.review_submission(
  p_submission uuid, p_status public.submission_status, p_feedback text, p_bonus integer default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  s public.submissions%rowtype;
  a public.assignments%rowtype;
begin
  select * into s from public.submissions where id = p_submission;
  select * into a from public.assignments where id = s.assignment_id;
  if s.id is null or not private.is_class_mentor(a.class_id) then
    raise exception 'Nu poți evalua această trimitere.' using errcode = '42501';
  end if;
  if p_status = 'submitted' then
    raise exception 'Alege „revizuită” sau „necesită corecturi”.' using errcode = '22023';
  end if;
  if coalesce(trim(p_feedback), '') = '' then
    raise exception 'Scrie un feedback pentru elev.' using errcode = '22023';
  end if;
  if p_bonus is not null and (p_bonus < 0 or p_bonus > a.max_bonus_xp) then
    raise exception 'Bonusul trebuie să fie între 0 și %.', a.max_bonus_xp using errcode = '22023';
  end if;

  update public.submissions
  set status = p_status, feedback_text = trim(p_feedback), feedback_at = now(),
      bonus_xp = coalesce(p_bonus, bonus_xp)
  where id = s.id;

  -- Bonusul e o singură tranzacție, actualizată la corectare (nu se adună).
  if p_bonus is not null then
    if p_bonus = 0 then
      delete from public.xp_transactions where event_key = 'bonus:' || s.id;
    else
      insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key, created_by)
      values (s.student_id, a.class_id, 'quality_bonus', p_bonus, 'Bonus de calitate: ' || a.title,
              'bonus:' || s.id, (select auth.uid()))
      on conflict (event_key) do update set amount = excluded.amount, at = now(), created_by = excluded.created_by;
    end if;
  end if;

  insert into public.notifications (user_id, kind, title, href)
  values (
    s.student_id,
    case when p_status = 'needs_changes' then 'needs_changes' else 'feedback' end::public.notification_kind,
    case when p_status = 'needs_changes' then 'Corecturi cerute: ' else 'Feedback nou: ' end || a.title,
    '/teme/' || a.id
  );
end;
$$;

-- Prezența la o întâlnire: { "<student_id>": true/false, ... }. Prezent = +2 XP, o singură dată;
-- dacă mentorul corectează în „absent”, XP-ul pentru întâlnirea respectivă se retrage.
create function public.set_attendance(p_meeting uuid, p_records jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare
  m public.attendance_meetings%rowtype;
  r record;
begin
  select * into m from public.attendance_meetings where id = p_meeting;
  if m.id is null or not private.is_class_mentor(m.class_id) then
    raise exception 'Nu poți modifica prezența la această întâlnire.' using errcode = '42501';
  end if;

  for r in select key::uuid as student_id, value::boolean as present from jsonb_each_text(p_records) loop
    if not exists (select 1 from public.class_members where class_id = m.class_id and student_id = r.student_id) then
      continue;
    end if;
    insert into public.attendance_records (meeting_id, student_id, present)
    values (m.id, r.student_id, r.present)
    on conflict (meeting_id, student_id) do update set present = excluded.present;

    if r.present then
      insert into public.xp_transactions (student_id, class_id, source, amount, label, at, event_key, created_by)
      values (r.student_id, m.class_id, 'attendance', 2, 'Prezență: ' || coalesce(nullif(m.topic, ''), 'întâlnire'),
              m.date, 'attendance:' || m.id || ':' || r.student_id, (select auth.uid()))
      on conflict (event_key) do nothing;
    else
      delete from public.xp_transactions where event_key = 'attendance:' || m.id || ':' || r.student_id;
    end if;
  end loop;
end;
$$;

-- Corectare manuală de XP, doar de mentorul clasei, cu motiv.
create function public.adjust_xp(p_student uuid, p_class uuid, p_amount integer, p_label text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_class_mentor(p_class) then
    raise exception 'Doar mentorul clasei poate corecta XP-ul.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.class_members where class_id = p_class and student_id = p_student) then
    raise exception 'Elevul nu e în această clasă.' using errcode = '22023';
  end if;
  if p_amount = 0 or abs(p_amount) > 20 or coalesce(trim(p_label), '') = '' then
    raise exception 'Corecția trebuie să aibă o valoare (cel mult 20) și un motiv.' using errcode = '22023';
  end if;
  insert into public.xp_transactions (student_id, class_id, source, amount, label, created_by)
  values (p_student, p_class, 'adjustment', p_amount, trim(p_label), (select auth.uid()));
end;
$$;

-- Trimiterea unui quiz. Notarea se face aici, deci răspunsurile corecte ajung la elev
-- doar după trimitere. Quiz-urile date unei clase aduc XP o singură dată.
create function public.submit_quiz(p_quiz uuid, p_answers smallint[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  q public.quizzes%rowtype;
  v_correct integer;
  v_total integer;
  v_attempts integer;
begin
  select * into q from public.quizzes where id = p_quiz;
  if q.id is null or not private.can_view_quiz(q.id) or not private.has_role('student') then
    raise exception 'Quiz indisponibil.' using errcode = '42501';
  end if;
  if q.class_id is not null then
    if (q.opens_at is not null and now() < q.opens_at) or (q.deadline is not null and now() > q.deadline) then
      raise exception 'Quiz-ul nu e deschis acum.' using errcode = '42501';
    end if;
    select count(*) into v_attempts from public.quiz_attempts where quiz_id = q.id and student_id = v_me;
    if q.max_attempts is not null and v_attempts >= q.max_attempts then
      raise exception 'Ai folosit toate încercările.' using errcode = '42501';
    end if;
  end if;

  select count(*), count(*) filter (where k.correct = p_answers[qq.position])
  into v_total, v_correct
  from public.quiz_questions qq join public.quiz_answer_keys k on k.question_id = qq.id
  where qq.quiz_id = q.id;

  insert into public.quiz_attempts (quiz_id, student_id, answers, correct, total)
  values (q.id, v_me, coalesce(p_answers, '{}'), v_correct, v_total);

  if q.class_id is not null and coalesce(q.xp, 0) > 0 then
    insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
    values (v_me, q.class_id, 'practice_quiz', q.xp, 'Quiz: ' || q.title, 'quiz:' || q.id || ':' || v_me)
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

-- Doar utilizatorii autentificați pot apela acțiunile; vizitatorii nu.
revoke all on function public.join_class(text) from public, anon;
revoke all on function public.class_leaderboard(uuid) from public, anon;
revoke all on function public.submit_assignment(uuid, text, jsonb, text) from public, anon;
revoke all on function public.review_submission(uuid, public.submission_status, text, integer) from public, anon;
revoke all on function public.set_attendance(uuid, jsonb) from public, anon;
revoke all on function public.adjust_xp(uuid, uuid, integer, text) from public, anon;
revoke all on function public.submit_quiz(uuid, smallint[]) from public, anon;

grant execute on function public.join_class(text) to authenticated;
grant execute on function public.class_leaderboard(uuid) to authenticated;
grant execute on function public.submit_assignment(uuid, text, jsonb, text) to authenticated;
grant execute on function public.review_submission(uuid, public.submission_status, text, integer) to authenticated;
grant execute on function public.set_attendance(uuid, jsonb) to authenticated;
grant execute on function public.adjust_xp(uuid, uuid, integer, text) to authenticated;
grant execute on function public.submit_quiz(uuid, smallint[]) to authenticated;

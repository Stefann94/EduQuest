-- O clasă arhivată nu mai primește teme (și nici prin apel direct la funcție).
create or replace function public.submit_problem(p_assignment uuid, p_problem uuid, p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_me uuid := (select auth.uid());
  a public.homework_assignments%rowtype;
  h public.homeworks%rowtype;
  v_sub uuid;
  v_late boolean;
  v_missing integer;
  v_name text;
begin
  select * into a from public.homework_assignments where id = p_assignment;
  if a.id is null or not private.is_class_member(a.class_id) then
    raise exception 'Tema nu e în clasele tale.' using errcode = '42501';
  end if;
  if exists (select 1 from public.classes where id = a.class_id and status = 'archived') then
    raise exception 'Clasa e arhivată: tema nu mai poate fi trimisă.' using errcode = '42501';
  end if;
  select * into h from public.homeworks where id = a.homework_id;
  if not exists (select 1 from public.homework_problems where id = p_problem and homework_id = h.id) then
    raise exception 'Problema nu face parte din temă.' using errcode = '22023';
  end if;
  if coalesce(trim(p_code), '') = '' then
    raise exception 'Scrie sau lipește rezolvarea.' using errcode = '22023';
  end if;
  v_late := a.deadline is not null and now() > a.deadline;

  insert into public.problem_submissions (assignment_id, problem_id, student_id, status, updated_at)
  values (a.id, p_problem, v_me, 'submitted', now())
  on conflict (assignment_id, problem_id, student_id)
  do update set status = 'submitted', updated_at = now()
  returning id into v_sub;

  insert into public.problem_attempts (submission_id, code, late) values (v_sub, p_code, v_late);

  if not v_late then
    select count(*) into v_missing
    from public.homework_problems p
    where p.homework_id = h.id and p.required
      and not exists (
        select 1 from public.problem_submissions s
        where s.assignment_id = a.id and s.problem_id = p.id and s.student_id = v_me
      );
    if v_missing = 0 then
      insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key)
      values (v_me, a.class_id, 'submission', 2, 'Temă trimisă la timp: ' || h.title,
              'homework:' || a.id || ':' || v_me)
      on conflict (event_key) do nothing;
    end if;
  end if;

  select display_name into v_name from public.profiles where id = v_me;
  insert into public.notifications (user_id, kind, title, href)
  select c.mentor_id, 'submission_new', v_name || ' a trimis o rezolvare: ' || h.title,
         '/mentor/teme/' || h.id || '?clasa=' || a.class_id
  from public.classes c where c.id = a.class_id;
  return v_sub;
end;
$$;

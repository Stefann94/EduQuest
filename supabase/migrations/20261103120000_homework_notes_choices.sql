-- Teme: notiță opțională la fiecare trimitere; la temele opționale, elevul alege „o fac”
-- sau „nu o fac”, ca mentorul să știe pe cine așteaptă. (Mai multe fișiere de cod se
-- păstrează în același câmp `code`, cu un marcaj între fișiere — vezi src/lib/code-files.ts.)

alter table public.problem_attempts
  add column note text check (note is null or char_length(note) <= 2000);

create table public.homework_choices (
  assignment_id uuid not null references public.homework_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  choice text not null check (choice in ('accepted', 'declined')),
  at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);
alter table public.homework_choices enable row level security;
-- Citesc: elevul alegerea lui, mentorul clasei pe ale tuturor. Scrierea doar prin funcție.
create policy choices_select on public.homework_choices for select to authenticated
  using (student_id = (select auth.uid())
         or private.is_class_mentor(private.assignment_class(assignment_id)));
grant select on public.homework_choices to authenticated;
alter publication supabase_realtime add table public.homework_choices;

drop function if exists public.submit_problem(uuid, uuid, text);
CREATE OR REPLACE FUNCTION public.submit_problem(p_assignment uuid, p_problem uuid, p_code text, p_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  -- O temă opțională refuzată se poate face oricum: trimiterea o trece înapoi pe „o fac”.
  update public.homework_choices set choice = 'accepted', at = now()
  where assignment_id = a.id and student_id = v_me and choice = 'declined';
  v_late := a.deadline is not null and now() > a.deadline;

  insert into public.problem_submissions (assignment_id, problem_id, student_id, status, updated_at)
  values (a.id, p_problem, v_me, 'submitted', now())
  on conflict (assignment_id, problem_id, student_id)
  do update set status = 'submitted', updated_at = now()
  returning id into v_sub;

  insert into public.problem_attempts (submission_id, code, late, note)
  values (v_sub, p_code, v_late, nullif(left(trim(coalesce(p_note, '')), 2000), ''));

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
$function$;

revoke all on function public.submit_problem(uuid, uuid, text, text) from public, anon;
grant execute on function public.submit_problem(uuid, uuid, text, text) to authenticated;

-- Alegerea elevului la o temă opțională (doar la cele opționale, doar în clasele lui).
create or replace function public.set_homework_choice(p_assignment uuid, p_choice text)
returns void
language plpgsql security definer set search_path = '' as $$
declare a public.homework_assignments%rowtype;
begin
  select * into a from public.homework_assignments where id = p_assignment;
  if a.id is null or not private.is_class_member(a.class_id) or not private.has_role('student') then
    raise exception 'Tema nu e în clasele tale.' using errcode = '42501';
  end if;
  if exists (select 1 from public.homeworks where id = a.homework_id and required) then
    raise exception 'Tema e obligatorie.' using errcode = '22023';
  end if;
  if p_choice not in ('accepted', 'declined') then
    raise exception 'Alegere necunoscută.' using errcode = '22023';
  end if;
  insert into public.homework_choices (assignment_id, student_id, choice)
  values (a.id, (select auth.uid()), p_choice)
  on conflict (assignment_id, student_id) do update set choice = excluded.choice, at = now();
end;
$$;

revoke all on function public.set_homework_choice(uuid, text) from public, anon;
grant execute on function public.set_homework_choice(uuid, text) to authenticated;

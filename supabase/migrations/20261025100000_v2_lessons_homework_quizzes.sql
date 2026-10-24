-- Structura v2 (cerințele din 24.10.2026, vezi docs/PLAN-v2.md):
-- * Lecții reutilizabile: un mentor creează o lecție o dată și o adaugă în mai multe clase,
--   fiecare cu numărul ei; lecția are materiale (lecție scrisă, PDF, link, video, problemă),
--   fiecare publicat sau ascuns separat.
-- * Teme cu mai multe probleme (obligatorii și opționale), refolosibile, atribuite mai multor
--   clase cu termene proprii; trimiteri pe fiecare problemă, cu toate încercările păstrate.
-- * Quiz-uri legate de lecții (întrebările au lecția lor), date mai multor clase, fără programare.
-- * Prezență pe lecția planificată: prezent / absent / recuperat.
-- * XP: +2 prezență (și recuperare), +2 temă trimisă la timp (0 după termen), bonus 0–5 pe temă,
--   quiz: la prima încercare XP după scor, o singură dată +1 la refacere; live 5/4/3/2/1.
-- Datele de până acum erau doar demo, deci tabelele vechi se înlocuiesc.

-- ---------------------------------------------------------------------------
-- 1. Eliminăm structura veche (materiale, probleme, teme, quiz-uri, lecțiile de curs)
-- ---------------------------------------------------------------------------
drop function if exists public.submit_assignment(uuid, text, jsonb, text);
drop function if exists public.review_submission(uuid, public.submission_status, text, integer);
drop function if exists public.submit_quiz(uuid, smallint[]);
drop function if exists public.set_attendance(uuid, jsonb);

drop table if exists
  public.submission_attempts, public.submissions, public.assignments,
  public.materials, public.worked_problems, public.lessons,
  public.live_results, public.live_sessions, public.quiz_attempts,
  public.quiz_answer_keys, public.quiz_questions, public.quizzes
cascade;

-- Regulile vechi ale cursurilor depind de funcțiile de mai jos; le refacem la pasul 7.
drop policy if exists courses_select on public.courses;
drop policy if exists courses_insert on public.courses;
drop policy if exists courses_update on public.courses;
drop policy if exists courses_delete on public.courses;

drop function if exists private.assignment_class(uuid);
drop function if exists private.submission_owner_or_mentor(uuid);
drop function if exists private.can_view_quiz(uuid);
drop function if exists private.can_edit_quiz(uuid);
drop function if exists private.can_view_course(uuid);
drop function if exists private.can_edit_course(uuid);

alter type public.xp_source add value if not exists 'class_quiz';

create type public.lesson_display as enum ('number', 'title', 'both');
create type public.item_kind as enum ('article', 'pdf', 'link', 'video', 'problem');
create type public.problem_status as enum ('submitted', 'accepted', 'needs_changes');
create type public.attendance_status as enum ('present', 'absent', 'recovered');
create type public.quiz_kind as enum ('lesson', 'recap', 'practice');

-- ---------------------------------------------------------------------------
-- 2. Lecții și materiale
-- ---------------------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id),
  -- Lecțiile din cursurile globale (Învățare); null = lecție a unui mentor pentru clasele lui.
  course_id uuid references public.courses (id) on delete cascade,
  position integer not null default 0,
  slug text check (slug ~ '^[a-z0-9-]{3,60}$'),
  title text not null check (char_length(title) between 2 and 120),
  summary text not null default '',
  duration_min smallint check (duration_min between 1 and 240),
  created_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index on public.lessons (author_id);
create index on public.lessons (course_id, position);

create table public.lesson_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  kind public.item_kind not null,
  title text not null check (char_length(title) between 2 and 160),
  position integer not null default 0,
  published boolean not null default false,
  -- Conținutul depinde de tip (validat în aplicație, vezi src/lib/content/items.ts):
  -- article {blocks}, pdf {path,name,sizeKb}, link/video {url,note}, problem {statement,...}
  content jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.lesson_items (lesson_id, position);

-- O lecție în mai multe clase; fiecare clasă îi dă numărul ei și alege ce vede elevul.
create table public.lesson_classes (
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  number smallint not null check (number between 1 and 999),
  display public.lesson_display not null default 'both',
  published boolean not null default true,
  added_at timestamptz not null default now(),
  primary key (lesson_id, class_id)
);
create index on public.lesson_classes (class_id, number);

-- ---------------------------------------------------------------------------
-- 3. Teme cu mai multe probleme
-- ---------------------------------------------------------------------------
create table public.homeworks (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  -- Tema întreagă e obligatorie sau opțională (tab-urile elevului).
  required boolean not null default true,
  -- Arhivată = nu mai apare în panoul mentorului; rămâne în istoric.
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.homeworks (author_id);

create table public.homework_problems (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homeworks (id) on delete cascade,
  position integer not null default 0,
  title text not null check (char_length(title) between 2 and 120),
  statement text not null default '',
  language text not null default 'python',
  starter text,
  required boolean not null default true
);
create index on public.homework_problems (homework_id, position);

create table public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homeworks (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  deadline timestamptz,
  assigned_at timestamptz not null default now(),
  max_bonus_xp smallint not null default 5 check (max_bonus_xp between 0 and 5),
  unique (homework_id, class_id)
);
create index on public.homework_assignments (class_id);

create table public.problem_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.homework_assignments (id) on delete cascade,
  problem_id uuid not null references public.homework_problems (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.problem_status not null default 'submitted',
  feedback text,
  feedback_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (assignment_id, problem_id, student_id)
);
create index on public.problem_submissions (student_id);

create table public.problem_attempts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.problem_submissions (id) on delete cascade,
  at timestamptz not null default now(),
  code text not null check (char_length(code) between 1 and 50000),
  late boolean not null default false
);
create index on public.problem_attempts (submission_id, at desc);

-- Bonusul de calitate se dă pe toată tema, nu pe fiecare problemă.
create table public.homework_reviews (
  assignment_id uuid not null references public.homework_assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  bonus_xp smallint not null check (bonus_xp between 0 and 5),
  note text,
  reviewed_at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

-- ---------------------------------------------------------------------------
-- 4. Quiz-uri legate de lecții
-- ---------------------------------------------------------------------------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  kind public.quiz_kind not null default 'lesson',
  -- Quiz-urile din cursurile globale (Învățare) sunt vizibile tuturor elevilor.
  course_id uuid references public.courses (id) on delete cascade,
  time_limit_sec integer check (time_limit_sec > 0),
  -- XP maxim la prima încercare (după scor).
  xp smallint not null default 3 check (xp between 0 and 5),
  created_at timestamptz not null default now()
);
create index on public.quizzes (author_id);
create index on public.quizzes (course_id);

create table public.quiz_lessons (
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  primary key (quiz_id, lesson_id)
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  -- Lecția la care se referă întrebarea: de aici vine analiza „ce a înțeles fiecare elev”.
  lesson_id uuid references public.lessons (id) on delete set null,
  position smallint not null,
  prompt text not null,
  code text,
  options text[] not null check (cardinality(options) between 2 and 6),
  unique (quiz_id, position)
);

create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions (id) on delete cascade,
  correct smallint not null check (correct >= 0),
  explanation text
);

-- Un quiz dat mai multor clase. Fără programare: e disponibil din momentul atribuirii.
create table public.quiz_assignments (
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (quiz_id, class_id)
);
create index on public.quiz_assignments (class_id);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  at timestamptz not null default now(),
  answers smallint[] not null default '{}',
  -- Pe fiecare întrebare: [{question_id, lesson_id, correct}]
  results jsonb not null default '[]',
  correct smallint not null,
  total smallint not null
);
create index on public.quiz_attempts (student_id, quiz_id);

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null,
  -- Cod unic de 6 cifre, generat de baza de date (vezi create_live_session).
  code text not null unique check (code ~ '^[0-9]{6}$'),
  status public.live_status not null default 'lobby',
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index on public.live_sessions (class_id);

create table public.live_results (
  session_id uuid not null references public.live_sessions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  score integer not null default 0,
  rank smallint not null,
  xp smallint not null default 1,
  primary key (session_id, student_id)
);

-- ---------------------------------------------------------------------------
-- 5. Prezență pe lecția planificată, cu „recuperat”
-- ---------------------------------------------------------------------------
alter table public.attendance_meetings
  add column lesson_id uuid references public.lessons (id) on delete set null;
alter table public.attendance_records add column status public.attendance_status;
update public.attendance_records set status = case when present then 'present' else 'absent' end::public.attendance_status;
alter table public.attendance_records alter column status set not null;
alter table public.attendance_records drop column present;

-- ---------------------------------------------------------------------------
-- 6. Funcții pentru reguli
-- ---------------------------------------------------------------------------
create function private.can_edit_lesson(lid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('mentor') and exists (
    select 1 from public.lessons where id = lid and author_id = (select auth.uid())
  );
$$;

create function private.can_view_lesson(lid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and (
    private.can_edit_lesson(lid)
    or exists (
      select 1 from public.lessons l join public.courses c on c.id = l.course_id
      where l.id = lid and c.status = 'published' and c.class_id is null
    )
    or exists (
      select 1 from public.lesson_classes lc
      where lc.lesson_id = lid
        and (private.is_class_mentor(lc.class_id) or (lc.published and private.is_class_member(lc.class_id)))
    )
  );
$$;

create function private.homework_visible(hid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.homeworks h
    where h.id = hid
      and (
        h.author_id = (select auth.uid())
        or exists (
          select 1 from public.homework_assignments a
          where a.homework_id = h.id and private.can_view_class(a.class_id)
        )
      )
  );
$$;

create function private.assignment_class(aid uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select class_id from public.homework_assignments where id = aid;
$$;

create function private.can_view_quiz(qid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.quizzes q
    where q.id = qid
      and (
        q.author_id = (select auth.uid())
        or (q.course_id is not null and exists (
          select 1 from public.courses c where c.id = q.course_id and c.status = 'published' and c.class_id is null
        ))
        or exists (
          select 1 from public.quiz_assignments qa where qa.quiz_id = q.id and private.can_view_class(qa.class_id)
        )
      )
  );
$$;

create function private.can_edit_quiz(qid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('mentor') and exists (
    select 1 from public.quizzes where id = qid and author_id = (select auth.uid())
  );
$$;

create function private.can_view_course(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.courses c
    where c.id = cid
      and ((c.status = 'published' and (c.class_id is null or private.is_class_member(c.class_id)))
           or c.author_id = (select auth.uid()))
  );
$$;

-- Cod unic de 6 cifre pentru o sesiune live.
create function private.new_live_code() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare v text;
begin
  loop
    v := lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from public.live_sessions where code = v);
  end loop;
  return v;
end;
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- ---------------------------------------------------------------------------
-- 7. RLS
-- ---------------------------------------------------------------------------
alter table public.lessons enable row level security;
alter table public.lesson_items enable row level security;
alter table public.lesson_classes enable row level security;
alter table public.homeworks enable row level security;
alter table public.homework_problems enable row level security;
alter table public.homework_assignments enable row level security;
alter table public.problem_submissions enable row level security;
alter table public.problem_attempts enable row level security;
alter table public.homework_reviews enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_lessons enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_assignments enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_results enable row level security;

-- Cursurile: le vede oricine poate vedea cursul; le editează doar autorul.
create policy courses_select on public.courses for select to authenticated
  using (private.can_view_course(id));
create policy courses_insert on public.courses for insert to authenticated
  with check (private.has_role('mentor') and author_id = (select auth.uid()));
create policy courses_update on public.courses for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy courses_delete on public.courses for delete to authenticated
  using (author_id = (select auth.uid()));

-- Lecții
grant select, insert, update, delete on public.lessons to authenticated;
create policy lessons_select on public.lessons for select to authenticated
  using (private.can_view_lesson(id));
create policy lessons_insert on public.lessons for insert to authenticated
  with check (private.has_role('mentor') and author_id = (select auth.uid()) and course_id is null);
create policy lessons_update on public.lessons for update to authenticated
  using (private.can_edit_lesson(id)) with check (author_id = (select auth.uid()));
create policy lessons_delete on public.lessons for delete to authenticated
  using (private.can_edit_lesson(id));

-- Materialele: autorul le vede pe toate; ceilalți doar pe cele publicate.
grant select, insert, update, delete on public.lesson_items to authenticated;
create policy items_select on public.lesson_items for select to authenticated
  using (private.can_edit_lesson(lesson_id) or (published and private.can_view_lesson(lesson_id)));
create policy items_write on public.lesson_items for all to authenticated
  using (private.can_edit_lesson(lesson_id)) with check (private.can_edit_lesson(lesson_id));

grant select, insert, update, delete on public.lesson_classes to authenticated;
create policy lesson_classes_select on public.lesson_classes for select to authenticated
  using (private.can_view_class(class_id) or private.can_edit_lesson(lesson_id));
create policy lesson_classes_write on public.lesson_classes for all to authenticated
  using (private.can_edit_lesson(lesson_id) and private.is_class_mentor(class_id))
  with check (private.can_edit_lesson(lesson_id) and private.is_class_mentor(class_id));

-- Teme
grant select, insert, update, delete on public.homeworks to authenticated;
create policy homeworks_select on public.homeworks for select to authenticated
  using (private.homework_visible(id));
create policy homeworks_insert on public.homeworks for insert to authenticated
  with check (private.has_role('mentor') and author_id = (select auth.uid()));
create policy homeworks_update on public.homeworks for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy homeworks_delete on public.homeworks for delete to authenticated
  using (author_id = (select auth.uid()));

grant select, insert, update, delete on public.homework_problems to authenticated;
create policy hw_problems_select on public.homework_problems for select to authenticated
  using (private.homework_visible(homework_id));
create policy hw_problems_write on public.homework_problems for all to authenticated
  using (exists (select 1 from public.homeworks h where h.id = homework_id and h.author_id = (select auth.uid())))
  with check (exists (select 1 from public.homeworks h where h.id = homework_id and h.author_id = (select auth.uid())));

grant select, insert, update, delete on public.homework_assignments to authenticated;
create policy hw_assign_select on public.homework_assignments for select to authenticated
  using (private.can_view_class(class_id)
    or exists (select 1 from public.homeworks h where h.id = homework_id and h.author_id = (select auth.uid())));
create policy hw_assign_write on public.homework_assignments for all to authenticated
  using (private.is_class_mentor(class_id)
    and exists (select 1 from public.homeworks h where h.id = homework_id and h.author_id = (select auth.uid())))
  with check (private.is_class_mentor(class_id)
    and exists (select 1 from public.homeworks h where h.id = homework_id and h.author_id = (select auth.uid())));

grant select on public.problem_submissions to authenticated;
create policy problem_subs_select on public.problem_submissions for select to authenticated
  using (student_id = (select auth.uid()) or private.is_class_mentor(private.assignment_class(assignment_id)));

grant select on public.problem_attempts to authenticated;
create policy problem_attempts_select on public.problem_attempts for select to authenticated
  using (exists (
    select 1 from public.problem_submissions s
    where s.id = submission_id
      and (s.student_id = (select auth.uid()) or private.is_class_mentor(private.assignment_class(s.assignment_id)))
  ));

grant select on public.homework_reviews to authenticated;
create policy hw_reviews_select on public.homework_reviews for select to authenticated
  using (student_id = (select auth.uid()) or private.is_class_mentor(private.assignment_class(assignment_id)));

-- Quiz-uri
grant select, insert, update, delete on public.quizzes to authenticated;
create policy quizzes_select on public.quizzes for select to authenticated
  using (private.can_view_quiz(id));
create policy quizzes_insert on public.quizzes for insert to authenticated
  with check (private.has_role('mentor') and author_id = (select auth.uid()) and course_id is null);
create policy quizzes_update on public.quizzes for update to authenticated
  using (private.can_edit_quiz(id)) with check (author_id = (select auth.uid()));
create policy quizzes_delete on public.quizzes for delete to authenticated
  using (private.can_edit_quiz(id));

grant select, insert, delete on public.quiz_lessons to authenticated;
create policy quiz_lessons_select on public.quiz_lessons for select to authenticated
  using (private.can_view_quiz(quiz_id));
create policy quiz_lessons_write on public.quiz_lessons for all to authenticated
  using (private.can_edit_quiz(quiz_id)) with check (private.can_edit_quiz(quiz_id));

grant select, insert, update, delete on public.quiz_questions to authenticated;
create policy questions_select on public.quiz_questions for select to authenticated
  using (private.can_view_quiz(quiz_id));
create policy questions_write on public.quiz_questions for all to authenticated
  using (private.can_edit_quiz(quiz_id)) with check (private.can_edit_quiz(quiz_id));

-- Răspunsurile corecte: doar autorul (elevii le primesc abia după trimitere, din submit_quiz).
grant select, insert, update, delete on public.quiz_answer_keys to authenticated;
create policy keys_all on public.quiz_answer_keys for all to authenticated
  using (private.can_edit_quiz((select quiz_id from public.quiz_questions q where q.id = question_id)))
  with check (private.can_edit_quiz((select quiz_id from public.quiz_questions q where q.id = question_id)));

grant select, insert, delete on public.quiz_assignments to authenticated;
create policy quiz_assign_select on public.quiz_assignments for select to authenticated
  using (private.can_view_class(class_id) or private.can_edit_quiz(quiz_id));
create policy quiz_assign_write on public.quiz_assignments for all to authenticated
  using (private.can_edit_quiz(quiz_id) and private.is_class_mentor(class_id))
  with check (private.can_edit_quiz(quiz_id) and private.is_class_mentor(class_id));

grant select on public.quiz_attempts to authenticated;
create policy quiz_attempts_select on public.quiz_attempts for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.can_edit_quiz(quiz_id)
    or exists (
      select 1 from public.quiz_assignments qa
      join public.class_members m on m.class_id = qa.class_id and m.student_id = quiz_attempts.student_id
      where qa.quiz_id = quiz_attempts.quiz_id and private.is_class_mentor(qa.class_id)
    )
  );

grant select, update on public.live_sessions to authenticated;
create policy live_select on public.live_sessions for select to authenticated
  using (private.can_view_class(class_id));
create policy live_update on public.live_sessions for update to authenticated
  using (private.is_class_mentor(class_id)) with check (private.is_class_mentor(class_id));

grant select on public.live_results to authenticated;
create policy live_results_select on public.live_results for select to authenticated
  using (private.can_view_class((select class_id from public.live_sessions s where s.id = session_id)));

-- ---------------------------------------------------------------------------
-- 8. Acțiuni (regulile de XP stau aici, nu în interfață)
-- ---------------------------------------------------------------------------

-- Trimiterea unei probleme dintr-o temă. Fiecare trimitere se păstrează (istoric).
-- +2 XP o singură dată, când toate problemele obligatorii au fost trimise ÎNAINTE de termen.
create function public.submit_problem(p_assignment uuid, p_problem uuid, p_code text) returns uuid
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

-- Mentorul evaluează o problemă: acceptată sau de refăcut, cu feedback.
create function public.review_problem(p_submission uuid, p_status public.problem_status, p_feedback text)
returns void
language plpgsql security definer set search_path = '' as $$
declare s public.problem_submissions%rowtype; v_class uuid; v_title text;
begin
  select * into s from public.problem_submissions where id = p_submission;
  v_class := private.assignment_class(s.assignment_id);
  if s.id is null or not private.is_class_mentor(v_class) then
    raise exception 'Nu poți evalua această trimitere.' using errcode = '42501';
  end if;
  if p_status = 'submitted' then
    raise exception 'Alege „acceptată” sau „de refăcut”.' using errcode = '22023';
  end if;
  update public.problem_submissions
  set status = p_status, feedback = nullif(trim(p_feedback), ''), feedback_at = now(), updated_at = now()
  where id = s.id;
  select h.title into v_title from public.homework_assignments a join public.homeworks h on h.id = a.homework_id
  where a.id = s.assignment_id;
  insert into public.notifications (user_id, kind, title, href)
  values (s.student_id,
          case when p_status = 'needs_changes' then 'needs_changes' else 'feedback' end::public.notification_kind,
          case when p_status = 'needs_changes' then 'De refăcut: ' else 'Feedback nou: ' end || v_title,
          '/teme/' || s.assignment_id);
end;
$$;

-- Bonusul de calitate, pe toată tema (0 – max). Se corectează, nu se adună.
create function public.set_homework_bonus(p_assignment uuid, p_student uuid, p_bonus integer, p_note text)
returns void
language plpgsql security definer set search_path = '' as $$
declare a public.homework_assignments%rowtype; v_title text;
begin
  select * into a from public.homework_assignments where id = p_assignment;
  if a.id is null or not private.is_class_mentor(a.class_id) then
    raise exception 'Nu poți evalua această temă.' using errcode = '42501';
  end if;
  if not exists (select 1 from public.class_members where class_id = a.class_id and student_id = p_student) then
    raise exception 'Elevul nu e în această clasă.' using errcode = '22023';
  end if;
  if p_bonus < 0 or p_bonus > a.max_bonus_xp then
    raise exception 'Bonusul trebuie să fie între 0 și %.', a.max_bonus_xp using errcode = '22023';
  end if;
  select title into v_title from public.homeworks where id = a.homework_id;
  insert into public.homework_reviews (assignment_id, student_id, bonus_xp, note, reviewed_at)
  values (a.id, p_student, p_bonus, nullif(trim(p_note), ''), now())
  on conflict (assignment_id, student_id)
  do update set bonus_xp = excluded.bonus_xp, note = excluded.note, reviewed_at = now();
  if p_bonus = 0 then
    delete from public.xp_transactions where event_key = 'hwbonus:' || a.id || ':' || p_student;
  else
    insert into public.xp_transactions (student_id, class_id, source, amount, label, event_key, created_by)
    values (p_student, a.class_id, 'quality_bonus', p_bonus, 'Bonus de calitate: ' || v_title,
            'hwbonus:' || a.id || ':' || p_student, (select auth.uid()))
    on conflict (event_key) do update set amount = excluded.amount, at = now(), created_by = excluded.created_by;
  end if;
end;
$$;

-- Prezența la o întâlnire: { "<student_id>": "present" | "absent" | "recovered" }.
-- Prezent și recuperat aduc +2 XP (o singură dată); absent retrage XP-ul întâlnirii.
create function public.set_attendance(p_meeting uuid, p_records jsonb) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.attendance_meetings%rowtype; r record; v_status public.attendance_status;
begin
  select * into m from public.attendance_meetings where id = p_meeting;
  if m.id is null or not private.is_class_mentor(m.class_id) then
    raise exception 'Nu poți modifica prezența la această întâlnire.' using errcode = '42501';
  end if;
  for r in select key::uuid as student_id, value as status from jsonb_each_text(p_records) loop
    if not exists (select 1 from public.class_members where class_id = m.class_id and student_id = r.student_id) then
      continue;
    end if;
    v_status := r.status::public.attendance_status;
    insert into public.attendance_records (meeting_id, student_id, status)
    values (m.id, r.student_id, v_status)
    on conflict (meeting_id, student_id) do update set status = excluded.status;
    if v_status in ('present', 'recovered') then
      insert into public.xp_transactions (student_id, class_id, source, amount, label, at, event_key, created_by)
      values (r.student_id, m.class_id, 'attendance', 2,
              case when v_status = 'recovered' then 'Prezență recuperată: ' else 'Prezență: ' end
                || coalesce(nullif(m.topic, ''), 'întâlnire'),
              m.date, 'attendance:' || m.id || ':' || r.student_id, (select auth.uid()))
      on conflict (event_key) do update set label = excluded.label;
    else
      delete from public.xp_transactions where event_key = 'attendance:' || m.id || ':' || r.student_id;
    end if;
  end loop;
end;
$$;

-- Trimiterea unui quiz. Notarea se face aici: răspunsurile corecte ajung la elev doar acum.
-- XP: la prima încercare, round(xp × scor); la a doua încercare, o singură dată, +1.
create function public.submit_quiz(p_quiz uuid, p_answers smallint[]) returns jsonb
language plpgsql security definer set search_path = '' as $$
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
$$;

-- Ce a înțeles fiecare elev, pe lecții: din ultima încercare la fiecare quiz dat clasei.
create function public.class_quiz_mastery(p_class uuid)
returns table (student_id uuid, display_name text, lesson_id uuid, lesson_title text, correct bigint, total bigint)
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
      select l.student_id, (r ->> 'lesson_id')::uuid as lesson_id, (r ->> 'correct')::boolean as ok
      from latest l, jsonb_array_elements(l.results) r
      where r ->> 'lesson_id' is not null
    )
    select a.student_id, p.display_name, a.lesson_id, ls.title,
           count(*) filter (where a.ok), count(*)
    from answers a
    join public.profiles p on p.id = a.student_id
    join public.lessons ls on ls.id = a.lesson_id
    group by a.student_id, p.display_name, a.lesson_id, ls.title
    order by p.display_name, ls.title;
end;
$$;

-- Sesiune live nouă, cu cod unic generat de baza de date.
create function public.create_live_session(p_quiz uuid, p_class uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_title text;
begin
  if not private.is_class_mentor(p_class) or not private.can_view_quiz(p_quiz) then
    raise exception 'Nu poți porni un quiz live pentru această clasă.' using errcode = '42501';
  end if;
  select title into v_title from public.quizzes where id = p_quiz;
  insert into public.live_sessions (quiz_id, class_id, title, code, created_by)
  values (p_quiz, p_class, v_title, private.new_live_code(), (select auth.uid()))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.submit_problem(uuid, uuid, text) from public, anon;
revoke all on function public.review_problem(uuid, public.problem_status, text) from public, anon;
revoke all on function public.set_homework_bonus(uuid, uuid, integer, text) from public, anon;
revoke all on function public.set_attendance(uuid, jsonb) from public, anon;
revoke all on function public.submit_quiz(uuid, smallint[]) from public, anon;
revoke all on function public.class_quiz_mastery(uuid) from public, anon;
revoke all on function public.create_live_session(uuid, uuid) from public, anon;
grant execute on function public.submit_problem(uuid, uuid, text) to authenticated;
grant execute on function public.review_problem(uuid, public.problem_status, text) to authenticated;
grant execute on function public.set_homework_bonus(uuid, uuid, integer, text) to authenticated;
grant execute on function public.set_attendance(uuid, jsonb) to authenticated;
grant execute on function public.submit_quiz(uuid, smallint[]) to authenticated;
grant execute on function public.class_quiz_mastery(uuid) to authenticated;
grant execute on function public.create_live_session(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Fișierele PDF ale materialelor (Supabase Storage, privat)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

-- Calea fișierului: <lesson_id>/<nume>.pdf
create policy materials_read on storage.objects for select to authenticated
  using (bucket_id = 'materials' and private.can_view_lesson(((storage.foldername(name))[1])::uuid));
create policy materials_write on storage.objects for insert to authenticated
  with check (bucket_id = 'materials' and private.can_edit_lesson(((storage.foldername(name))[1])::uuid));
create policy materials_delete on storage.objects for delete to authenticated
  using (bucket_id = 'materials' and private.can_edit_lesson(((storage.foldername(name))[1])::uuid));

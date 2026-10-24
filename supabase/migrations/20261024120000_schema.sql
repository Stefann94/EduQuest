-- EduQuest: schema inițială (vezi docs/PROJECT.md).
--
-- Principii:
-- * Fiecare tabel are RLS. Nimic nu e accesibil vizitatorilor (anon).
-- * Drepturile se dau explicit; cele implicite din schema public sunt retrase.
-- * Scrierile sensibile (trimiteri, review, prezență, XP, quiz) trec prin funcții
--   care verifică regulile în baza de date, nu doar în interfață.
-- * Răspunsurile corecte la quiz stau într-un tabel separat, pe care elevii nu-l pot citi.

-- ---------------------------------------------------------------------------
-- Drepturi implicite: nimic automat pentru anon/authenticated.
-- ---------------------------------------------------------------------------
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

-- Funcțiile ajutătoare stau într-o schemă care nu e expusă prin API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Tipuri
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('student', 'mentor', 'admin');
create type public.account_status as enum ('active', 'suspended', 'deactivated');
create type public.class_status as enum ('active', 'archived');
create type public.material_kind as enum ('article', 'pdf', 'link', 'video');
create type public.publication_status as enum ('published', 'draft');
create type public.assignment_type as enum ('required', 'optional');
create type public.submission_status as enum ('submitted', 'reviewed', 'needs_changes');
create type public.xp_source as enum ('attendance', 'submission', 'quality_bonus', 'live_quiz', 'practice_quiz', 'adjustment');
create type public.live_status as enum ('scheduled', 'lobby', 'running', 'ended');
create type public.notification_kind as enum (
  'assignment_new', 'deadline', 'feedback', 'needs_changes', 'material_new',
  'live_quiz', 'submission_new', 'resubmission', 'application'
);
create type public.application_status as enum ('pending', 'approved', 'rejected', 'needs_info');

-- ---------------------------------------------------------------------------
-- Profiluri (unul pentru fiecare cont din auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  -- Doar elevii au username: litere mici, cifre, punct, underscore.
  username text unique check (username ~ '^[a-z0-9._]{3,24}$'),
  role public.app_role not null default 'student',
  avatar text check (avatar in ('fox', 'panda', 'owl', 'cat', 'robot', 'rocket', 'octopus', 'penguin')),
  status public.account_status not null default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Clase
-- ---------------------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 80),
  description text not null default '',
  mentor_id uuid not null references public.profiles (id),
  status public.class_status not null default 'active',
  schedule text not null default '',
  invite_code text not null unique check (invite_code ~ '^[A-Z0-9]{6}$'),
  invite_code_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.classes (mentor_id);

create table public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index on public.class_members (student_id);

-- ---------------------------------------------------------------------------
-- Materiale și probleme rezolvate (class_id null = resursă globală)
-- ---------------------------------------------------------------------------
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  topic text not null default '',
  kind public.material_kind not null,
  tags text[] not null default '{}',
  status public.publication_status not null default 'draft',
  author_id uuid not null references public.profiles (id),
  published_at timestamptz not null default now(),
  blocks jsonb,
  url text,
  file jsonb
);
create index on public.materials (class_id);

create table public.worked_problems (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  topic text not null default '',
  difficulty smallint not null check (difficulty between 1 and 3),
  statement text not null,
  constraints text[] not null default '{}',
  examples jsonb not null default '[]',
  solution jsonb not null,
  explanation text[] not null default '{}',
  status public.publication_status not null default 'draft',
  author_id uuid not null references public.profiles (id),
  published_at timestamptz not null default now()
);
create index on public.worked_problems (class_id);

-- ---------------------------------------------------------------------------
-- Teme și trimiteri
-- ---------------------------------------------------------------------------
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  summary text not null default '',
  instructions text[] not null default '{}',
  type public.assignment_type not null,
  deadline timestamptz,
  max_bonus_xp smallint not null default 5 check (max_bonus_xp between 0 and 5),
  attachments jsonb not null default '[]',
  allow_resubmit boolean not null default true,
  status public.publication_status not null default 'draft',
  published_at timestamptz not null default now()
);
create index on public.assignments (class_id);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.submission_status not null default 'submitted',
  feedback_text text,
  feedback_at timestamptz,
  submission_xp smallint not null default 0,
  bonus_xp smallint check (bonus_xp between 0 and 5),
  unique (assignment_id, student_id)
);
create index on public.submissions (student_id);

create table public.submission_attempts (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions (id) on delete cascade,
  at timestamptz not null default now(),
  text text,
  files jsonb not null default '[]',
  link text
);
create index on public.submission_attempts (submission_id);

-- ---------------------------------------------------------------------------
-- Prezență
-- ---------------------------------------------------------------------------
create table public.attendance_meetings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  date timestamptz not null,
  topic text not null default ''
);
create index on public.attendance_meetings (class_id);

create table public.attendance_records (
  meeting_id uuid not null references public.attendance_meetings (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  present boolean not null,
  primary key (meeting_id, student_id)
);
create index on public.attendance_records (student_id);

-- ---------------------------------------------------------------------------
-- XP: istoric de tranzacții. event_key unic = fără XP dublu pentru același eveniment.
-- ---------------------------------------------------------------------------
create table public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid references public.classes (id) on delete cascade,
  source public.xp_source not null,
  amount integer not null,
  label text not null,
  at timestamptz not null default now(),
  event_key text unique,
  created_by uuid references public.profiles (id)
);
create index on public.xp_transactions (student_id, class_id);
create index on public.xp_transactions (class_id);

-- ---------------------------------------------------------------------------
-- Quiz-uri
-- ---------------------------------------------------------------------------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  description text not null default '',
  topic text not null default '',
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  -- null = quiz de exersare global
  class_id uuid references public.classes (id) on delete cascade,
  time_limit_sec integer check (time_limit_sec > 0),
  -- Doar pentru quiz-urile date unei clase:
  opens_at timestamptz,
  deadline timestamptz,
  max_attempts smallint check (max_attempts > 0),
  xp smallint check (xp between 0 and 10),
  author_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index on public.quizzes (class_id);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  position smallint not null,
  prompt text not null,
  code text,
  options text[] not null check (cardinality(options) between 2 and 6),
  unique (quiz_id, position)
);

-- Răspunsul corect și explicația: doar autorul / mentorul le poate citi.
create table public.quiz_answer_keys (
  question_id uuid primary key references public.quiz_questions (id) on delete cascade,
  correct smallint not null check (correct >= 0),
  explanation text
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  at timestamptz not null default now(),
  answers smallint[] not null default '{}',
  correct smallint not null,
  total smallint not null
);
create index on public.quiz_attempts (student_id, quiz_id);

create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  title text not null,
  code text not null unique check (code ~ '^[0-9]{6}$'),
  status public.live_status not null default 'scheduled',
  starts_at timestamptz not null,
  created_by uuid not null references public.profiles (id)
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
-- Notificări și aplicații de mentor
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null default '',
  href text not null default '/',
  at timestamptz not null default now(),
  read boolean not null default false
);
create index on public.notifications (user_id, at desc);

create table public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  background text not null,
  intended_use text not null,
  evidence text not null default '',
  status public.application_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  review_note text
);

-- ---------------------------------------------------------------------------
-- Funcții ajutătoare pentru reguli (security definer: citesc fără RLS, deci nu se
-- apelează recursiv; search_path gol ca să nu poată fi păcălite).
-- ---------------------------------------------------------------------------
create function private.me_active() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and status = 'active'
  );
$$;

create function private.has_role(r public.app_role) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = r and status = 'active'
  );
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('admin');
$$;

create function private.is_class_mentor(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.classes where id = cid and mentor_id = (select auth.uid())
  );
$$;

create function private.is_class_member(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.class_members where class_id = cid and student_id = (select auth.uid())
  );
$$;

create function private.can_view_class(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_class_mentor(cid) or private.is_class_member(cid);
$$;

-- Doi utilizatori se „văd” doar dacă sunt în aceeași clasă (fără director public).
create function private.shares_class(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1
    from public.classes c
    left join public.class_members me on me.class_id = c.id and me.student_id = (select auth.uid())
    left join public.class_members them on them.class_id = c.id and them.student_id = other
    where (c.mentor_id = (select auth.uid()) or me.student_id is not null)
      and (c.mentor_id = other or them.student_id is not null)
  );
$$;

create function private.assignment_class(aid uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select class_id from public.assignments where id = aid;
$$;

create function private.submission_owner_or_mentor(sid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = sid
      and (s.student_id = (select auth.uid()) or private.is_class_mentor(a.class_id))
  );
$$;

create function private.can_view_quiz(qid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.quizzes q
    where q.id = qid
      and (q.class_id is null or q.author_id = (select auth.uid()) or private.can_view_class(q.class_id))
  );
$$;

create function private.can_edit_quiz(qid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.quizzes q
    where q.id = qid
      and private.has_role('mentor')
      and (q.author_id = (select auth.uid()) or (q.class_id is not null and private.is_class_mentor(q.class_id)))
  );
$$;

create function private.new_invite_code() returns text
language sql volatile set search_path = '' as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 6);
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

alter table public.classes alter column invite_code set default private.new_invite_code();

-- ---------------------------------------------------------------------------
-- Profil creat automat la înregistrare. Rolul e mereu „student”: un cont nou nu
-- își poate da singur alt rol (mentorii sunt promovați de administrator, pe server).
-- ---------------------------------------------------------------------------
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    nullif(lower(trim(new.raw_user_meta_data ->> 'username')), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS pe toate tabelele
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.materials enable row level security;
alter table public.worked_problems enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_attempts enable row level security;
alter table public.attendance_meetings enable row level security;
alter table public.attendance_records enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answer_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.live_sessions enable row level security;
alter table public.live_results enable row level security;
alter table public.notifications enable row level security;
alter table public.mentor_applications enable row level security;

-- Profiluri: al tău, al colegilor de clasă, sau toate pentru administrator.
-- Poți schimba doar numele afișat și avatarul (drept pe coloane).
grant select on public.profiles to authenticated;
grant update (display_name, avatar) on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.shares_class(id) or private.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Clase: le văd mentorul și elevii înscriși. Le creează doar mentorii.
grant select, insert, update, delete on public.classes to authenticated;
create policy classes_select on public.classes for select to authenticated
  using (private.can_view_class(id) or private.is_admin());
create policy classes_insert on public.classes for insert to authenticated
  with check (private.has_role('mentor') and mentor_id = (select auth.uid()));
create policy classes_update on public.classes for update to authenticated
  using (private.is_class_mentor(id)) with check (mentor_id = (select auth.uid()));
create policy classes_delete on public.classes for delete to authenticated
  using (private.is_class_mentor(id));

-- Membri: îi văd colegii și mentorul. Intrarea se face doar cu codul (join_class).
grant select, delete on public.class_members to authenticated;
create policy members_select on public.class_members for select to authenticated
  using (student_id = (select auth.uid()) or private.can_view_class(class_id));
create policy members_delete on public.class_members for delete to authenticated
  using (private.is_class_mentor(class_id));

-- Materiale și probleme: publicate pentru clasă (sau globale), plus ciornele autorului.
grant select, insert, update, delete on public.materials to authenticated;
create policy materials_select on public.materials for select to authenticated
  using (
    private.me_active() and (
      (status = 'published' and (class_id is null or private.is_class_member(class_id)))
      or author_id = (select auth.uid())
      or (class_id is not null and private.is_class_mentor(class_id))
    )
  );
create policy materials_insert on public.materials for insert to authenticated
  with check (
    private.has_role('mentor') and author_id = (select auth.uid())
    and (class_id is null or private.is_class_mentor(class_id))
  );
create policy materials_update on public.materials for update to authenticated
  using (author_id = (select auth.uid()) or (class_id is not null and private.is_class_mentor(class_id)))
  with check (private.has_role('mentor') and (class_id is null or private.is_class_mentor(class_id)));
create policy materials_delete on public.materials for delete to authenticated
  using (author_id = (select auth.uid()) or (class_id is not null and private.is_class_mentor(class_id)));

grant select, insert, update, delete on public.worked_problems to authenticated;
create policy problems_select on public.worked_problems for select to authenticated
  using (
    private.me_active() and (
      (status = 'published' and (class_id is null or private.is_class_member(class_id)))
      or author_id = (select auth.uid())
      or (class_id is not null and private.is_class_mentor(class_id))
    )
  );
create policy problems_insert on public.worked_problems for insert to authenticated
  with check (
    private.has_role('mentor') and author_id = (select auth.uid())
    and (class_id is null or private.is_class_mentor(class_id))
  );
create policy problems_update on public.worked_problems for update to authenticated
  using (author_id = (select auth.uid()) or (class_id is not null and private.is_class_mentor(class_id)))
  with check (private.has_role('mentor') and (class_id is null or private.is_class_mentor(class_id)));
create policy problems_delete on public.worked_problems for delete to authenticated
  using (author_id = (select auth.uid()) or (class_id is not null and private.is_class_mentor(class_id)));

-- Teme: elevii văd temele publicate din clasele lor; mentorul le gestionează.
grant select, insert, update, delete on public.assignments to authenticated;
create policy assignments_select on public.assignments for select to authenticated
  using ((status = 'published' and private.is_class_member(class_id)) or private.is_class_mentor(class_id));
create policy assignments_write on public.assignments for all to authenticated
  using (private.is_class_mentor(class_id)) with check (private.is_class_mentor(class_id));

-- Trimiteri: le vede elevul care le-a făcut și mentorul clasei. Scrierea doar prin funcții.
grant select on public.submissions to authenticated;
create policy submissions_select on public.submissions for select to authenticated
  using (student_id = (select auth.uid()) or private.is_class_mentor(private.assignment_class(assignment_id)));

grant select on public.submission_attempts to authenticated;
create policy attempts_select on public.submission_attempts for select to authenticated
  using (private.submission_owner_or_mentor(submission_id));

-- Prezență
grant select, insert, update, delete on public.attendance_meetings to authenticated;
create policy meetings_select on public.attendance_meetings for select to authenticated
  using (private.can_view_class(class_id));
create policy meetings_write on public.attendance_meetings for all to authenticated
  using (private.is_class_mentor(class_id)) with check (private.is_class_mentor(class_id));

grant select on public.attendance_records to authenticated;
create policy records_select on public.attendance_records for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.is_class_mentor((select class_id from public.attendance_meetings m where m.id = meeting_id))
  );

-- XP: doar al tău sau, pentru mentor, cel din clasele lui. Scrierea doar prin funcții.
grant select on public.xp_transactions to authenticated;
create policy xp_select on public.xp_transactions for select to authenticated
  using (student_id = (select auth.uid()) or (class_id is not null and private.is_class_mentor(class_id)));

-- Quiz-uri: întrebările fără răspunsuri pentru cine are acces; cheile doar pentru autor/mentor.
grant select, insert, update, delete on public.quizzes to authenticated;
create policy quizzes_select on public.quizzes for select to authenticated
  using (private.can_view_quiz(id));
create policy quizzes_insert on public.quizzes for insert to authenticated
  with check (
    private.has_role('mentor') and author_id = (select auth.uid())
    and (class_id is null or private.is_class_mentor(class_id))
  );
create policy quizzes_update on public.quizzes for update to authenticated
  using (private.can_edit_quiz(id))
  with check (class_id is null or private.is_class_mentor(class_id));
create policy quizzes_delete on public.quizzes for delete to authenticated
  using (private.can_edit_quiz(id));

grant select, insert, update, delete on public.quiz_questions to authenticated;
create policy questions_select on public.quiz_questions for select to authenticated
  using (private.can_view_quiz(quiz_id));
create policy questions_write on public.quiz_questions for all to authenticated
  using (private.can_edit_quiz(quiz_id)) with check (private.can_edit_quiz(quiz_id));

grant select, insert, update, delete on public.quiz_answer_keys to authenticated;
create policy keys_all on public.quiz_answer_keys for all to authenticated
  using (private.can_edit_quiz((select quiz_id from public.quiz_questions q where q.id = question_id)))
  with check (private.can_edit_quiz((select quiz_id from public.quiz_questions q where q.id = question_id)));

grant select on public.quiz_attempts to authenticated;
create policy quiz_attempts_select on public.quiz_attempts for select to authenticated
  using (
    student_id = (select auth.uid())
    or private.is_class_mentor((select class_id from public.quizzes q where q.id = quiz_id))
  );

-- Sesiuni live (jocul în timp real vine într-o etapă următoare).
grant select, insert, update, delete on public.live_sessions to authenticated;
create policy live_select on public.live_sessions for select to authenticated
  using (private.can_view_class(class_id));
create policy live_write on public.live_sessions for all to authenticated
  using (private.is_class_mentor(class_id))
  with check (private.is_class_mentor(class_id) and created_by = (select auth.uid()));

grant select on public.live_results to authenticated;
create policy live_results_select on public.live_results for select to authenticated
  using (private.can_view_class((select class_id from public.live_sessions s where s.id = session_id)));

-- Notificări: doar ale tale; poți doar să le marchezi citite sau să le ștergi.
grant select, delete on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;
create policy notifications_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notifications_delete on public.notifications for delete to authenticated
  using (user_id = (select auth.uid()));

-- Aplicații de mentor: doar administratorii le văd și le actualizează.
-- Formularul public le trimite prin server (cheia secretă), nu direct din browser.
grant select, update on public.mentor_applications to authenticated;
create policy applications_admin_select on public.mentor_applications for select to authenticated
  using (private.is_admin());
create policy applications_admin_update on public.mentor_applications for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

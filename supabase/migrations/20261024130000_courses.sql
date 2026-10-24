-- Cursuri structurate: un curs are lecții în ordine; fiecare lecție are conținut pe blocuri
-- (titluri, paragrafe, cod, tabele, exerciții etc., vezi src/lib/data/types.ts → ContentBlock).

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  title text not null check (char_length(title) between 3 and 120),
  subtitle text not null default '',
  description text not null default '',
  topic text not null default '',
  level text not null default 'Începător',
  -- Culoarea cursului în interfață.
  accent text not null default 'pink' check (accent in ('pink', 'cyan', 'yellow', 'orange', 'green')),
  -- null = curs global, pentru toți elevii.
  class_id uuid references public.classes (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  status public.publication_status not null default 'draft',
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index on public.courses (class_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]{3,60}$'),
  position integer not null,
  title text not null check (char_length(title) between 3 and 120),
  summary text not null default '',
  duration_min smallint check (duration_min between 1 and 240),
  blocks jsonb not null default '[]' check (jsonb_typeof(blocks) = 'array'),
  status public.publication_status not null default 'draft',
  published_at timestamptz not null default now(),
  unique (course_id, slug)
);
create index on public.lessons (course_id, position);

create function private.can_view_course(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and exists (
    select 1 from public.courses c
    where c.id = cid
      and (
        (c.status = 'published' and (c.class_id is null or private.is_class_member(c.class_id)))
        or c.author_id = (select auth.uid())
        or (c.class_id is not null and private.is_class_mentor(c.class_id))
      )
  );
$$;

create function private.can_edit_course(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_role('mentor') and exists (
    select 1 from public.courses c
    where c.id = cid
      and (c.author_id = (select auth.uid()) or (c.class_id is not null and private.is_class_mentor(c.class_id)))
  );
$$;

revoke all on function private.can_view_course(uuid) from public, anon;
revoke all on function private.can_edit_course(uuid) from public, anon;
grant execute on function private.can_view_course(uuid) to authenticated;
grant execute on function private.can_edit_course(uuid) to authenticated;

alter table public.courses enable row level security;
alter table public.lessons enable row level security;

grant select, insert, update, delete on public.courses to authenticated;
create policy courses_select on public.courses for select to authenticated
  using (private.can_view_course(id));
create policy courses_insert on public.courses for insert to authenticated
  with check (
    private.has_role('mentor') and author_id = (select auth.uid())
    and (class_id is null or private.is_class_mentor(class_id))
  );
create policy courses_update on public.courses for update to authenticated
  using (private.can_edit_course(id))
  with check (class_id is null or private.is_class_mentor(class_id));
create policy courses_delete on public.courses for delete to authenticated
  using (private.can_edit_course(id));

-- Lecțiile publicate dintr-un curs vizibil; ciornele doar pentru cine poate edita cursul.
grant select, insert, update, delete on public.lessons to authenticated;
create policy lessons_select on public.lessons for select to authenticated
  using (
    private.can_view_course(course_id)
    and (status = 'published' or private.can_edit_course(course_id))
  );
create policy lessons_write on public.lessons for all to authenticated
  using (private.can_edit_course(course_id)) with check (private.can_edit_course(course_id));

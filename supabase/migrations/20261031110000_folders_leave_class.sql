-- Materialele ca foldere: o lecție e un folder (capitol) care poate avea subfoldere, fiecare
-- cu materialele lui (PDF, probleme rezolvate etc.). Doar folderele de pe primul nivel se pun
-- într-o clasă; subfolderele le urmează pe ale lor. Plus: elevul poate ieși singur dintr-o clasă.

alter table public.lessons
  add column parent_id uuid references public.lessons (id) on delete cascade,
  add constraint lessons_not_own_parent check (parent_id is null or parent_id <> id);
create index on public.lessons (parent_id);

-- Folderul de pe primul nivel al unei lecții (ea însăși, dacă nu are părinte).
create function private.lesson_root(lid uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  with recursive up as (
    select id, parent_id, 0 as depth from public.lessons where id = lid
    union all
    select l.id, l.parent_id, up.depth + 1
    from public.lessons l join up on l.id = up.parent_id
    where up.depth < 10
  )
  select id from up where parent_id is null limit 1;
$$;
revoke all on function private.lesson_root(uuid) from public, anon;
grant execute on function private.lesson_root(uuid) to authenticated;

-- Cel mult 3 niveluri (folder → subfolder → subfolder), fără bucle, același autor.
create function private.check_lesson_parent() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_depth integer := 0; v_cur uuid := new.parent_id; v_author uuid;
begin
  if new.parent_id is null then return new; end if;
  select author_id into v_author from public.lessons where id = new.parent_id;
  if v_author is distinct from new.author_id then
    raise exception 'Subfolderul trebuie să fie în folderul aceluiași autor.' using errcode = '42501';
  end if;
  while v_cur is not null loop
    if v_cur = new.id then
      raise exception 'Un folder nu poate fi pus în propriul subfolder.' using errcode = '22023';
    end if;
    v_depth := v_depth + 1;
    if v_depth > 2 then
      raise exception 'Cel mult trei niveluri de foldere.' using errcode = '22023';
    end if;
    select parent_id into v_cur from public.lessons where id = v_cur;
  end loop;
  return new;
end;
$$;
create trigger lessons_parent_check before insert or update of parent_id on public.lessons
  for each row execute function private.check_lesson_parent();

-- Un subfolder se vede dacă se vede folderul lui de pe primul nivel.
create or replace function private.can_view_lesson(lid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me_active() and (
    private.can_edit_lesson(lid)
    or exists (
      select 1 from public.lessons l join public.courses c on c.id = l.course_id
      where l.id = lid and c.status = 'published' and c.class_id is null
    )
    or exists (
      select 1 from public.lesson_classes lc
      where lc.lesson_id = private.lesson_root(lid)
        and (private.is_class_mentor(lc.class_id) or (lc.published and private.is_class_member(lc.class_id)))
    )
  );
$$;

-- Doar folderele de pe primul nivel se pun în clase.
drop policy lesson_classes_write on public.lesson_classes;
create policy lesson_classes_write on public.lesson_classes for all to authenticated
  using (private.can_edit_lesson(lesson_id) and private.is_class_mentor(class_id))
  with check (
    private.can_edit_lesson(lesson_id) and private.is_class_mentor(class_id)
    and (select parent_id from public.lessons where id = lesson_id) is null
  );

-- Elevul poate ieși singur din clasă (XP-ul și lucrările lui rămân).
drop policy members_delete on public.class_members;
create policy members_delete on public.class_members for delete to authenticated
  using (private.is_class_mentor(class_id) or student_id = (select auth.uid()));

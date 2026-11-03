-- Corectarea prezenței: mentorul poate scoate un elev dintr-o întâlnire (status 'none' în
-- set_attendance) sau poate șterge toată întâlnirea; în ambele cazuri dispare și XP-ul de
-- prezență. O lecție are cel mult o întâlnire cu prezență în aceeași clasă.

create or replace function public.set_attendance(p_meeting uuid, p_records jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
declare m public.attendance_meetings%rowtype; r record; v_status public.attendance_status;
begin
  select * into m from public.attendance_meetings where id = p_meeting;
  if m.id is null or not private.is_class_mentor(m.class_id) then
    raise exception 'Nu poți modifica prezența la această întâlnire.' using errcode = '42501';
  end if;
  for r in select key::uuid as student_id, value as status from jsonb_each_text(p_records) loop
    -- „none”: elevul a fost trecut din greșeală; înregistrarea și XP-ul dispar.
    if r.status = 'none' then
      delete from public.attendance_records where meeting_id = m.id and student_id = r.student_id;
      delete from public.xp_transactions where event_key = 'attendance:' || m.id || ':' || r.student_id;
      continue;
    end if;
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

-- Șterge o întâlnire cu toate prezențele ei și XP-ul dat pentru ea.
create or replace function public.delete_attendance_meeting(p_meeting uuid)
returns void
language plpgsql security definer set search_path = '' as $$
declare m public.attendance_meetings%rowtype;
begin
  select * into m from public.attendance_meetings where id = p_meeting;
  if m.id is null or not private.is_class_mentor(m.class_id) then
    raise exception 'Nu poți șterge această întâlnire.' using errcode = '42501';
  end if;
  delete from public.xp_transactions where event_key like 'attendance:' || m.id || ':%';
  delete from public.attendance_meetings where id = m.id;
end;
$$;

revoke all on function public.delete_attendance_meeting(uuid) from public, anon;
grant execute on function public.delete_attendance_meeting(uuid) to authenticated;

-- O singură prezență pe lecție și clasă. Trigger (nu index unic), ca dublurile vechi să
-- rămână până le șterge mentorul; orice dublură nouă e refuzată.
create or replace function private.one_meeting_per_lesson()
returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.lesson_id is not null and exists (
    select 1 from public.attendance_meetings
    where class_id = new.class_id and lesson_id = new.lesson_id and id <> new.id
  ) then
    raise exception 'Lecția are deja prezența notată.' using errcode = '23505';
  end if;
  return new;
end;
$$;

drop trigger if exists one_meeting_per_lesson on public.attendance_meetings;
create trigger one_meeting_per_lesson
  before insert or update of lesson_id, class_id on public.attendance_meetings
  for each row execute function private.one_meeting_per_lesson();

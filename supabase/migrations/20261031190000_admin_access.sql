-- Un mentor poate avea și drepturi de administrator (admin_access), fără să-și piardă
-- clasele. Coloana nu e în lista celor pe care utilizatorul le poate modifica singur
-- (doar display_name, avatar, notification_prefs), deci o schimbă doar serverul.
alter table public.profiles add column admin_access boolean not null default false;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and status = 'active'
      and (role = 'admin' or admin_access)
  );
$$;

-- Preferințele de notificare ale fiecărui cont: ce tipuri de notificări vrea să vadă.
-- { "<cheie>": false } ascunde tipul respectiv; o cheie lipsă înseamnă „da”.
alter table public.profiles
  add column notification_prefs jsonb not null default '{}'
  check (jsonb_typeof(notification_prefs) = 'object');

grant update (notification_prefs) on public.profiles to authenticated;

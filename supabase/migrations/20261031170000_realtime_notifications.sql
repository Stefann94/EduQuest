-- Notificările ajung în browser pe loc (Supabase Realtime), fără reîncărcarea paginii.
-- Realtime respectă RLS: fiecare utilizator primește doar rândurile lui (notifications_select).
alter publication supabase_realtime add table public.notifications;

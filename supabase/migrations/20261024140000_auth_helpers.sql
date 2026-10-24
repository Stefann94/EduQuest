-- Verificări pentru înregistrare, folosite doar de server (cheia secretă).
-- Nu sunt disponibile pentru vizitatori sau pentru utilizatorii logați, ca să nu se
-- poată afla din browser ce adrese au cont.

create function public.email_taken(p_email text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users where lower(email) = lower(trim(p_email)));
$$;

revoke all on function public.email_taken(text) from public, anon, authenticated;
grant execute on function public.email_taken(text) to service_role;

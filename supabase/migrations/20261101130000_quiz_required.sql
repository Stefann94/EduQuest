-- Quiz-urile pentru clase pot fi obligatorii (ca o temă: apar elevului la Misiuni) sau
-- opționale (exersare). Implicit opționale, ca până acum.
alter table public.quizzes add column required boolean not null default false;

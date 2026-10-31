-- Avatar nou pentru elevi: foca.
alter table public.profiles drop constraint profiles_avatar_check;
alter table public.profiles add constraint profiles_avatar_check
  check (avatar in ('fox', 'panda', 'owl', 'cat', 'robot', 'rocket', 'octopus', 'penguin', 'seal'));

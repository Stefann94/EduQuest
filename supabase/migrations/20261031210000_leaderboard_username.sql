-- Clasamentul clasei întoarce și username-ul: colegii văd username-ul, mentorul numele real.
drop function if exists public.class_leaderboard(uuid);

create function public.class_leaderboard(p_class uuid)
returns table (student_id uuid, display_name text, username text, avatar text, xp bigint, rank bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.can_view_class(p_class) then
    raise exception 'Nu ai acces la această clasă.' using errcode = '42501';
  end if;
  return query
    select m.student_id, p.display_name, p.username, p.avatar, coalesce(sum(x.amount), 0)::bigint as xp,
           rank() over (order by coalesce(sum(x.amount), 0) desc)::bigint
    from public.class_members m
    join public.profiles p on p.id = m.student_id
    left join public.xp_transactions x on x.student_id = m.student_id and x.class_id = p_class
    where m.class_id = p_class
    group by m.student_id, p.display_name, p.username, p.avatar
    order by 5 desc, 2;
end;
$$;

revoke all on function public.class_leaderboard(uuid) from public, anon;
grant execute on function public.class_leaderboard(uuid) to authenticated;

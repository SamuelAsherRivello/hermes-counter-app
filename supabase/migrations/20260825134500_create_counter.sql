create table if not exists public.counter_state (
  id smallint primary key check (id = 1),
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.counter_state (id, value)
values (1, 0)
on conflict (id) do nothing;

alter table public.counter_state enable row level security;

revoke all on public.counter_state from anon, authenticated;
grant select on public.counter_state to anon, authenticated;

drop policy if exists "counter is publicly readable" on public.counter_state;
create policy "counter is publicly readable"
on public.counter_state
for select
to anon, authenticated
using (id = 1);

create or replace function public.increment_counter(amount integer)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_value bigint;
begin
  if amount not in (-1, 1) then
    raise exception 'amount must be -1 or 1';
  end if;

  update public.counter_state
  set value = value + amount,
      updated_at = now()
  where id = 1
  returning value into new_value;

  return new_value;
end;
$$;

create or replace function public.reset_counter()
returns bigint
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.counter_state
  set value = 0,
      updated_at = now()
  where id = 1
  returning value;
$$;

revoke all on function public.increment_counter(integer) from public;
revoke all on function public.reset_counter() from public;
grant execute on function public.increment_counter(integer) to anon, authenticated;
grant execute on function public.reset_counter() to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.counter_state;
exception
  when duplicate_object then null;
end;
$$;

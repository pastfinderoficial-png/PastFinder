-- Fix: infinite recursion in RLS policies that checked "is this user an admin"
-- via a subquery against public.users from within a policy defined ON
-- public.users itself (evaluating the policy re-triggers the same policy).
--
-- Fix: a `security definer` helper function bypasses RLS for its internal
-- lookup (it runs with the privileges of the function owner, which owns the
-- table), so policies can call it without re-entering RLS evaluation.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.users where id = uid), false);
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin" on public.users
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "withdrawals_select_own_or_admin" on public.withdrawals;
create policy "withdrawals_select_own_or_admin" on public.withdrawals
  for select using (auth.uid() = creator_id or public.is_admin(auth.uid()));

drop policy if exists "withdrawals_update_admin" on public.withdrawals;
create policy "withdrawals_update_admin" on public.withdrawals
  for update using (public.is_admin(auth.uid()));

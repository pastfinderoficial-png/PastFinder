-- Auth architecture refactor: public browsing + gated actions
--
-- IMPORTANT: this file is a DRAFT. It has not been applied to the live Supabase
-- project. Before running it, check the current state of Row Level Security on
-- your project (Supabase Dashboard -> Authentication -> Policies, or
-- `supabase db pull`) since this repo previously had no migration history and
-- the live policy state is unknown. Apply via `supabase db push` or by pasting
-- into the Supabase SQL Editor. Every statement below is written to be safely
-- re-runnable (idempotent) via `if not exists` / `drop policy if exists`.

-- ============================================================================
-- 1. favorites table
--    Distinct from `likes`: a fan can "save" a story to read later without it
--    being a public "like" signal.
-- ============================================================================

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- 2. Row Level Security policies
--    Row-level visibility only. Column-level protection of premium content
--    (text_content / media_url) is handled by the get_post_detail() RPC below,
--    not by these row policies -- Postgres/PostgREST can't vary column grants
--    per row, which is what "gated by ownership or active subscription" needs.
-- ============================================================================

alter table public.posts enable row level security;

drop policy if exists "posts_select_all" on public.posts;
create policy "posts_select_all" on public.posts
  for select using (true);

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (auth.uid() = creator_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update using (auth.uid() = creator_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete using (auth.uid() = creator_id);

-- likes
alter table public.likes enable row level security;

drop policy if exists "likes_select_all" on public.likes;
create policy "likes_select_all" on public.likes for select using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes for delete using (auth.uid() = user_id);

-- comments
alter table public.comments enable row level security;

drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments for select using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments for delete using (auth.uid() = user_id);

-- follows
alter table public.follows enable row level security;

drop policy if exists "follows_select_all" on public.follows;
create policy "follows_select_all" on public.follows for select using (true);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows for insert with check (auth.uid() = follower_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows for delete using (auth.uid() = follower_id);

-- subscriptions: owner (fan) or the subscribed-to creator can read.
-- No insert/update/delete policy for anon/authenticated roles -- only the
-- mercadopago-webhook edge function (service_role, bypasses RLS) writes here.
alter table public.subscriptions enable row level security;

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = fan_id or auth.uid() = creator_id);

-- earnings: creator can read their own; writes are service-role only (webhook).
alter table public.earnings enable row level security;

drop policy if exists "earnings_select_own" on public.earnings;
create policy "earnings_select_own" on public.earnings for select using (auth.uid() = creator_id);

-- withdrawals: creator can read/insert their own; admins can read all and update status.
alter table public.withdrawals enable row level security;

drop policy if exists "withdrawals_select_own_or_admin" on public.withdrawals;
create policy "withdrawals_select_own_or_admin" on public.withdrawals
  for select using (
    auth.uid() = creator_id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

drop policy if exists "withdrawals_insert_own" on public.withdrawals;
create policy "withdrawals_insert_own" on public.withdrawals
  for insert with check (auth.uid() = creator_id);

drop policy if exists "withdrawals_update_admin" on public.withdrawals;
create policy "withdrawals_update_admin" on public.withdrawals
  for update using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

-- creators / fans / users: public read of the safe columns needed for browsing
-- (display_name, bio, images, price, location). Writes restricted to the
-- owning user. Client code should keep selecting an explicit column list
-- (never `select('*')`) on these tables from public pages.
alter table public.creators enable row level security;

drop policy if exists "creators_select_all" on public.creators;
create policy "creators_select_all" on public.creators for select using (true);

drop policy if exists "creators_upsert_own" on public.creators;
create policy "creators_upsert_own" on public.creators for insert with check (auth.uid() = user_id);

drop policy if exists "creators_update_own" on public.creators;
create policy "creators_update_own" on public.creators for update using (auth.uid() = user_id);

alter table public.fans enable row level security;

drop policy if exists "fans_select_all" on public.fans;
create policy "fans_select_all" on public.fans for select using (true);

drop policy if exists "fans_upsert_own" on public.fans;
create policy "fans_upsert_own" on public.fans for insert with check (auth.uid() = user_id);

drop policy if exists "fans_update_own" on public.fans;
create policy "fans_update_own" on public.fans for update using (auth.uid() = user_id);

alter table public.users enable row level security;

drop policy if exists "users_select_own_or_admin" on public.users;
create policy "users_select_own_or_admin" on public.users
  for select using (
    auth.uid() = id
    or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin = true)
  );

drop policy if exists "users_upsert_own" on public.users;
create policy "users_upsert_own" on public.users for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- ============================================================================
-- 3. get_post_detail RPC
--    Server-side gating for premium (is_ppv / is_sub_only) post content.
--    Returns preview fields to everyone; full text_content/media_url only to
--    the post owner or a fan with an active subscription to that creator.
--    Chosen over column-level RLS (not row-dependent in Postgres/PostgREST) or
--    a posts/posts_content table split (much larger migration for the same
--    outcome). Residual gap: the `media` storage bucket is public, so a
--    media_url handed out to an authorized viewer could still be replayed
--    outside the app -- full fix requires a private bucket + signed URLs,
--    recommended as a fast-follow, not included here.
-- ============================================================================

create or replace function public.get_post_detail(p_post_id uuid)
returns table (
  id uuid,
  creator_id uuid,
  title text,
  description text,
  media_type text,
  category text,
  created_at timestamptz,
  is_ppv boolean,
  is_sub_only boolean,
  preview_text text,
  full_text_content text,
  media_url text,
  has_access boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_post record;
  v_owns boolean;
  v_subscribed boolean;
begin
  select * into v_post from public.posts where posts.id = p_post_id;
  if not found then
    return;
  end if;

  v_owns := (v_uid is not null and v_uid = v_post.creator_id);
  v_subscribed := (v_uid is not null and exists (
    select 1 from public.subscriptions s
    where s.fan_id = v_uid
      and s.creator_id = v_post.creator_id
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  ));

  return query select
    v_post.id,
    v_post.creator_id,
    v_post.title,
    v_post.description,
    v_post.media_type,
    v_post.category,
    v_post.created_at,
    v_post.is_ppv,
    v_post.is_sub_only,
    left(coalesce(v_post.text_content, ''), 400) as preview_text,
    case
      when v_owns or v_subscribed or not (coalesce(v_post.is_ppv, false) or coalesce(v_post.is_sub_only, false))
      then v_post.text_content
      else null
    end as full_text_content,
    case
      when v_owns or v_subscribed or not (coalesce(v_post.is_ppv, false) or coalesce(v_post.is_sub_only, false))
      then v_post.media_url
      else null
    end as media_url,
    (v_owns or v_subscribed or not (coalesce(v_post.is_ppv, false) or coalesce(v_post.is_sub_only, false))) as has_access;
end;
$$;

grant execute on function public.get_post_detail(uuid) to anon, authenticated;

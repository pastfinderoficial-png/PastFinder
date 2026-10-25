-- ============================================================================
-- Gate premium post content at the database level.
--
-- Problem: posts_select_all (using true) lets any client read posts.text_content
-- and posts.media_url, including for premium (is_ppv / is_sub_only) posts.
-- get_post_detail() only protected the detail screen, not direct table reads.
--
-- Fix: move the two sensitive columns to public.post_content, whose RLS only
-- allows the owner, active subscribers, or anyone for free posts. Non-destructive:
-- data is copied, the legacy columns are kept (but made unreadable) so a
-- follow-up migration can drop them once this one is verified in production.
--
-- Known residual gap (unchanged): the `media` storage bucket is public, so an
-- already-known media URL can still be fetched directly. Closing it needs a
-- private bucket + signed URLs.
-- ============================================================================

-- 1. Table ------------------------------------------------------------------
create table if not exists public.post_content (
  post_id uuid primary key references public.posts(id) on delete cascade,
  text_content text,
  media_url text
);

alter table public.post_content enable row level security;

-- 2. Backfill (copy only, nothing is deleted) --------------------------------
insert into public.post_content (post_id, text_content, media_url)
select p.id, p.text_content, p.media_url
from public.posts p
where p.text_content is not null or p.media_url is not null
on conflict (post_id) do nothing;

-- 3. Access rule, single source of truth -------------------------------------
create or replace function public.can_view_post_content(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.posts p
    where p.id = p_post_id
      and (
        not (coalesce(p.is_ppv, false) or coalesce(p.is_sub_only, false))
        or (auth.uid() is not null and p.creator_id = auth.uid())
        or (
          auth.uid() is not null
          and exists (
            select 1
            from public.subscriptions s
            where s.fan_id = auth.uid()
              and s.creator_id = p.creator_id
              and s.status = 'active'
              and (s.current_period_end is null or s.current_period_end > now())
          )
        )
      )
  );
$$;

grant execute on function public.can_view_post_content(uuid) to anon, authenticated;

-- 4. Policies ----------------------------------------------------------------
drop policy if exists "post_content_select_gated" on public.post_content;
create policy "post_content_select_gated" on public.post_content
  for select using (public.can_view_post_content(post_id));

drop policy if exists "post_content_insert_owner" on public.post_content;
create policy "post_content_insert_owner" on public.post_content
  for insert with check (
    exists (select 1 from public.posts p where p.id = post_id and p.creator_id = auth.uid())
  );

drop policy if exists "post_content_update_owner" on public.post_content;
create policy "post_content_update_owner" on public.post_content
  for update
  using (exists (select 1 from public.posts p where p.id = post_id and p.creator_id = auth.uid()))
  with check (exists (select 1 from public.posts p where p.id = post_id and p.creator_id = auth.uid()));

drop policy if exists "post_content_delete_owner" on public.post_content;
create policy "post_content_delete_owner" on public.post_content
  for delete using (
    exists (select 1 from public.posts p where p.id = post_id and p.creator_id = auth.uid())
  );

-- 5. Make the legacy columns unreadable by API roles -------------------------
-- A column-level REVOKE is a no-op while a table-level SELECT grant exists, so
-- revoke the table grant and re-grant every column except the two sensitive ones.
revoke select on public.posts from anon, authenticated;

do $$
declare
  v_cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into v_cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'posts'
    and column_name not in ('text_content', 'media_url');

  execute format('grant select (%s) on public.posts to anon, authenticated', v_cols);
end
$$;

-- 6. get_post_detail now reads content from post_content ----------------------
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
  v_post record;
  v_text text;
  v_media text;
  v_access boolean;
begin
  select * into v_post from public.posts where posts.id = p_post_id;
  if not found then
    return;
  end if;

  select coalesce(pc.text_content, v_post.text_content),
         coalesce(pc.media_url, v_post.media_url)
    into v_text, v_media
  from (select 1) as one
  left join public.post_content pc on pc.post_id = p_post_id;

  v_access := public.can_view_post_content(p_post_id);

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
    left(coalesce(v_text, ''), 400) as preview_text,
    case when v_access then v_text else null end as full_text_content,
    case when v_access then v_media else null end as media_url,
    v_access as has_access;
end;
$$;

grant execute on function public.get_post_detail(uuid) to anon, authenticated;

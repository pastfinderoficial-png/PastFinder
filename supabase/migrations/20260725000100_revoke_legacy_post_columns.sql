-- ============================================================================
-- Step 2 of 2: close the leak. Run ONLY after the new frontend is deployed.
--
-- Once this runs, `select *` on public.posts fails for anon/authenticated, so
-- any client still using the old frontend will break. That is intentional: the
-- legacy columns are what exposed premium content.
--
-- The legacy columns are kept (unreadable) so this is reversible. Drop them in
-- a later migration after verifying production.
--
-- Maintenance note: because grants are now per-column, any column added to
-- public.posts later must be granted explicitly:
--   grant select (new_column) on public.posts to anon, authenticated;
-- ============================================================================

-- Pick up anything written through the old frontend between step 1 and now.
insert into public.post_content (post_id, text_content, media_url)
select p.id, p.text_content, p.media_url
from public.posts p
where p.text_content is not null or p.media_url is not null
on conflict (post_id) do nothing;

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

notify pgrst, 'reload schema';

-- Public score sharing support.
-- Keeps private owner CRUD policies intact while allowing anonymous reads of
-- rows that users explicitly publish.

alter table public.scores
  add column if not exists is_public boolean not null default false,
  add column if not exists published_at timestamptz,
  add column if not exists public_author_label text;

create index if not exists idx_scores_public_published
  on public.scores(is_public, published_at desc)
  where is_public = true;

create index if not exists idx_scores_public_updated
  on public.scores(is_public, updated_at desc)
  where is_public = true;

create index if not exists idx_scores_public_title
  on public.scores using gin(title gin_trgm_ops)
  where is_public = true;

drop policy if exists scores_select_public on public.scores;
create policy scores_select_public on public.scores
for select using (is_public = true);

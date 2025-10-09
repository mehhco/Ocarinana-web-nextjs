-- =============================================================
-- 扩展与基础
-- =============================================================
-- 说明：
-- 1) 本迁移为 Ocarinana（陶笛谱生成器）的核心数据存储结构。
-- 2) 采用 UUID 作为主键，便于在客户端/服务端间传递，无需序列依赖。
-- 3) 采用 JSONB 存储乐谱文档（ScoreDocument），保持灵活可演进。
-- 4) 启用 RLS（行级安全），确保用户只能访问自己的数据。

-- 启用必需的扩展：pgcrypto 用于生成随机 UUID（gen_random_uuid）。
-- 如果你在 Supabase 默认项目中，一般已可用；此处幂等创建。
-- Enable required extension for UUID generation
create extension if not exists pgcrypto;

-- =============================================================
-- 主表：scores（每个乐谱一行）
-- =============================================================
-- 设计要点：
-- - score_id：主键，UUID。
-- - owner_user_id：乐谱所有者，对应 auth.users(id)。开启级联删除，用户删除同时删除作品。
-- - title：乐谱标题，冗余存储加速列表展示（无需解包 document）。
-- - document：完整的乐谱文档（ScoreDocument），JSONB 存储。
-- - created_at / updated_at：审计时间戳。
-- - 通过触发器在更新时自动维护 updated_at。
-- Main scores table
create table if not exists public.scores (
  score_id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade, -- 所有者
  title text not null,                                                      -- 标题（用于列表快速展示）
  document jsonb not null,                                                  -- ScoreDocument（JSONB）
  created_at timestamptz not null default now(),                            -- 创建时间
  updated_at timestamptz not null default now()                             -- 更新时间（由触发器维护）
);

-- 索引：
-- 1) owner_user_id：便于按用户筛选。
-- 2) updated_at：便于最近更新排序。
create index if not exists idx_scores_owner on public.scores(owner_user_id);
create index if not exists idx_scores_updated_at on public.scores(updated_at desc);

-- =============================================================
-- 触发器：自动更新 updated_at
-- =============================================================
-- 更新任意列时，保持 updated_at=now()，便于“最近编辑”场景排序。
-- Trigger to update updated_at on change
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_scores_updated_at on public.scores;
create trigger trg_scores_updated_at
before update on public.scores
for each row execute function public.set_updated_at();

-- （简化）根据需求去除历史版本，仅保留最终版本，故不创建 score_revisions 表与其索引。

-- =============================================================
-- 行级安全（RLS）与访问策略
-- =============================================================
-- 目标：
-- - 用户仅能读取/写入/更新/删除自己的 scores。
-- - 用户仅能读取/写入与自己 scores 关联的 revisions。
-- 开启 RLS 后，任何未被策略允许的操作将被拒绝。
-- Row Level Security
alter table public.scores enable row level security;

-- Policies for scores: only owner can CRUD
-- 读取策略：仅所有者可 SELECT
drop policy if exists scores_select_own on public.scores;
create policy scores_select_own on public.scores
for select using (owner_user_id = auth.uid());

-- 插入策略：仅允许以当前用户为 owner_user_id 的行插入
drop policy if exists scores_insert_own on public.scores;
create policy scores_insert_own on public.scores
for insert with check (owner_user_id = auth.uid());

-- 更新策略：仅所有者可 UPDATE，且更新后仍需满足 owner 不变
drop policy if exists scores_update_own on public.scores;
create policy scores_update_own on public.scores
for update using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists scores_delete_own on public.scores;
create policy scores_delete_own on public.scores
for delete using (owner_user_id = auth.uid());

-- （简化）已移除与 score_revisions 相关的 RLS 策略。



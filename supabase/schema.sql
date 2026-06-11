-- MoodScale FAQ Navigator schema
-- Run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists faq_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references faq_nodes(id) on delete cascade,
  node_type text not null check (node_type in ('category', 'subcategory', 'question')),
  title text not null,
  answer text,
  redirect_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_faq_nodes_parent_id on faq_nodes(parent_id);
create index if not exists idx_faq_nodes_parent_sort on faq_nodes(parent_id, sort_order);
create index if not exists idx_faq_nodes_active on faq_nodes(is_active);

alter table faq_nodes enable row level security;

create policy "Public read active faq nodes"
  on faq_nodes for select
  using (is_active = true);

-- ════════════════════════════════════════════════════════════
--  Club Cannábico Planner — esquema de feedback compartido
--  Pegar y ejecutar en Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  author     text not null default 'Anónimo',
  version    text not null default 'general',
  category   text not null default 'otro',
  message    text not null,
  votes      int  not null default 0,
  status     text not null default 'abierto'
);

-- Permisos base (RLS abajo igual filtra)
grant usage on schema public to anon, authenticated;
grant select, insert on public.feedback to anon, authenticated;

-- Row Level Security
alter table public.feedback enable row level security;

create policy "feedback_select_all" on public.feedback
  for select using (true);

create policy "feedback_insert_all" on public.feedback
  for insert with check (true);

-- Voto vía RPC (evita permitir UPDATE libre de filas)
create or replace function public.bump_feedback_vote(fb_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.feedback set votes = votes + 1 where id = fb_id;
$$;

grant execute on function public.bump_feedback_vote(uuid) to anon, authenticated;

-- Realtime (para que la lista se actualice en vivo entre usuarios)
alter publication supabase_realtime add table public.feedback;

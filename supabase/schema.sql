-- ════════════════════════════════════════════════════════════
--  Club Cannábico Planner — esquema con acceso restringido
--  Login con Supabase Auth + aprobación manual.
--  Pegar y ejecutar en Supabase → SQL Editor.
--  Es idempotente: se puede re-ejecutar sin romper datos existentes.
-- ════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Tabla de feedback ───────────────────────────────────────
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

-- ── Perfiles + aprobación ───────────────────────────────────
-- Cada usuario que se registra arranca como NO aprobado.
-- Vos lo habilitás poniendo approved = true (ver nota al final).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario sólo puede ver su propio perfil (para saber si está aprobado).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- Al registrarse un usuario nuevo, se crea su perfil (pendiente).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: ¿el usuario actual está aprobado? (security definer evita recursión de RLS)
create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select approved from public.profiles where id = auth.uid()), false);
$$;

grant execute on function public.is_approved() to authenticated;

-- ── Permisos y RLS del feedback ─────────────────────────────
-- Quitamos cualquier acceso del rol anónimo (público sin login).
revoke select, insert on public.feedback from anon;
grant usage on schema public to authenticated;
grant select, insert on public.feedback to authenticated;

alter table public.feedback enable row level security;

-- Borramos las políticas viejas y permisivas si existían.
drop policy if exists "feedback_select_all" on public.feedback;
drop policy if exists "feedback_insert_all" on public.feedback;
drop policy if exists "feedback_select_approved" on public.feedback;
drop policy if exists "feedback_insert_approved" on public.feedback;

-- Sólo usuarios logueados Y aprobados pueden leer/escribir feedback.
create policy "feedback_select_approved" on public.feedback
  for select to authenticated using (public.is_approved());

create policy "feedback_insert_approved" on public.feedback
  for insert to authenticated with check (public.is_approved());

-- ── Voto vía RPC (sólo aprobados) ───────────────────────────
create or replace function public.bump_feedback_vote(fb_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_approved() then
    raise exception 'No autorizado';
  end if;
  update public.feedback set votes = votes + 1 where id = fb_id;
end;
$$;

revoke execute on function public.bump_feedback_vote(uuid) from anon;
grant execute on function public.bump_feedback_vote(uuid) to authenticated;

-- ── Realtime (lista en vivo entre usuarios) ─────────────────
do $$
begin
  alter publication supabase_realtime add table public.feedback;
exception when duplicate_object then null;
end $$;

-- ════════════════════════════════════════════════════════════
--  CÓMO APROBAR A ALGUIEN
--  Cuando una persona se registra, aparece en public.profiles
--  con approved = false. Para darle acceso, ejecutá:
--
--    update public.profiles set approved = true
--    where email = 'persona@ejemplo.com';
--
--  (o editá la fila en Table Editor → profiles → approved = true)
-- ════════════════════════════════════════════════════════════

-- Run in Supabase SQL Editor. Safe to run more than once.
-- Auth passwords remain managed by Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  username text unique,
  country text default 'Uganda',
  bio text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "Members can read own profile" on public.profiles;
create policy "Members can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Members can insert own profile" on public.profiles;
create policy "Members can insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Members can update own profile" on public.profiles;
create policy "Members can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Create an empty profile row automatically when a member registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Do not create a policy allowing users to edit app_metadata or admin roles.
-- Assign administrator role only from a trusted server-side Supabase admin process:
-- set auth.users app_metadata.role = 'admin' using Supabase Admin API/service role.
-- Never expose the service-role key in browser code.

-- Server-only encrypted secrets. No client roles receive table policies.
create table if not exists public.server_secrets (
  secret_name text primary key,
  encrypted_value text not null,
  updated_at timestamptz not null default now()
);
alter table public.server_secrets enable row level security;
revoke all on public.server_secrets from anon, authenticated;

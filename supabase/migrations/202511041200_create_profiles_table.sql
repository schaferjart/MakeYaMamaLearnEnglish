-- Recreate public.profiles table, policies, and triggers required by the app

-- 1) Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  locale text,
  cefr_level text
);

-- 2) Row Level Security and Policies
alter table public.profiles enable row level security;

drop policy if exists "Allow select own profile" on public.profiles;
create policy "Allow select own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Allow update own profile" on public.profiles;
create policy "Allow update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Allow insert matching uid" on public.profiles;
create policy "Allow insert matching uid"
on public.profiles for insert
with check (auth.uid() = id);

-- 3) Updated-at trigger function (idempotent) and trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists set_profile_updated_at on public.profiles;
create trigger set_profile_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 4) New-user handler function (idempotent) and trigger on auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, locale, cefr_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'locale', 'de'),
    coalesce(new.raw_user_meta_data ->> 'cefr_level', 'B1')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();



-- =============================================
-- AXIS MVP - Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  nickname text,
  onboarding_completed boolean default false,
  goal_category text,
  main_difficulty text,
  reminder_time text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- ROUTINES
-- =============================================
create table public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text default 'life_habits',
  frequency_type text default 'daily',
  frequency_value integer default 1,
  preferred_time text,
  status text default 'active',
  created_at timestamptz default now(),
  archived_at timestamptz,
  restarted_at timestamptz
);

alter table public.routines enable row level security;

create policy "Users can manage own routines"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- ROUTINE CHECKS
-- =============================================
create table public.routine_checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_id uuid references public.routines on delete cascade not null,
  date date not null,
  checked boolean default true,
  checked_at timestamptz default now(),
  unique (routine_id, date)
);

alter table public.routine_checks enable row level security;

create policy "Users can manage own checks"
  on public.routine_checks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- ROUTINE EVENTS
-- =============================================
create table public.routine_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_id uuid references public.routines on delete cascade not null,
  event_type text not null,
  event_payload jsonb,
  created_at timestamptz default now()
);

alter table public.routine_events enable row level security;

create policy "Users can manage own events"
  on public.routine_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- INDEXES
-- =============================================
create index on public.routines (user_id, status);
create index on public.routine_checks (user_id, date);
create index on public.routine_checks (routine_id, date);
create index on public.routine_events (routine_id, created_at);

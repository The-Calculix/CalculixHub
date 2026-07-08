create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'parent', 'teacher', 'admin');
create type public.learning_event_type as enum (
  'lesson_started',
  'lesson_completed',
  'quiz_submitted',
  'practice_submitted',
  'ai_feedback_viewed'
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type public.learning_event_type not null,
  subject text not null default 'math',
  skill text,
  lesson_id text,
  score numeric check (score is null or (score >= 0 and score <= 1)),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null default 'math',
  skill text not null,
  mastery numeric not null default 0 check (mastery >= 0 and mastery <= 1),
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0),
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, subject, skill)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger user_progress_touch_updated_at
before update on public.user_progress
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.record_learning_event(
  p_user_id uuid,
  p_event_type public.learning_event_type,
  p_subject text default 'math',
  p_skill text default null,
  p_lesson_id text default null,
  p_score numeric default null,
  p_duration_seconds integer default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.learning_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.learning_events;
  v_correct integer := 0;
  v_mastery numeric := 0;
begin
  if p_score is not null and (p_score < 0 or p_score > 1) then
    raise exception 'score must be between 0 and 1';
  end if;

  insert into public.learning_events(
    user_id, event_type, subject, skill, lesson_id, score, duration_seconds, metadata
  )
  values (
    p_user_id, p_event_type, coalesce(nullif(p_subject, ''), 'math'), nullif(p_skill, ''),
    nullif(p_lesson_id, ''), p_score, p_duration_seconds, coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_event;

  if p_skill is not null and length(trim(p_skill)) > 0 then
    v_correct := case when coalesce(p_score, 0) >= 0.8 then 1 else 0 end;
    v_mastery := coalesce(p_score, 0);

    insert into public.user_progress(user_id, subject, skill, mastery, attempts, correct, last_activity_at)
    values (p_user_id, coalesce(nullif(p_subject, ''), 'math'), trim(p_skill), v_mastery, 1, v_correct, now())
    on conflict (user_id, subject, skill)
    do update set
      attempts = public.user_progress.attempts + 1,
      correct = public.user_progress.correct + excluded.correct,
      mastery = round(((public.user_progress.mastery * public.user_progress.attempts + excluded.mastery) / (public.user_progress.attempts + 1))::numeric, 3),
      last_activity_at = now(),
      updated_at = now();
  end if;

  return v_event;
end;
$$;

alter table public.profiles enable row level security;
alter table public.learning_events enable row level security;
alter table public.user_progress enable row level security;

create policy "profiles_select_own" on public.profiles
for select to authenticated using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "learning_events_select_own" on public.learning_events
for select to authenticated using (auth.uid() = user_id);

create policy "user_progress_select_own" on public.user_progress
for select to authenticated using (auth.uid() = user_id);

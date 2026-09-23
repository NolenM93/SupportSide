-- Support Side Studio — Phase 1 schema
-- Run in the Supabase SQL editor (or via CLI) after creating a project.

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  template_id text not null default 'blank',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  files jsonb not null default '{}'::jsonb,
  prompt text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  credits_used int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,
  reason text not null,
  ref_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id, updated_at desc);
create index if not exists versions_project_id_idx on public.project_versions (project_id, created_at desc);
create index if not exists messages_project_id_idx on public.messages (project_id, created_at);
create index if not exists ledger_user_id_idx on public.credit_ledger (user_id);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.messages enable row level security;
alter table public.credit_ledger enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own versions" on public.project_versions
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "own messages" on public.messages
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "own ledger" on public.credit_ledger
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.credit_balance(uid uuid default auth.uid())
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(delta), 0)::int from public.credit_ledger where user_id = uid;
$$;

create or replace function public.spend_credits(p_amount int, p_reason text, p_ref uuid default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  bal int;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_amount <= 0 then
    raise exception 'invalid_amount';
  end if;
  select coalesce(sum(delta), 0) into bal from public.credit_ledger where user_id = uid;
  if bal < p_amount then
    raise exception 'insufficient_credits';
  end if;
  insert into public.credit_ledger (user_id, delta, reason, ref_id)
  values (uid, -p_amount, p_reason, p_ref);
  return bal - p_amount;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  insert into public.credit_ledger (user_id, delta, reason)
  select new.id, 100, 'trial_grant'
  where not exists (
    select 1 from public.credit_ledger where user_id = new.id and reason = 'trial_grant'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.projects, public.project_versions, public.messages, public.credit_ledger to authenticated;
grant execute on function public.credit_balance(uuid) to authenticated;
grant execute on function public.spend_credits(int, text, uuid) to authenticated;

-- =====================================================================
-- SimulaCarrera — Esquema de base de datos (PostgreSQL / Supabase)
-- Ejecutar en orden: 001_schema.sql -> 002_rls.sql -> 003_seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('superadmin','enterprise','institutional','student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type institution_type as enum ('school','academy','enterprise_network');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('starter','pro','enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type license_status as enum ('active','suspended','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','overdue','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('in_progress','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type career_status as enum ('active','draft');
exception when duplicate_object then null; end $$;

-- ---------- INSTITUTIONS ----------
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type institution_type not null default 'school',
  parent_id uuid references public.institutions(id) on delete set null,
  country text default 'PE',
  city text,
  plan plan_tier not null default 'starter',
  student_quota integer not null default 50,
  license_start date,
  license_end date,
  license_status license_status not null default 'active',
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_institutions_parent on public.institutions(parent_id);

-- ---------- USERS (perfil; mismo id que auth.users) ----------
create table if not exists public.users (
  id uuid primary key,                       -- = auth.users.id
  email text unique not null,
  full_name text,
  role user_role not null default 'student',
  institution_id uuid references public.institutions(id) on delete set null,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_users_institution on public.users(institution_id);
create index if not exists idx_users_role on public.users(role);

-- ---------- ACADEMIC PERIODS ----------
create table if not exists public.academic_periods (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,                        -- e.g. "2026-I"
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_periods_institution on public.academic_periods(institution_id);

-- ---------- STUDENT PROFILES ----------
create table if not exists public.student_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  period_id uuid references public.academic_periods(id) on delete set null,
  grade text,                                -- "5to secundaria", "ciclo 2", etc
  birth_date date,
  enrolled_at timestamptz not null default now()
);
create index if not exists idx_sp_institution on public.student_profiles(institution_id);
create index if not exists idx_sp_period on public.student_profiles(period_id);

-- ---------- CAREERS ----------
create table if not exists public.careers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  area text,                                 -- "Ingeniería", "Salud", etc
  description text,
  avg_salary_pen numeric(12,2),
  employability_score integer check (employability_score between 0 and 100),
  demand_projection text,                    -- "alta","media","baja"
  universities jsonb default '[]'::jsonb,
  estimated_cost_pen numeric(12,2),
  duration_years numeric(3,1),
  related_careers text[] default '{}',
  status career_status not null default 'active',
  created_at timestamptz not null default now()
);
create index if not exists idx_careers_status on public.careers(status);
create index if not exists idx_careers_area on public.careers(area);

-- ---------- DIAGNOSTIC QUESTIONS (banco) ----------
create table if not exists public.diagnostic_questions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  text text not null,
  dimension text not null,                   -- "intereses","aptitudes","valores"
  options jsonb not null,                    -- [{value, label, weights:{area:n}}]
  follow_up_rules jsonb,                     -- reglas adaptativas
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- COGNITIVE QUESTIONS ----------
create table if not exists public.cognitive_questions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  text text not null,
  capacity text not null,                    -- "verbal","numérico","abstracto","espacial"
  difficulty integer not null check (difficulty between 1 and 5),
  options jsonb not null,                    -- [{value,label,is_correct}]
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_cog_capacity on public.cognitive_questions(capacity);
create index if not exists idx_cog_difficulty on public.cognitive_questions(difficulty);

-- ---------- SIMULATIONS ----------
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  career_id uuid not null references public.careers(id) on delete cascade,
  title text not null,
  description text,
  estimated_minutes integer default 15,
  blocks jsonb not null,                     -- array de bloques: situación/opciones/consecuencias
  status career_status not null default 'active',
  created_at timestamptz not null default now()
);
create index if not exists idx_sim_career on public.simulations(career_id);

-- ---------- TEST SESSIONS ----------
create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  period_id uuid references public.academic_periods(id) on delete set null,
  current_stage integer not null default 1,  -- 1..5
  diagnostic_answers jsonb default '[]'::jsonb,
  ranking_preliminary jsonb default '[]'::jsonb,
  explored_careers uuid[] default '{}',
  simulation_results jsonb default '[]'::jsonb,
  cognitive_answers jsonb default '[]'::jsonb,
  final_report jsonb,
  status report_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_sessions_student on public.test_sessions(student_id);
create index if not exists idx_sessions_period on public.test_sessions(period_id);

-- ---------- REPORTS (snapshot final descargable) ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.test_sessions(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete set null,
  period_id uuid references public.academic_periods(id) on delete set null,
  payload jsonb not null,                    -- top carreras, justificación, recomendaciones
  pdf_url text,                              -- bucket Supabase Storage
  created_at timestamptz not null default now()
);
create index if not exists idx_reports_student on public.reports(student_id);
create index if not exists idx_reports_institution on public.reports(institution_id);

-- ---------- PAYMENTS ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  amount_pen numeric(12,2) not null,
  period_start date not null,
  period_end date not null,
  status payment_status not null default 'pending',
  paid_at timestamptz,
  invoice_number text,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_institution on public.payments(institution_id);
create index if not exists idx_payments_status on public.payments(status);

-- ---------- AUDIT LOG ----------
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------- TRIGGERS ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_inst_touch on public.institutions;
create trigger trg_inst_touch before update on public.institutions
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_users_touch on public.users;
create trigger trg_users_touch before update on public.users
  for each row execute function public.touch_updated_at();

-- Auto-crear perfil al registrar un usuario (Supabase Auth)
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student')
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Solo si se usa Supabase Auth:
drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- HELPERS ----------
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path=public as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.current_institution()
returns uuid language sql stable security definer set search_path=public as $$
  select institution_id from public.users where id = auth.uid()
$$;

create or replace function public.has_role(_role user_role)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.users where id = auth.uid() and role = _role)
$$;

-- Validación de cuota antes de insertar estudiante
create or replace function public.enforce_student_quota()
returns trigger language plpgsql as $$
declare
  v_quota integer;
  v_count integer;
begin
  if new.institution_id is null then return new; end if;
  select student_quota into v_quota from public.institutions where id = new.institution_id;
  select count(*) into v_count from public.users
    where institution_id = new.institution_id and role = 'student';
  if v_count >= v_quota then
    raise exception 'Cuota de alumnos excedida para esta institución (% de %)', v_count, v_quota;
  end if;
  return new;
end $$;

drop trigger if exists trg_quota on public.users;
create trigger trg_quota before insert on public.users
  for each row when (new.role = 'student')
  execute function public.enforce_student_quota();

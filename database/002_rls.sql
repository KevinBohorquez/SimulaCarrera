-- =====================================================================
-- Row Level Security — SimulaCarrera
-- =====================================================================

-- Grants base (Supabase / PostgREST)
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.users to authenticated;
grant select, insert, update, delete on public.institutions to authenticated;
grant select, insert, update, delete on public.academic_periods to authenticated;
grant select, insert, update, delete on public.student_profiles to authenticated;
grant select on public.careers to authenticated, anon;
grant select on public.simulations to authenticated;
grant select on public.diagnostic_questions to authenticated;
grant select on public.cognitive_questions to authenticated;
grant select, insert, update on public.test_sessions to authenticated;
grant select, insert on public.reports to authenticated;
grant select, insert, update on public.payments to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Activar RLS
alter table public.users enable row level security;
alter table public.institutions enable row level security;
alter table public.academic_periods enable row level security;
alter table public.student_profiles enable row level security;
alter table public.careers enable row level security;
alter table public.simulations enable row level security;
alter table public.diagnostic_questions enable row level security;
alter table public.cognitive_questions enable row level security;
alter table public.test_sessions enable row level security;
alter table public.reports enable row level security;
alter table public.payments enable row level security;
alter table public.audit_log enable row level security;

-- ---------- USERS ----------
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users for select to authenticated
  using (id = auth.uid() or public.has_role('superadmin')
         or (public.has_role('institutional') and institution_id = public.current_institution())
         or (public.has_role('enterprise') and institution_id in (
             select id from public.institutions where parent_id = public.current_institution()
         )));

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users for update to authenticated
  using (id = auth.uid() or public.has_role('superadmin'));

drop policy if exists users_admin_insert on public.users;
create policy users_admin_insert on public.users for insert to authenticated
  with check (public.has_role('superadmin')
              or (public.has_role('institutional') and institution_id = public.current_institution())
              or (public.has_role('enterprise')));

-- ---------- INSTITUTIONS ----------
drop policy if exists inst_read on public.institutions;
create policy inst_read on public.institutions for select to authenticated
  using (public.has_role('superadmin')
         or id = public.current_institution()
         or parent_id = public.current_institution());

drop policy if exists inst_super_all on public.institutions;
create policy inst_super_all on public.institutions for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

drop policy if exists inst_enterprise_update on public.institutions;
create policy inst_enterprise_update on public.institutions for update to authenticated
  using (public.has_role('enterprise') and parent_id = public.current_institution());

-- ---------- ACADEMIC PERIODS ----------
drop policy if exists periods_read on public.academic_periods;
create policy periods_read on public.academic_periods for select to authenticated
  using (institution_id = public.current_institution() or public.has_role('superadmin'));

drop policy if exists periods_admin on public.academic_periods;
create policy periods_admin on public.academic_periods for all to authenticated
  using (public.has_role('institutional') and institution_id = public.current_institution())
  with check (public.has_role('institutional') and institution_id = public.current_institution());

-- ---------- STUDENT PROFILES ----------
drop policy if exists sp_read on public.student_profiles;
create policy sp_read on public.student_profiles for select to authenticated
  using (user_id = auth.uid()
         or public.has_role('superadmin')
         or (institution_id = public.current_institution()
             and public.current_role() in ('institutional','enterprise')));

drop policy if exists sp_admin on public.student_profiles;
create policy sp_admin on public.student_profiles for all to authenticated
  using (public.has_role('institutional') and institution_id = public.current_institution())
  with check (public.has_role('institutional') and institution_id = public.current_institution());

-- ---------- CAREERS (lectura pública/auth, escritura solo superadmin) ----------
drop policy if exists careers_read on public.careers;
create policy careers_read on public.careers for select to authenticated, anon using (true);
drop policy if exists careers_write on public.careers;
create policy careers_write on public.careers for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

-- ---------- SIMULATIONS / QUESTIONS (lectura auth, escritura superadmin) ----------
drop policy if exists sims_read on public.simulations;
create policy sims_read on public.simulations for select to authenticated using (true);
drop policy if exists sims_write on public.simulations;
create policy sims_write on public.simulations for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

drop policy if exists dq_read on public.diagnostic_questions;
create policy dq_read on public.diagnostic_questions for select to authenticated using (true);
drop policy if exists cq_read on public.cognitive_questions;
create policy cq_read on public.cognitive_questions for select to authenticated using (true);

-- ---------- TEST SESSIONS (cada alumno la suya) ----------
drop policy if exists ts_self on public.test_sessions;
create policy ts_self on public.test_sessions for all to authenticated
  using (student_id = auth.uid() or public.has_role('superadmin')
         or (public.has_role('institutional') and student_id in (
             select id from public.users where institution_id = public.current_institution()
         )))
  with check (student_id = auth.uid());

-- ---------- REPORTS ----------
drop policy if exists rep_read on public.reports;
create policy rep_read on public.reports for select to authenticated
  using (student_id = auth.uid()
         or public.has_role('superadmin')
         or (institution_id = public.current_institution()
             and public.current_role() in ('institutional','enterprise')));

drop policy if exists rep_insert on public.reports;
create policy rep_insert on public.reports for insert to authenticated
  with check (student_id = auth.uid());

-- ---------- PAYMENTS (solo superadmin + lectura admin institucional propia) ----------
drop policy if exists pay_super on public.payments;
create policy pay_super on public.payments for all to authenticated
  using (public.has_role('superadmin')) with check (public.has_role('superadmin'));

drop policy if exists pay_inst_read on public.payments;
create policy pay_inst_read on public.payments for select to authenticated
  using (institution_id = public.current_institution()
         and public.current_role() in ('institutional','enterprise'));

-- ---------- AUDIT (solo superadmin lee, sistema escribe) ----------
drop policy if exists audit_super on public.audit_log;
create policy audit_super on public.audit_log for select to authenticated
  using (public.has_role('superadmin'));

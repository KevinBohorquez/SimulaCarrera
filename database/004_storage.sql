-- =====================================================================
-- Supabase Storage: buckets y policies para SimulaCarrera
-- Ejecutar después de 003_seed.sql.
-- =====================================================================

-- Buckets
insert into storage.buckets (id, name, public)
values ('reports','reports', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('logos','logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('csv-imports','csv-imports', false)
on conflict (id) do nothing;

-- ---------- Policies storage.objects ----------

-- REPORTS: el alumno lee su propio reporte; admin institucional lee los de su institución.
drop policy if exists "reports read own" on storage.objects;
create policy "reports read own"
on storage.objects for select to authenticated
using (
  bucket_id = 'reports' and (
    -- ruta esperada: <user_id>/<file>.pdf
    (storage.foldername(name))[1] = auth.uid()::text
    or public.has_role('superadmin')
    or (public.has_role('institutional') and exists (
        select 1 from public.users u
        where u.id::text = (storage.foldername(name))[1]
          and u.institution_id = public.current_institution()
    ))
  )
);

drop policy if exists "reports insert own" on storage.objects;
create policy "reports insert own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'reports'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- LOGOS: lectura pública, escritura admin de su institución.
drop policy if exists "logos read public" on storage.objects;
create policy "logos read public"
on storage.objects for select to anon, authenticated
using (bucket_id = 'logos');

drop policy if exists "logos write admin" on storage.objects;
create policy "logos write admin"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'logos' and (
    public.has_role('superadmin')
    or (public.has_role('institutional') and (storage.foldername(name))[1] = public.current_institution()::text)
  )
);

-- CSV-IMPORTS: solo admin de la institución y superadmin.
drop policy if exists "csv read admin" on storage.objects;
create policy "csv read admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'csv-imports' and (
    public.has_role('superadmin')
    or (public.has_role('institutional') and (storage.foldername(name))[1] = public.current_institution()::text)
  )
);

drop policy if exists "csv write admin" on storage.objects;
create policy "csv write admin"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'csv-imports' and (
    public.has_role('superadmin')
    or (public.has_role('institutional') and (storage.foldername(name))[1] = public.current_institution()::text)
  )
);

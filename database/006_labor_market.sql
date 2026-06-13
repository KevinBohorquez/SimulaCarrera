-- Mercado laboral Perú: tabla opcional para persistir stats curados (INEI/MTPE)
-- Los datos también viven en backend/src/data/labor-market-pe.ts como fuente principal.

CREATE TABLE IF NOT EXISTS career_labor_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_slug TEXT NOT NULL UNIQUE REFERENCES careers(slug) ON DELETE CASCADE,
  occupation_label TEXT NOT NULL,
  data_year TEXT NOT NULL DEFAULT '2024',
  region TEXT DEFAULT 'Perú (nacional)',
  salary_average_pen NUMERIC(10,2),
  salary_median_pen NUMERIC(10,2),
  salary_p25_pen NUMERIC(10,2),
  salary_p75_pen NUMERIC(10,2),
  employment_rate_pct NUMERIC(5,2),
  unemployment_rate_pct NUMERIC(5,2),
  informal_rate_pct NUMERIC(5,2),
  demand_level TEXT CHECK (demand_level IN ('alta', 'media', 'baja')),
  vacancies_mtpe INTEGER,
  demand_trend TEXT CHECK (demand_trend IN ('creciente', 'estable', 'decreciente')),
  sector TEXT,
  projection_2026 TEXT,
  insights JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_labor_stats_slug ON career_labor_stats(career_slug);

ALTER TABLE career_labor_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_labor_stats_read_authenticated"
  ON career_labor_stats FOR SELECT
  TO authenticated
  USING (true);

-- Seed inicial (subset representativo; el backend tiene el dataset completo)
INSERT INTO career_labor_stats (
  career_slug, occupation_label, data_year, salary_average_pen, salary_median_pen,
  salary_p25_pen, salary_p75_pen, employment_rate_pct, unemployment_rate_pct,
  demand_level, vacancies_mtpe, demand_trend, sector, projection_2026, insights, sources
) VALUES
  ('ing-software', 'Desarrolladores y analistas de software', '2024', 6200, 5500, 3500, 9500, 91, 2.5, 'alta', 4200, 'creciente', 'Tecnología / fintech / consultoría', 'Demanda sostenida en cloud, IA y ciberseguridad', '["Alta demanda en Lima y remoto internacional.", "Portafolio GitHub pesa más que promedio universitario."]'::jsonb, '[{"name":"MTPE — Mi Carrera","url":"https://micarrera.trabajo.gob.pe/"},{"name":"INEI — ENAHO","url":"https://www.inei.gob.pe/"}]'::jsonb),
  ('medicina', 'Médicos generales y especialistas', '2024', 8500, 7200, 4500, 15000, 96, 1.2, 'alta', 2800, 'creciente', 'Salud pública y privada', 'Especialización y telemedicina en alza', '["SERUM obligatorio antes de especializar.", "Alta demanda en provincias."]'::jsonb, '[{"name":"MTPE","url":"https://www.gob.pe/mtpe"},{"name":"INEI","url":"https://www.inei.gob.pe/"}]'::jsonb),
  ('derecho', 'Abogados y asesores legales', '2024', 3800, 3200, 2000, 6000, 78, 5.5, 'media', 1100, 'estable', 'Estudios jurídicos / empresas / sector público', 'Compliance y derecho digital crecen', '["Saturación en litigio tradicional.", "Especialización mejora empleabilidad."]'::jsonb, '[{"name":"MTPE","url":"https://micarrera.trabajo.gob.pe/"}]'::jsonb),
  ('psicologia', 'Psicólogos clínicos y organizacionales', '2024', 3200, 2800, 1800, 4800, 82, 4.2, 'media', 950, 'creciente', 'Salud mental / RRHH / educación', 'Telepsicología y bienestar corporativo', '["Colegiatura y posgrado recomendados.", "Alta demanda en salud mental post-pandemia."]'::jsonb, '[{"name":"MTPE","url":"https://micarrera.trabajo.gob.pe/"}]'::jsonb),
  ('administracion', 'Administradores de empresas', '2024', 3600, 3000, 1900, 5500, 80, 4.8, 'media', 1600, 'estable', 'Comercio / servicios / industria', 'Analítica y gestión de proyectos valoradas', '["Competencia alta en posiciones junior.", "Certificaciones PMI/Excel diferencian."]'::jsonb, '[{"name":"INEI","url":"https://www.inei.gob.pe/"}]'::jsonb)
ON CONFLICT (career_slug) DO UPDATE SET
  salary_average_pen = EXCLUDED.salary_average_pen,
  employment_rate_pct = EXCLUDED.employment_rate_pct,
  demand_level = EXCLUDED.demand_level,
  updated_at = now();

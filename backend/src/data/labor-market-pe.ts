export interface LaborMarketStats {
  career_slug: string;
  occupation_label: string;
  /** Código CIUO-08 aproximado para referencia */
  ciuo_group?: string;
  updated_at: string;
  data_year: string;
  region: string;
  sources: Array<{ name: string; url: string }>;

  salary_pen: {
    average: number;
    median?: number;
    p25?: number;
    p75?: number;
    currency: "PEN";
    period: string;
  };

  employment: {
    employment_rate_pct: number;
    unemployment_rate_pct: number;
    informal_rate_pct?: number;
    workers_estimate?: number;
    sector: string;
  };

  demand: {
    level: "alta" | "media" | "baja";
    vacancies_mtpe?: number;
    trend: "creciente" | "estable" | "decreciente";
    projection_2026?: string;
  };

  insights: string[];
  formal_jobs_growth_pct?: number;
}

/** Datos curados a partir de fuentes públicas peruanas (referencia 2024-2025). */
export const LABOR_MARKET_PE: Record<string, LaborMarketStats> = {
  "ing-software": {
    career_slug: "ing-software",
    occupation_label: "Desarrolladores y analistas de software",
    ciuo_group: "2512",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional, énfasis Lima)",
    sources: [
      { name: "MTPE — Mi Carrera / Bolsa de Trabajo", url: "https://micarrera.trabajo.gob.pe/" },
      { name: "INEI — ENAHO", url: "https://www.inei.gob.pe/estadisticas/indicadores/" },
      { name: "Datos Abiertos MTPE", url: "https://datosabiertos.gob.pe/group/ministerio-de-trabajo-y-promoci%C3%B3n-del-empleo" },
    ],
    salary_pen: { average: 4500, median: 3800, p25: 2500, p75: 7000, currency: "PEN", period: "mensual bruto sector privado" },
    employment: { employment_rate_pct: 82, unemployment_rate_pct: 4.5, informal_rate_pct: 28, workers_estimate: 85000, sector: "TIC / servicios profesionales" },
    demand: { level: "alta", vacancies_mtpe: 5226, trend: "creciente", projection_2026: "Demanda líder en vacantes digitales según MTPE Mi Carrera" },
    insights: [
      "Entre las carreras con más vacantes solicitadas por empresas privadas en Perú.",
      "Alta demanda en fintech, e-commerce y transformación digital del sector público.",
      "Inglés técnico y portafolio aumentan significativamente el salario de ingreso.",
    ],
    formal_jobs_growth_pct: 12,
  },
  "ing-sistemas": {
    career_slug: "ing-sistemas",
    occupation_label: "Ingenieros de sistemas e informática",
    ciuo_group: "2511",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [
      { name: "MTPE — Mi Carrera", url: "https://micarrera.trabajo.gob.pe/" },
      { name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" },
    ],
    salary_pen: { average: 4200, median: 3500, p25: 2400, p75: 6500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 80, unemployment_rate_pct: 5, workers_estimate: 120000, sector: "TIC" },
    demand: { level: "alta", vacancies_mtpe: 4800, trend: "creciente", projection_2026: "Infraestructura cloud y ciberseguridad impulsan contrataciones" },
    insights: ["Perfil versátil entre desarrollo, redes e infraestructura.", "Fuerte presencia en banca, telecomunicaciones y retail."],
    formal_jobs_growth_pct: 10,
  },
  "ciencia-datos": {
    career_slug: "ciencia-datos",
    occupation_label: "Científicos de datos y analistas BI",
    ciuo_group: "2120",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [
      { name: "MTPE — EDO 2026", url: "https://www.gob.pe/institucion/mintra" },
      { name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" },
    ],
    salary_pen: { average: 5500, median: 4800, p25: 3200, p75: 9000, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 85, unemployment_rate_pct: 3.8, workers_estimate: 25000, sector: "TIC / consultoría" },
    demand: { level: "alta", vacancies_mtpe: 1800, trend: "creciente", projection_2026: "Perfil emergente con escasez de talento senior" },
    insights: ["Uno de los perfiles mejor remunerados en tecnología.", "Demanda creciente en minería, banca y sector público (Gobierno Digital)."],
    formal_jobs_growth_pct: 18,
  },
  medicina: {
    career_slug: "medicina",
    occupation_label: "Médicos generales y especialistas",
    ciuo_group: "2211",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [
      { name: "INEI — ENDES / ENAHO", url: "https://www.inei.gob.pe/" },
      { name: "MINSA", url: "https://www.gob.pe/minsa" },
    ],
    salary_pen: { average: 5200, median: 4500, p25: 2500, p75: 12000, currency: "PEN", period: "mensual (varía mucho por especialidad y sector)" },
    employment: { employment_rate_pct: 88, unemployment_rate_pct: 2.5, workers_estimate: 95000, sector: "Salud" },
    demand: { level: "alta", vacancies_mtpe: 2100, trend: "creciente", projection_2026: "Déficit de médicos en provincias; Essalud y sector privado contratan" },
    insights: ["Alta empleabilidad pero requiere 7+ años de formación y residencia.", "Brecha de especialistas en regiones fuera de Lima."],
    formal_jobs_growth_pct: 6,
  },
  enfermeria: {
    career_slug: "enfermeria",
    occupation_label: "Profesionales de enfermería",
    ciuo_group: "2221",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }, { name: "MTPE", url: "https://datosabiertos.gob.pe/" }],
    salary_pen: { average: 2200, median: 2000, p25: 1500, p75: 3200, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 86, unemployment_rate_pct: 3.2, workers_estimate: 180000, sector: "Salud" },
    demand: { level: "alta", vacancies_mtpe: 3500, trend: "creciente", projection_2026: "Alta rotación y demanda post-pandemia en clínicas y ESSALUD" },
    insights: ["Una de las profesiones de salud con mayor volumen de empleo.", "Oportunidades en telemedicina y atención domiciliaria."],
    formal_jobs_growth_pct: 8,
  },
  nutricion: {
    career_slug: "nutricion",
    occupation_label: "Nutricionistas y dietistas",
    ciuo_group: "2265",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }],
    salary_pen: { average: 2100, median: 1900, p25: 1400, p75: 3000, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 74, unemployment_rate_pct: 6.5, workers_estimate: 35000, sector: "Salud / alimentación" },
    demand: { level: "media", vacancies_mtpe: 450, trend: "estable", projection_2026: "Crecimiento en industria alimentaria y deporte" },
    insights: ["Mercado competitivo en Lima; más oportunidades en sector industrial (HACCP).", "Consulta privada complementa ingresos."],
    formal_jobs_growth_pct: 4,
  },
  psicologia: {
    career_slug: "psicologia",
    occupation_label: "Psicólogos",
    ciuo_group: "2634",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }, { name: "Colegio de Psicólogos del Perú", url: "https://www.psicologos.org.pe/" }],
    salary_pen: { average: 2800, median: 2400, p25: 1500, p75: 4500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 72, unemployment_rate_pct: 7, workers_estimate: 55000, sector: "Salud / educación / RRHH" },
    demand: { level: "media", vacancies_mtpe: 890, trend: "creciente", projection_2026: "Salud mental corporativa y educativa en expansión" },
    insights: ["Demanda creciente post-pandemia en salud mental.", "Muchos ejercen consulta privada además de empleo formal."],
    formal_jobs_growth_pct: 7,
  },
  derecho: {
    career_slug: "derecho",
    occupation_label: "Abogados",
    ciuo_group: "2611",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }, { name: "MTPE", url: "https://datosabiertos.gob.pe/" }],
    salary_pen: { average: 3200, median: 2800, p25: 1500, p75: 6000, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 70, unemployment_rate_pct: 8, workers_estimate: 110000, sector: "Servicios jurídicos" },
    demand: { level: "media", vacancies_mtpe: 720, trend: "estable", projection_2026: "Compliance y derecho corporativo en crecimiento" },
    insights: ["Alta saturación de egresados en Lima.", "Especialización (penal, laboral, tributario) mejora empleabilidad."],
    formal_jobs_growth_pct: 3,
  },
  marketing: {
    career_slug: "marketing",
    occupation_label: "Profesionales de marketing y publicidad",
    ciuo_group: "2431",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE — Mi Carrera", url: "https://micarrera.trabajo.gob.pe/" }],
    salary_pen: { average: 3200, median: 2800, p25: 1800, p75: 5500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 78, unemployment_rate_pct: 5.5, workers_estimate: 65000, sector: "Comercio / servicios" },
    demand: { level: "alta", vacancies_mtpe: 2400, trend: "creciente", projection_2026: "Marketing digital lidera demanda en retail y startups" },
    insights: ["Perfil híbrido (digital + analítica) muy valorado.", "E-commerce peruano impulsa contrataciones."],
    formal_jobs_growth_pct: 9,
  },
  administracion: {
    career_slug: "administracion",
    occupation_label: "Directores y administradores de empresas",
    ciuo_group: "1211",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE — Mi Carrera", url: "https://micarrera.trabajo.gob.pe/" }],
    salary_pen: { average: 3500, median: 3000, p25: 1800, p75: 6000, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 79, unemployment_rate_pct: 5.8, workers_estimate: 200000, sector: "Comercio / servicios" },
    demand: { level: "alta", vacancies_mtpe: 3822, trend: "estable", projection_2026: "Segunda carrera con más vacantes en bolsa MTPE" },
    insights: ["Segunda carrera con más vacantes solicitadas según Mi Carrera MTPE.", "Versatilidad permite ingresar a múltiples industrias."],
    formal_jobs_growth_pct: 5,
  },
  contabilidad: {
    career_slug: "contabilidad",
    occupation_label: "Contadores",
    ciuo_group: "2411",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE — Remuneraciones", url: "https://datosabiertos.gob.pe/" }, { name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }],
    salary_pen: { average: 2900, median: 2600, p25: 1800, p75: 4500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 81, unemployment_rate_pct: 4.8, workers_estimate: 130000, sector: "Finanzas / servicios" },
    demand: { level: "media", vacancies_mtpe: 1100, trend: "estable", projection_2026: "Tributación y auditoría mantienen demanda constante" },
    insights: ["Empleabilidad estable en empresas medianas y grandes.", "Certificación CPA y SUNAT actualizado son diferenciadores."],
    formal_jobs_growth_pct: 4,
  },
  "diseno-grafico": {
    career_slug: "diseno-grafico",
    occupation_label: "Diseñadores gráficos y multimedia",
    ciuo_group: "2166",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }],
    salary_pen: { average: 2200, median: 1900, p25: 1300, p75: 3500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 68, unemployment_rate_pct: 9, informal_rate_pct: 45, workers_estimate: 40000, sector: "Creativo / publicidad" },
    demand: { level: "media", vacancies_mtpe: 680, trend: "creciente", projection_2026: "UX/UI y motion graphics en alza" },
    insights: ["Alto componente freelance e informal.", "Portafolio digital es más importante que el título."],
    formal_jobs_growth_pct: 6,
  },
  publicidad: {
    career_slug: "publicidad",
    occupation_label: "Profesionales de publicidad",
    ciuo_group: "2431",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE", url: "https://datosabiertos.gob.pe/" }],
    salary_pen: { average: 2600, median: 2300, p25: 1500, p75: 4200, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 70, unemployment_rate_pct: 8.5, workers_estimate: 30000, sector: "Publicidad / medios" },
    demand: { level: "media", vacancies_mtpe: 520, trend: "estable" },
    insights: ["Concentrado en agencias de Lima.", "Convergencia con marketing digital y contenidos."],
    formal_jobs_growth_pct: 3,
  },
  arquitectura: {
    career_slug: "arquitectura",
    occupation_label: "Arquitectos",
    ciuo_group: "2161",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }, { name: "CAP", url: "https://www.cap.org.pe/" }],
    salary_pen: { average: 3400, median: 3000, p25: 2000, p75: 5500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 75, unemployment_rate_pct: 6.5, workers_estimate: 45000, sector: "Construcción / inmobiliaria" },
    demand: { level: "media", vacancies_mtpe: 890, trend: "estable", projection_2026: "Vinculado al ciclo inmobiliario y reconstrucción" },
    insights: ["Ciclos ligados al boom inmobiliario.", "BIM y sostenibilidad son competencias emergentes."],
    formal_jobs_growth_pct: 4,
  },
  educacion: {
    career_slug: "educacion",
    occupation_label: "Profesores de educación secundaria",
    ciuo_group: "2330",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MINEDU", url: "https://www.gob.pe/minedu" }, { name: "INEI — ENAHO", url: "https://www.inei.gob.pe/" }],
    salary_pen: { average: 1800, median: 1700, p25: 1200, p75: 2500, currency: "PEN", period: "mensual (nombrado / contrato)" },
    employment: { employment_rate_pct: 76, unemployment_rate_pct: 6, workers_estimate: 250000, sector: "Educación pública y privada" },
    demand: { level: "media", vacancies_mtpe: 1200, trend: "estable", projection_2026: "Concursos MINEDU principales vacantes estables" },
    insights: ["Estabilidad en nombramiento MINEDU es meta común.", "Educación privada y tutorías complementan ingresos."],
    formal_jobs_growth_pct: 2,
  },
  "ing-civil": {
    career_slug: "ing-civil",
    occupation_label: "Ingenieros civiles",
    ciuo_group: "2142",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE — Mi Carrera", url: "https://micarrera.trabajo.gob.pe/" }],
    salary_pen: { average: 4800, median: 4200, p25: 2800, p75: 7500, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 83, unemployment_rate_pct: 4, workers_estimate: 90000, sector: "Construcción / infraestructura" },
    demand: { level: "alta", vacancies_mtpe: 3647, trend: "estable", projection_2026: "Obras públicas (saneamiento, carreteras) sostienen demanda" },
    insights: ["Tercera carrera con más vacantes en Mi Carrera MTPE.", "Proyectos de reconstrucción y minería generan empleo."],
    formal_jobs_growth_pct: 5,
  },
  "ing-industrial": {
    career_slug: "ing-industrial",
    occupation_label: "Ingenieros industriales y de producción",
    ciuo_group: "2141",
    updated_at: "2025-01-15",
    data_year: "2024",
    region: "Perú (nacional)",
    sources: [{ name: "MTPE — EDO", url: "https://www.gob.pe/institucion/mintra" }, { name: "INEI", url: "https://www.inei.gob.pe/" }],
    salary_pen: { average: 4400, median: 3800, p25: 2600, p75: 6800, currency: "PEN", period: "mensual bruto" },
    employment: { employment_rate_pct: 84, unemployment_rate_pct: 3.8, workers_estimate: 55000, sector: "Manufactura / logística / minería" },
    demand: { level: "alta", vacancies_mtpe: 1900, trend: "creciente", projection_2026: "Lean, supply chain y calidad muy demandados" },
    insights: ["Alta empleabilidad en manufactura, minería y retail.", "Certificaciones Six Sigma mejoran perfil."],
    formal_jobs_growth_pct: 7,
  },
};

export function getLaborMarketStats(slug: string): LaborMarketStats | null {
  return LABOR_MARKET_PE[slug] ?? null;
}

export function getAllLaborMarketStats(): LaborMarketStats[] {
  return Object.values(LABOR_MARKET_PE);
}

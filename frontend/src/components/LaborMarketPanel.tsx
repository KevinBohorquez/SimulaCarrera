import { TrendingUp, Briefcase, DollarSign, Users, AlertCircle, ExternalLink } from "lucide-react";

export interface LaborMarketStats {
  career_slug: string;
  occupation_label: string;
  data_year: string;
  region?: string;
  sources?: Array<{ name: string; url: string }>;
  salary_pen: {
    average: number;
    median?: number;
    p25?: number;
    p75?: number;
    currency: string;
    period: string;
  };
  employment: {
    employment_rate_pct: number;
    unemployment_rate_pct: number;
    informal_rate_pct?: number;
    workers_estimate?: number;
    sector?: string;
  };
  demand: {
    level: "alta" | "media" | "baja";
    vacancies_mtpe?: number;
    trend: "creciente" | "estable" | "decreciente";
    projection_2026?: string;
  };
  insights?: string[];
  formal_jobs_growth_pct?: number;
}

function fmt(n?: number) {
  if (n == null) return "—";
  return `S/ ${n.toLocaleString("es-PE")}`;
}

const TREND_LABELS: Record<string, string> = {
  creciente: "En crecimiento",
  estable: "Estable",
  decreciente: "En descenso",
};

function demandBadge(level?: string) {
  const map: Record<string, { label: string; cls: string }> = {
    alta: { label: "Demanda alta", cls: "lm-badge lm-badge-high" },
    media: { label: "Demanda media", cls: "lm-badge lm-badge-mid" },
    baja: { label: "Demanda baja", cls: "lm-badge lm-badge-low" },
  };
  const d = map[level ?? ""] ?? { label: "Sin dato", cls: "lm-badge" };
  return <span className={d.cls}>{d.label}</span>;
}

export default function LaborMarketPanel({ data, compact = false }: { data: LaborMarketStats; compact?: boolean }) {
  if (!data) return null;

  const salaryRange = data.salary_pen.p25 && data.salary_pen.p75
    ? { min: data.salary_pen.p25, max: data.salary_pen.p75 }
    : null;

  return (
    <div className={`lm-panel ${compact ? "lm-panel-compact" : ""}`}>
      <div className="lm-header">
        <div>
          <p className="lm-kicker">Realidad laboral en Perú</p>
          <h3 className="lm-title">{data.occupation_label}</h3>
          {data.region && <p className="lm-region">{data.region}</p>}
        </div>
        {demandBadge(data.demand.level)}
      </div>

      <div className="lm-grid">
        <div className="lm-stat">
          <DollarSign size={18} className="lm-icon" />
          <div>
            <p className="lm-stat-label">Salario promedio</p>
            <p className="lm-stat-value">{fmt(data.salary_pen.average)}</p>
            <p className="lm-stat-sub">{data.salary_pen.period}</p>
            {salaryRange && (
              <p className="lm-stat-sub">Rango: {fmt(salaryRange.min)} – {fmt(salaryRange.max)}</p>
            )}
          </div>
        </div>

        <div className="lm-stat">
          <TrendingUp size={18} className="lm-icon" />
          <div>
            <p className="lm-stat-label">Empleabilidad</p>
            <p className="lm-stat-value">{data.employment.employment_rate_pct}%</p>
            {data.formal_jobs_growth_pct != null && (
              <p className="lm-stat-sub">+{data.formal_jobs_growth_pct}% empleos formales</p>
            )}
          </div>
        </div>

        <div className="lm-stat">
          <Users size={18} className="lm-icon" />
          <div>
            <p className="lm-stat-label">Desempleo sector</p>
            <p className="lm-stat-value">{data.employment.unemployment_rate_pct}%</p>
            {data.employment.informal_rate_pct != null && (
              <p className="lm-stat-sub">Informalidad ~{data.employment.informal_rate_pct}%</p>
            )}
          </div>
        </div>

        <div className="lm-stat">
          <Briefcase size={18} className="lm-icon" />
          <div>
            <p className="lm-stat-label">Vacantes MTPE (est.)</p>
            <p className="lm-stat-value">{data.demand.vacancies_mtpe?.toLocaleString("es-PE") ?? "—"}</p>
            <p className="lm-stat-sub">Tendencia: {TREND_LABELS[data.demand.trend] ?? data.demand.trend}</p>
          </div>
        </div>
      </div>

      {data.demand.projection_2026 && (
        <p className="lm-outlook"><strong>Perspectiva 2026:</strong> {data.demand.projection_2026}</p>
      )}

      {data.employment.sector && (
        <div className="lm-sectors">
          <p className="lm-sectors-label">Sectores principales</p>
          <div className="lm-tags">
            {data.employment.sector.split("/").map((s) => (
              <span key={s.trim()} className="lm-tag">{s.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {data.insights && data.insights.length > 0 && (
        <ul className="lm-insights">
          {data.insights.map((ins, i) => (
            <li key={i}><AlertCircle size={14} /> {ins}</li>
          ))}
        </ul>
      )}

      <div className="lm-footer">
        {data.data_year && <span>Datos referencia {data.data_year}</span>}
        {data.sources && data.sources.length > 0 && (
          <span className="lm-sources">
            {data.sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="lm-source-link">
                {s.name} <ExternalLink size={11} />
              </a>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export function LaborMarketReportSection({ items, summary }: { items: LaborMarketStats[]; summary?: string }) {
  if (!items?.length && !summary) return null;
  return (
    <section className="report-section">
      <h2 className="report-section-title flex items-center gap-2">
        <Briefcase size={20} className="text-brand-morado" /> Mercado laboral en Perú
      </h2>
      <p className="report-section-sub">
        Estimaciones basadas en fuentes públicas (INEI, MTPE, Mi Carrera). Úsalas como referencia, no como garantía.
      </p>
      {summary && (
        <div className="lm-summary card mb-4">
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}
      {items.length > 0 && (
        <div className="lm-report-grid">
          {items.map((d) => (
            <LaborMarketPanel key={d.career_slug} data={d} compact />
          ))}
        </div>
      )}
    </section>
  );
}

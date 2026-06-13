import { getLaborMarketStats } from "../data/labor-market-pe.js";

export function attachLaborMarketToReport(report: any, ranking: Array<{ career_slug: string }>) {
  const slugs = [
    report.top_career?.slug,
    ...(report.alternatives ?? []).map((a: any) => a.slug),
    ...ranking.slice(0, 5).map((r) => r.career_slug),
  ].filter(Boolean) as string[];

  const unique = [...new Set(slugs)];
  const labor_market = unique
    .map((slug) => getLaborMarketStats(slug))
    .filter(Boolean);

  const topLabor = report.top_career?.slug ? getLaborMarketStats(report.top_career.slug) : null;
  if (topLabor) {
    report.labor_market_summary = buildLaborSummary(topLabor);
  }

  return { ...report, labor_market };
}

function buildLaborSummary(stats: NonNullable<ReturnType<typeof getLaborMarketStats>>) {
  return `En Perú (${stats.data_year}), ${stats.occupation_label} registra un salario promedio de S/. ${stats.salary_pen.average.toLocaleString()} (${stats.salary_pen.period}), tasa de empleo ~${stats.employment.employment_rate_pct}% y desempleo ~${stats.employment.unemployment_rate_pct}%. Demanda laboral: ${stats.demand.level} (${stats.demand.trend}). ${stats.demand.vacancies_mtpe ? `Vacantes registradas MTPE: ~${stats.demand.vacancies_mtpe.toLocaleString()}.` : ""} Fuentes: ${stats.sources.map((s) => s.name).join(", ")}.`;
}

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { Download, Sparkles, Target, Brain, Play, BookOpen, CheckCircle2, TrendingUp, GitCompare, Lightbulb, GraduationCap } from "lucide-react";
import { LaborMarketReportSection } from "@/components/LaborMarketPanel";
import { useState } from "react";

export function ReportPage() {
  const { id } = useParams();
  const q = useQuery({
    queryKey: ["report", id],
    queryFn: () => api<any>(`/api/reports/${id}`),
    enabled: !!id && id !== "undefined",
  });
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const r = await api<any>(`/api/reports/${id}/pdf`);
      window.open(r.url, "_blank");
    } finally { setDownloading(false); }
  }

  if (!id || id === "undefined") {
    return (
      <AppShell title="Reporte">
        <p className="text-slate-600">Reporte no válido.</p>
        <Link to="/estudiante" className="text-brand-morado text-sm mt-2 inline-block">Volver al panel</Link>
      </AppShell>
    );
  }

  if (q.isLoading) return <AppShell title="Reporte"><p className="text-slate-500">Generando vista...</p></AppShell>;
  const r = q.data?.report?.payload;
  if (!r) return <AppShell title="Reporte"><p>No encontrado.</p></AppShell>;

  const top = r.top_career ?? {};

  return (
    <AppShell title="Tu reporte vocacional">
      <div className="report-hero mb-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">Reporte vocacional integral</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">{top.name ?? "Tu orientación"}</h2>
            {r.generated_with_ai !== false && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs bg-white/20 px-2 py-1 rounded-full text-white">
                <Sparkles size={12} /> Generado con IA
              </span>
            )}
          </div>
          {top.match_score != null && (
            <div className="report-score-ring">
              <span className="report-score-num">{top.match_score}</span>
              <span className="report-score-pct">% compatible</span>
            </div>
          )}
        </div>
        <button onClick={downloadPdf} disabled={downloading} className="mt-6 btn-hero-primary bg-white text-brand-morado hover:bg-purple-50">
          <Download size={16} className="mr-2" /> {downloading ? "Generando PDF..." : "Descargar PDF completo"}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><BookOpen size={18} className="text-brand-morado" /> Resumen ejecutivo</h3>
            <p className="text-slate-700 leading-relaxed">{r.summary}</p>
            {r.personality_profile && (
              <div className="mt-4 p-4 rounded-xl bg-brand-lila/20 border border-brand-morado/10">
                <p className="text-sm font-medium text-brand-morado mb-1">Tu perfil vocacional</p>
                <p className="text-sm text-slate-700">{r.personality_profile}</p>
              </div>
            )}
          </div>

          <div className="card border-brand-morado/20">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><Target size={18} className="text-brand-morado" /> Carrera #1: {top.name}</h3>
            <p className="text-slate-700 mb-4">{top.why}</p>
            {top.day_in_life && (
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Un día en esta carrera</p>
                <p className="text-sm text-slate-700">{top.day_in_life}</p>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {top.strengths?.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                  <p className="text-xs font-semibold text-green-700 mb-2">Fortalezas</p>
                  <ul className="space-y-1">{top.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-green-800 flex gap-1"><CheckCircle2 size={14} className="shrink-0 mt-0.5" />{s}</li>)}</ul>
                </div>
              )}
              {top.challenges?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Desafíos a preparar</p>
                  <ul className="space-y-1">{top.challenges.map((s: string, i: number) => <li key={i} className="text-sm text-amber-800">• {s}</li>)}</ul>
                </div>
              )}
            </div>
            <Link to={`/estudiante/carreras/${top.slug}`} className="inline-flex items-center gap-2 mt-4 btn-primary text-sm">
              <Play size={14} /> Explorar y simular esta carrera
            </Link>
          </div>

          {r.alternatives?.length > 0 && (
            <div className="card">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><GitCompare size={18} className="text-brand-morado" /> Alternativas vocacionales</h3>
              {r.alternatives_insight && <p className="text-sm text-slate-600 mb-4">{r.alternatives_insight}</p>}
              <div className="space-y-3">
                {r.alternatives.map((alt: any) => (
                  <div key={alt.slug} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-medium">{alt.name}</p>
                      {alt.match_score != null && <span className="font-bold text-brand-morado shrink-0">{alt.match_score}%</span>}
                    </div>
                    <p className="text-sm text-slate-600">{alt.why}</p>
                    <Link to={`/estudiante/carreras/${alt.slug}`} className="text-xs text-brand-morado mt-2 inline-block hover:underline">Ver ficha →</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.full_ranking?.length > 0 && (
            <div className="card">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4"><TrendingUp size={18} className="text-brand-morado" /> Ranking completo</h3>
              <div className="space-y-2">
                {r.full_ranking.map((item: any, i: number) => (
                  <div key={item.slug} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-brand-lila/30 border border-brand-morado/20" : "bg-slate-50"}`}>
                    <span className="w-8 h-8 rounded-full bg-brand-morado text-white flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate">{item.reasoning}</p>
                    </div>
                    <span className="font-bold text-brand-morado">{item.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {r.simulation_insights && (
            <div className="card bg-gradient-to-br from-brand-lila/20 to-white">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><Play size={18} className="text-brand-morado" /> Tu simulación profesional</h3>
              <p className="text-slate-700 leading-relaxed mb-3">{r.simulation_insights}</p>
              {r.simulation_highlights?.map((h: string, i: number) => (
                <p key={i} className="text-sm text-brand-morado flex gap-2 mb-1"><CheckCircle2 size={14} className="shrink-0 mt-0.5" />{h}</p>
              ))}
            </div>
          )}

          {(r.labor_market?.length > 0 || r.labor_market_summary) && (
            <LaborMarketReportSection items={r.labor_market ?? []} summary={r.labor_market_summary} />
          )}
        </div>

        <aside className="space-y-6">
          <div className="card">
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><Brain size={18} className="text-brand-morado" /> Capacidades cognitivas</h3>
            <p className="text-sm text-slate-600 mb-4">{r.cognitive_insights}</p>
            {(r.cognitive_scores ?? []).map((c: any) => (
              <div key={c.capacity} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium">{c.capacity}</span>
                  <span className="text-brand-morado font-bold">{c.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-morado to-brand-lavanda rounded-full" style={{ width: `${c.score}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{c.tip}</p>
              </div>
            ))}
          </div>

          {r.academic_fit && (
            <div className="card border-brand-morado/10 bg-brand-lila/10">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><GraduationCap size={18} className="text-brand-morado" /> Compatibilidad académica</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{r.academic_fit}</p>
            </div>
          )}

          {r.decision_factors?.length > 0 && (
            <div className="card">
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-3"><Lightbulb size={18} className="text-brand-morado" /> Factores para decidir</h3>
              <ul className="space-y-2">
                {r.decision_factors.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-brand-morado font-bold shrink-0">{i + 1}.</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {r.career_fichas?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Fichas rápidas</h3>
              {r.career_fichas.map((f: any) => (
                <div key={f.slug} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-slate-500">{[f.salary, f.employability && `${f.employability}/100 emp.`].filter(Boolean).join(" · ")}</p>
                  {f.pros?.[0] && <p className="text-xs text-green-700 mt-1">+ {f.pros[0]}</p>}
                  {f.university_tip && <p className="text-xs text-brand-morado mt-1">{f.university_tip}</p>}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

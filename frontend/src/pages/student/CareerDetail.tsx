import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import LaborMarketPanel from "@/components/LaborMarketPanel";
import { api } from "@/lib/api";

export function CareerDetail() {
  const { slug } = useParams();
  const c = useQuery({ queryKey: ["career", slug], queryFn: () => api<any>(`/api/careers/${slug}`) });
  const career = c.data?.career;
  const laborMarket = c.data?.labor_market;
  const sims = useQuery({
    enabled: !!career?.id,
    queryKey: ["sims", career?.id],
    queryFn: () => api<any>(`/api/simulations/career/${career.id}`),
  });

  if (c.isLoading) return <AppShell title="Carrera"><p>Cargando...</p></AppShell>;
  if (!career) return <AppShell title="Carrera"><p>No encontrada.</p></AppShell>;

  return (
    <AppShell title={career.name}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="text-xs text-brand-morado mb-1">{career.area}</div>
            <p className="text-slate-700">{career.description}</p>
          </div>

          <div className="card">
            <h3 className="text-lg mb-3">Universidades</h3>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {(career.universities ?? []).map((u: any, i: number) => (
                <li key={i} className="p-3 rounded-lg bg-slate-50">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.city}</div>
                </li>
              ))}
            </ul>
          </div>

          {laborMarket && (
            <LaborMarketPanel data={laborMarket} />
          )}

          {sims.data?.simulations?.length > 0 && (
            <div className="card overflow-hidden p-0">
              <div className="p-6 pb-0">
                <h3 className="text-lg mb-1">Simulación inmersiva</h3>
                <p className="text-sm text-slate-500 mb-4">Vive un día real en esta carrera con escenarios, imágenes y feedback de IA.</p>
              </div>
              {sims.data.simulations.map((s: any) => (
                <div key={s.id} className="relative">
                  {s.blocks?.[0]?.image_url && (
                    <img src={s.blocks[0].image_url} alt="" className="w-full h-40 object-cover" />
                  )}
                  <div className="p-6 pt-4">
                    <div className="font-semibold text-lg">{s.title}</div>
                    <p className="text-sm text-slate-600 mt-1">{s.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-slate-500">{s.blocks?.length ?? 0} escenarios · ~{(s.blocks?.length ?? 3) * 3} min</span>
                      <Link to={`/estudiante/simulacion/${career.id}?sim=${s.id}`} className="btn-primary">Comenzar</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card">
            <h4 className="text-sm text-slate-500 mb-3">Indicadores</h4>
            <Stat label="Salario promedio" value={career.avg_salary_pen ? `S/. ${Number(career.avg_salary_pen).toLocaleString()}` : "—"} />
            <Stat label="Empleabilidad" value={career.employability_score ? `${career.employability_score}/100` : "—"} />
            <Stat label="Demanda" value={career.demand_projection ?? "—"} />
            <Stat label="Costo estimado" value={career.estimated_cost_pen ? `S/. ${Number(career.estimated_cost_pen).toLocaleString()}` : "—"} />
            <Stat label="Duración" value={career.duration_years ? `${career.duration_years} años` : "—"} />
          </div>
          {career.related_careers?.length > 0 && (
            <div className="card">
              <h4 className="text-sm text-slate-500 mb-2">Carreras relacionadas</h4>
              <div className="flex flex-wrap gap-2">
                {career.related_careers.map((s: string) => (
                  <Link key={s} to={`/estudiante/carreras/${s}`} className="text-xs px-2 py-1 rounded bg-brand-lila/40 text-brand-morado capitalize">{s.replaceAll("-", " ")}</Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

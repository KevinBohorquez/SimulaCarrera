import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function CareersBrowser() {
  const q = useQuery({ queryKey: ["careers"], queryFn: () => api<any>("/api/careers") });
  return (
    <AppShell title="Explorar carreras">
      <p className="text-slate-600 mb-6">Fichas de realidad profesional: salarios, empleabilidad, universidades.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {q.data?.careers?.map((c: any) => (
          <Link key={c.slug} to={`/estudiante/carreras/${c.slug}`} className="card hover:border-brand-morado/40 transition">
            <div className="text-xs text-brand-morado mb-1">{c.area}</div>
            <h3 className="text-lg mb-2">{c.name}</h3>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{c.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {c.avg_salary_pen && <span className="px-2 py-0.5 rounded bg-brand-lila/40 text-brand-morado">S/. {Number(c.avg_salary_pen).toLocaleString()}</span>}
              {c.employability_score && <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">Empleab. {c.employability_score}</span>}
              {c.demand_projection && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">Demanda {c.demand_projection}</span>}
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BookOpen, PlayCircle, FileText } from "lucide-react";

export function StudentDashboard() {
  const reports = useQuery({ queryKey: ["my-reports"], queryFn: () => api<any>("/api/reports") });
  const last = reports.data?.reports?.[0];

  return (
    <AppShell title="Tu camino vocacional">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link to="/estudiante/test" className="card hover:border-brand-morado/40">
          <PlayCircle className="text-brand-morado mb-2" />
          <h3 className="text-lg">Hacer el test</h3>
          <p className="text-sm text-slate-600">Empieza o continúa tu test vocacional con IA.</p>
        </Link>
        <Link to="/estudiante/carreras" className="card hover:border-brand-morado/40">
          <BookOpen className="text-brand-morado mb-2" />
          <h3 className="text-lg">Explorar carreras</h3>
          <p className="text-sm text-slate-600">Fichas de realidad profesional y simulaciones.</p>
        </Link>
        {last && (
          <Link to={`/estudiante/reporte/${last.id}`} className="card hover:border-brand-morado/40">
            <FileText className="text-brand-morado mb-2" />
            <h3 className="text-lg">Mi último reporte</h3>
            <p className="text-sm text-slate-600">{new Date(last.created_at).toLocaleDateString()}</p>
          </Link>
        )}
      </div>

      {reports.data?.reports?.length > 1 && (
        <div className="card">
          <h2 className="text-lg mb-3">Historial</h2>
          <ul className="divide-y divide-slate-100">
            {reports.data.reports.map((r: any) => (
              <li key={r.id} className="py-2 flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-medium">{r.payload?.top_career?.name ?? "Reporte"}</div>
                  <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <Link to={`/estudiante/reporte/${r.id}`} className="text-sm text-brand-morado">Ver</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}

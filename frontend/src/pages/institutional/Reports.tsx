import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";

export function ReportsList() {
  const { sedeId } = useParams();
  const qStr = sedeId ? `?inst_id=${sedeId}` : "";
  const q = useQuery({ queryKey: ["inst-reports", sedeId], queryFn: () => api<any>(`/api/reports${qStr}`) });
  const reports = q.data?.reports ?? [];

  return (
    <AppShell title={sedeId ? "Reportes de sede" : "Reportes de alumnos"}>
      {sedeId && (
        <div className="mb-5">
          <Link to={`/enterprise/sede/${sedeId}`} className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a la sede
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-morado mb-3">
          <FileText size={13} />
          Reporteria vocacional
        </div>
        <h2 className="text-2xl font-bold text-slate-950">Resultados generados</h2>
        <p className="text-sm text-slate-500 mt-1">
          Consulta los reportes de orientacion vocacional emitidos para los alumnos de esta sede.
        </p>
      </section>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b bg-slate-50/70">
            <tr>
              <th className="px-5 py-3">Alumno</th>
              <th className="px-5 py-3">Carrera top</th>
              <th className="px-5 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r: any) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-purple-50/30">
                <td className="px-5 py-4 font-medium text-slate-900">{r.users?.full_name ?? r.users?.email}</td>
                <td className="px-5 py-4 capitalize">{r.payload?.top_career?.name ?? "-"}</td>
                <td className="px-5 py-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
            <Loader2 size={18} className="animate-spin" /> Cargando reportes...
          </div>
        )}
        {!q.isLoading && reports.length === 0 && <p className="text-center text-slate-500 py-10">Sin reportes aun.</p>}
      </div>
    </AppShell>
  );
}

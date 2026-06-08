import { useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function ReportsList() {
  const { sedeId } = useParams();
  const qStr = sedeId ? `?inst_id=${sedeId}` : "";
  const q = useQuery({ queryKey: ["inst-reports", sedeId], queryFn: () => api<any>(`/api/reports${qStr}`) });
  return (
    <AppShell title={sedeId ? "Reportes de Sede" : "Reportes de alumnos"}>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr><th className="pb-2">Alumno</th><th>Carrera top</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            {q.data?.reports?.map((r: any) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3">{r.users?.full_name ?? r.users?.email}</td>
                <td className="capitalize">{r.payload?.top_career?.name ?? "-"}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.reports?.length === 0 && <p className="text-center text-slate-500 py-6">Sin reportes aún.</p>}
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, FileText, Calendar, ArrowLeft } from "lucide-react";

export function SedeDashboard() {
  const { sedeId } = useParams();
  
  // To get the Sede name, we can fetch all enterprise institutions and find this one.
  const instQuery = useQuery({ queryKey: ["enterprise-inst"], queryFn: () => api<any>("/api/institutions") });
  const sede = instQuery.data?.institutions?.find((i: any) => i.id === sedeId);

  const students = useQuery({ queryKey: ["students", sedeId], queryFn: () => api<any>(`/api/students?inst_id=${sedeId}`) });
  const reports = useQuery({ queryKey: ["inst-reports", sedeId], queryFn: () => api<any>(`/api/reports?inst_id=${sedeId}`) });
  const periods = useQuery({ queryKey: ["periods", sedeId], queryFn: () => api<any>(`/api/periods?inst_id=${sedeId}`) });

  const used = students.data?.students?.length ?? 0;
  const quota = sede?.student_quota ?? 0;

  return (
    <AppShell title={`Gestión de Sede — ${sede?.name ?? "..."}`}>
      <div className="mb-6">
        <Link to="/enterprise" className="text-brand-morado text-sm font-medium flex items-center hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Volver al panel de red
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Link to={`/enterprise/sede/${sedeId}/alumnos`} className="card hover:border-brand-morado/40">
          <Users className="text-brand-morado mb-2" />
          <h3 className="text-lg">Alumnos</h3>
          <p className="text-2xl font-bold">{used} <span className="text-sm text-slate-500 font-normal">/ {quota}</span></p>
        </Link>
        <Link to={`/enterprise/sede/${sedeId}/reportes`} className="card hover:border-brand-morado/40">
          <FileText className="text-brand-morado mb-2" />
          <h3 className="text-lg">Reportes</h3>
          <p className="text-2xl font-bold">{reports.data?.reports?.length ?? 0}</p>
        </Link>
        <Link to={`/enterprise/sede/${sedeId}/periodos`} className="card hover:border-brand-morado/40">
          <Calendar className="text-brand-morado mb-2" />
          <h3 className="text-lg">Ciclos</h3>
          <p className="text-2xl font-bold">{periods.data?.periods?.length ?? 0}</p>
        </Link>
      </div>
    </AppShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, FileText, Calendar } from "lucide-react";

export function InstitutionalDashboard() {
  const inst = useQuery({ queryKey: ["my-inst"], queryFn: () => api<any>("/api/institutions") });
  const students = useQuery({ queryKey: ["students"], queryFn: () => api<any>("/api/students") });
  const reports = useQuery({ queryKey: ["inst-reports"], queryFn: () => api<any>("/api/reports") });
  const periods = useQuery({ queryKey: ["periods"], queryFn: () => api<any>("/api/periods") });

  const me = inst.data?.institutions?.[0];
  const used = students.data?.students?.length ?? 0;
  const quota = me?.student_quota ?? 0;

  const expDays = me?.license_end
    ? Math.ceil((new Date(me.license_end).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <AppShell title={`Hola — ${me?.name ?? ""}`}>
      {expDays !== null && expDays <= 30 && (
        <div className="card mb-6 border-amber-300 bg-amber-50">
          <p className="text-sm text-amber-800">
            ⚠️ Tu licencia vence en <b>{expDays} días</b> ({me?.license_end}). Contacta a tu proveedor para renovarla.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Link to="/institucion/alumnos" className="card hover:border-brand-morado/40">
          <Users className="text-brand-morado mb-2" />
          <h3 className="text-lg">Alumnos</h3>
          <p className="text-2xl font-bold">{used} <span className="text-sm text-slate-500 font-normal">/ {quota}</span></p>
        </Link>
        <Link to="/institucion/reportes" className="card hover:border-brand-morado/40">
          <FileText className="text-brand-morado mb-2" />
          <h3 className="text-lg">Reportes</h3>
          <p className="text-2xl font-bold">{reports.data?.reports?.length ?? 0}</p>
        </Link>
        <Link to="/institucion/periodos" className="card hover:border-brand-morado/40">
          <Calendar className="text-brand-morado mb-2" />
          <h3 className="text-lg">Ciclos</h3>
          <p className="text-2xl font-bold">{periods.data?.periods?.length ?? 0}</p>
        </Link>
      </div>
    </AppShell>
  );
}

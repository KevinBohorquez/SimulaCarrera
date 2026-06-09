import { AppShell } from "@/components/AppShell";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  FileText,
  MapPin,
  Users,
} from "lucide-react";

export function SedeDashboard() {
  const { sedeId } = useParams();

  const instQuery = useQuery({ queryKey: ["enterprise-inst"], queryFn: () => api<any>("/api/institutions") });
  const sede = instQuery.data?.institutions?.find((i: any) => i.id === sedeId);

  const students = useQuery({ queryKey: ["students", sedeId], queryFn: () => api<any>(`/api/students?inst_id=${sedeId}`) });
  const reports = useQuery({ queryKey: ["inst-reports", sedeId], queryFn: () => api<any>(`/api/reports?inst_id=${sedeId}`) });
  const periods = useQuery({ queryKey: ["periods", sedeId], queryFn: () => api<any>(`/api/periods?inst_id=${sedeId}`) });

  const used = students.data?.students?.length ?? 0;
  const quota = sede?.student_quota ?? 0;
  const usage = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

  const modules = [
    {
      to: `/enterprise/sede/${sedeId}/alumnos`,
      icon: Users,
      label: "Alumnos",
      value: `${used} / ${quota || 0}`,
      detail: "Matriculas, CSV y cuentas de acceso",
    },
    {
      to: `/enterprise/sede/${sedeId}/reportes`,
      icon: FileText,
      label: "Reportes",
      value: reports.data?.reports?.length ?? 0,
      detail: "Resultados vocacionales generados",
    },
    {
      to: `/enterprise/sede/${sedeId}/periodos`,
      icon: Calendar,
      label: "Ciclos",
      value: periods.data?.periods?.length ?? 0,
      detail: "Periodos academicos activos",
    },
  ];

  return (
    <AppShell title="Gestion de sede">
      <div className="mb-6">
        <Link to="/enterprise" className="btn-outline inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al panel
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-6 md:p-8 shadow-sm mb-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-morado via-purple-400 to-brand-celeste" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-morado mb-4">
              <Building2 size={13} />
              Sede institucional
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-950 leading-tight">
              {sede?.name ?? "Cargando sede..."}
            </h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
              {sede?.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {sede.city}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <BarChart3 size={14} /> {usage}% del cupo usado
              </span>
            </div>
          </div>

          <div className="min-w-[220px] rounded-xl border border-slate-100 bg-purple-50/50 p-4">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Cupo de alumnos</span>
              <span className="font-semibold text-slate-700">{used} / {quota}</span>
            </div>
            <div className="h-2 rounded-full bg-white overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-morado to-brand-celeste" style={{ width: `${usage}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-4">
        {modules.map(({ to, icon: Icon, label, value, detail }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/60"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center transition-all duration-300 group-hover:bg-brand-morado group-hover:text-white">
                <Icon size={20} />
              </div>
              <ArrowUpRight size={17} className="text-slate-300 transition-colors group-hover:text-brand-morado" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">{label}</h3>
            <p className="text-3xl font-bold text-slate-950 mt-2">{value}</p>
            <p className="text-sm text-slate-500 mt-2">{detail}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

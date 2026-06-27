import { AppShell } from "@/components/AppShell";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  AlertCircle, ArrowLeft, ArrowUpRight, BarChart3,
  Building2, Calendar, FileText, Loader2, MapPin, Users,
} from "lucide-react";

export function SedeDashboard() {
  const { sedeId } = useParams();

  const instQuery = useQuery({ queryKey: ["enterprise-inst"], queryFn: () => api<any>("/api/institutions") });
  const sede      = instQuery.data?.institutions?.find((i: any) => i.id === sedeId);

  const studentsQ = useQuery({ queryKey: ["students",     sedeId], queryFn: () => api<any>(`/api/students?inst_id=${sedeId}`),  enabled: !!sedeId });
  const reportsQ  = useQuery({ queryKey: ["inst-reports", sedeId], queryFn: () => api<any>(`/api/reports?inst_id=${sedeId}`),   enabled: !!sedeId });
  const periodsQ  = useQuery({ queryKey: ["periods",      sedeId], queryFn: () => api<any>(`/api/periods?inst_id=${sedeId}`),   enabled: !!sedeId });

  const used   = studentsQ.data?.students?.length ?? 0;
  const quota  = sede?.student_quota ?? 0;
  const pct    = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const isFull = quota > 0 && used >= quota;
  const isWarn = pct >= 80 && !isFull;

  const modules = [
    {
      to:     `/enterprise/sede/${sedeId}/alumnos`,
      icon:   Users,
      label:  "Alumnos",
      value:  `${used} / ${quota}`,
      detail: "Matrículas, CSV y cuentas de acceso",
    },
    {
      to:     `/enterprise/sede/${sedeId}/reportes`,
      icon:   FileText,
      label:  "Reportes",
      value:  reportsQ.data?.reports?.length ?? 0,
      detail: "Resultados vocacionales generados",
    },
    {
      to:     `/enterprise/sede/${sedeId}/periodos`,
      icon:   Calendar,
      label:  "Ciclos",
      value:  periodsQ.data?.periods?.length ?? 0,
      detail: "Períodos académicos activos",
    },
  ];

  return (
    <AppShell title={sede?.name ?? "Gestión de sede"}>

      <div className="mb-6">
        <Link to="/enterprise" className="btn-outline inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> Volver al panel
        </Link>
      </div>

      {/* Loading */}
      {instQuery.isLoading && (
        <div className="card flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-brand-morado" />
          <span className="text-slate-500 text-sm">Cargando sede…</span>
        </div>
      )}

      {/* Error */}
      {instQuery.isError && (
        <div className="card border-red-200 bg-red-50 flex items-start gap-3 mb-6">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">No se pudo cargar la sede. Intenta de nuevo.</p>
        </div>
      )}

      {!instQuery.isLoading && !instQuery.isError && (
        <>
          {/* Info de la sede */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-lila flex items-center justify-center shrink-0">
                  <Building2 size={20} className="text-brand-morado" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">{sede?.name ?? "Sede"}</h2>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-0.5">
                    {sede?.city && (
                      <span className="flex items-center gap-1"><MapPin size={11} /> {sede.city}</span>
                    )}
                    <span className={`flex items-center gap-1 ${isFull ? "text-red-500" : isWarn ? "text-amber-500" : ""}`}>
                      <BarChart3 size={11} /> {pct}% del cupo usado
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de cupo */}
              <div className="sm:w-52 shrink-0">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Cupo de alumnos</span>
                  <span className="font-medium text-slate-700">{used} / {quota}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? "bg-red-400" : isWarn ? "bg-amber-400" : "bg-brand-morado"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isFull && (
                  <p className="text-[11px] text-red-500 mt-1">Cupo completo</p>
                )}
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div className="grid md:grid-cols-3 gap-4">
            {modules.map(({ to, icon: Icon, label, value, detail }) => (
              <Link
                key={to}
                to={to}
                className="card hover:border-brand-morado/40"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-lila flex items-center justify-center">
                    <Icon size={18} className="text-brand-morado" />
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{label}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                <p className="text-sm text-slate-500 mt-2">{detail}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

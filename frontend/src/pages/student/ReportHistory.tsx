import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";

export function ReportHistory() {
  const reports = useQuery({ queryKey: ["my-reports"], queryFn: () => api<any>("/api/reports") });
  const list = (reports.data?.reports ?? []).filter((r: any) => r?.id);

  return (
    <AppShell title="Historial de reportes">
      <Link
        to="/estudiante"
        className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado"
      >
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      {reports.isLoading && <p className="text-slate-500">Cargando reportes...</p>}

      {!reports.isLoading && list.length === 0 && (
        <div className="card text-center py-14 max-w-lg mx-auto">
          <FileText className="mx-auto text-brand-morado mb-3" size={32} />
          <p className="text-slate-600 mb-4">Aún no tienes reportes generados.</p>
          <Link to="/estudiante" className="text-brand-morado text-sm font-medium hover:underline">
            Ir a mis evaluaciones
          </Link>
        </div>
      )}

      {list.length > 0 && (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {list.map((r: any) => {
            const top = r.payload?.top_career;
            const date = new Date(r.created_at).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <Link
                key={r.id}
                to={`/estudiante/reporte/${r.id}`}
                className="card hover:border-brand-morado/40 flex items-center gap-4 group"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-lila flex items-center justify-center">
                  <FileText className="text-brand-morado" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-lg truncate group-hover:text-brand-morado">
                    {top?.name ?? "Reporte vocacional"}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">{date}</div>
                  {top?.match_score != null && (
                    <div className="text-sm text-brand-morado mt-1">
                      Compatibilidad principal: {top.match_score}%
                    </div>
                  )}
                </div>
                <ChevronRight className="shrink-0 text-slate-400 group-hover:text-brand-morado" size={20} />
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

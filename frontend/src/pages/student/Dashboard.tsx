import { AppShell } from "@/components/AppShell";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TestSessionItem } from "@/lib/test-types";
import { BookOpen, ChevronRight, FlaskConical, History, PlusCircle, Sparkles } from "lucide-react";
import { useState } from "react";

export function StudentDashboard() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [devBusy, setDevBusy] = useState(false);
  const [devErr, setDevErr] = useState<string | null>(null);

  const reports = useQuery({ queryKey: ["my-reports"], queryFn: () => api<any>("/api/reports") });
  const status = useQuery({ queryKey: ["test-status"], queryFn: () => api<any>("/api/test/status") });
  const sessions = useQuery({
    queryKey: ["test-sessions"],
    queryFn: () => api<{ sessions: TestSessionItem[]; price_pen: number }>("/api/test/sessions"),
  });

  const reportList = (reports.data?.reports ?? []).filter((r: any) => r?.id);
  const list = sessions.data?.sessions ?? [];
  const active = list.filter((s) => s.status === "in_progress");

  async function devSeedComplete() {
    setDevBusy(true);
    setDevErr(null);
    try {
      const res = await api<any>("/api/test/dev/seed-complete", { method: "POST", body: JSON.stringify({}) });
      await qc.invalidateQueries({ queryKey: ["test-sessions"] });
      await qc.invalidateQueries({ queryKey: ["my-reports"] });
      if (res.report?.id) {
        nav(`/estudiante/reporte/${res.report.id}`);
      } else if (res.session_id) {
        nav(`/estudiante/test/${res.session_id}`);
      }
    } catch (e: any) {
      setDevErr(e.message);
    } finally {
      setDevBusy(false);
    }
  }

  return (
    <AppShell title="Tu camino vocacional">
      <div className="card bg-gradient-to-r from-brand-morado to-brand-lavanda text-white mb-8 p-8">
        <div className="flex items-start gap-3">
          <Sparkles size={24} className="shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-bold mb-2">Evaluaciones vocacionales</h2>
            <p className="text-white/85 text-sm mb-4 max-w-xl">
              Cada test es un crédito en tu perfil: RIASEC → Holland → SJT → CAT → reporte. Puedes tener varios activos a la vez.
            </p>
            {status.data && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                IA: {status.data.ai_enabled
                  ? `activa · ${status.data.provider} · ${status.data.model}`
                  : "sin IA — añade GROQ_API_KEY (gratis)"}
              </span>
            )}
          </div>
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="card mb-6 border-dashed border-amber-300 bg-amber-50/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium flex items-center gap-2 text-amber-900">
                <FlaskConical size={18} /> Modo desarrollo
              </p>
              <p className="text-sm text-amber-800/80">Crea un test, rellena las 4 etapas y genera el reporte automáticamente.</p>
            </div>
            <button disabled={devBusy} onClick={devSeedComplete} className="btn-outline text-sm py-2 px-4 border-amber-400">
              {devBusy ? "Generando..." : "Probar flujo completo"}
            </button>
          </div>
          {devErr && <p className="text-sm text-red-600 mt-2">{devErr}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Mis evaluaciones</h2>
        <Link to="/estudiante/comprar-test" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4">
          <PlusCircle size={18} />
          Comprar más tests
        </Link>
      </div>

      {sessions.isLoading && <p className="text-slate-500 text-sm mb-8">Cargando tus tests...</p>}

      {!sessions.isLoading && list.length === 0 && (
        <div className="card mb-8 text-center py-10">
          <p className="text-slate-600 mb-4">Aún no tienes evaluaciones en tu perfil.</p>
          <Link to="/estudiante/comprar-test" className="btn-primary inline-flex items-center gap-2">
            <PlusCircle size={18} />
            Comprar tu primer test
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">En progreso</h3>
          <ul className="divide-y divide-slate-100">
            {active.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link to="/estudiante/carreras" className="card hover:border-brand-morado/40">
          <BookOpen className="text-brand-morado mb-2" />
          <h3 className="text-lg">Explorar carreras</h3>
          <p className="text-sm text-slate-600">Fichas de realidad profesional y simulaciones.</p>
        </Link>
        <Link to="/estudiante/reportes" className="card hover:border-brand-morado/40">
          <History className="text-brand-morado mb-2" />
          <h3 className="text-lg">Historial de reportes</h3>
          <p className="text-sm text-slate-600">
            {reportList.length > 0
              ? `${reportList.length} reporte${reportList.length === 1 ? "" : "s"} disponible${reportList.length === 1 ? "" : "s"}`
              : "Tus reportes certificados aparecerán aquí"}
          </p>
        </Link>
      </div>
    </AppShell>
  );
}

function SessionRow({ session }: { session: TestSessionItem }) {
  const date = new Date(session.started_at).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const href =
    session.status === "completed" && session.report_id
      ? `/estudiante/reporte/${session.report_id}`
      : `/estudiante/test/${session.id}`;

  return (
    <li className="py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="font-medium truncate">{session.label}</div>
        <div className="text-xs text-slate-500 mt-0.5">
          Comprado el {date}
          {session.holland_code && ` · Holland ${session.holland_code}`}
        </div>
        <div className="text-sm text-brand-morado mt-1">{session.stage_label}</div>
      </div>
      <Link
        to={href}
        className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-brand-morado hover:underline"
      >
        {session.status === "completed" && session.report_id ? "Ver reporte" : session.status === "completed" ? "Ver test" : "Continuar"}
        <ChevronRight size={16} />
      </Link>
    </li>
  );
}

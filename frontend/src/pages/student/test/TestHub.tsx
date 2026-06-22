import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { TestProgress } from "@/lib/test-types";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const ICONS = [Brain, Target, Zap, Sparkles];

export function TestHub() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const nav = useNavigate();
  const [progress, setProgress] = useState<TestProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const base = `/estudiante/test/${sessionId}`;

  useEffect(() => {
    if (!sessionId) return;
    loadProgress();
  }, [sessionId]);

  async function loadProgress() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const data = await api<TestProgress>(`/api/test/${sessionId}/progress`);
      if (!data.session_id) {
        setErr("Evaluación no encontrada.");
        return;
      }
      setProgress(data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  function playPhase(num: number) {
    if (num === 1) {
      const p1 = progress?.phases[0];
      const configured = !!progress?.riasec_length;
      if (p1?.status === "in_progress" || p1?.status === "complete" || configured) {
        nav(`${base}/etapa/1`);
      } else {
        nav(`${base}/etapa/1?setup=1`);
      }
      return;
    }
    nav(`${base}/etapa/${num}`);
  }

  async function generateReport() {
    if (!sessionId || !progress?.can_finalize) return;
    setFinalizing(true);
    try {
      const result = await api<any>(`/api/test/${sessionId}/finalize`, { method: "POST" });
      const reportId = result.report?.id;
      if (!reportId) throw new Error("No se pudo obtener el ID del reporte");
      nav(`/estudiante/reporte/${reportId}`);
    } catch (e: any) {
      setErr(e.message);
      setFinalizing(false);
    }
  }

  if (!sessionId) {
    return (
      <AppShell title="Evaluación vocacional">
        <p className="text-slate-500">Selecciona una evaluación desde tu panel.</p>
        <Link to="/estudiante" className="text-brand-morado text-sm mt-2 inline-block">Ir al panel</Link>
      </AppShell>
    );
  }

  return (
    <AppShell title="Tu evaluación vocacional">
      <Link to="/estudiante" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mapa de etapas</h1>
        <p className="text-slate-600 text-sm">
          Completa las 4 fases a tu ritmo. Tu progreso queda guardado en este test — puedes retomarlo otro día.
        </p>
        {progress?.holland_code && (
          <p className="mt-3 text-sm text-brand-morado font-medium">
            Código Holland actual: {progress.holland_code}
          </p>
        )}
      </div>

      {err && <div className="card mb-4 text-red-600 text-sm max-w-3xl mx-auto">{err}</div>}
      {loading && <p className="text-center text-slate-500">Cargando tu intento...</p>}

      {!loading && progress && (
        <div className="test-phase-grid max-w-4xl mx-auto">
          {progress.phases.map((phase, i) => {
            const Icon = ICONS[i] ?? Brain;
            const isLocked = !phase.unlocked;
            const isComplete = phase.status === "complete";
            const isProgress = phase.status === "in_progress";

            return (
              <div
                key={phase.num}
                className={`test-phase-bubble ${isLocked ? "locked" : ""} ${isComplete ? "complete" : ""} ${isProgress ? "in-progress" : ""}`}
              >
                <div className="test-phase-bubble-inner">
                  <div className="test-phase-num">{phase.num}</div>
                  <div className="test-phase-icon">
                    {isLocked ? <Lock size={22} /> : isComplete ? <CheckCircle2 size={26} /> : <Icon size={26} />}
                  </div>
                  <h3 className="test-phase-title">{phase.title}</h3>
                  <p className="test-phase-sub">{phase.subtitle}</p>

                  {isProgress && phase.progress_pct != null && (
                    <div className="test-phase-mini-bar">
                      <div style={{ width: `${phase.progress_pct}%` }} />
                    </div>
                  )}

                  {isLocked ? (
                    <span className="test-phase-status text-slate-400">Bloqueada</span>
                  ) : isComplete ? (
                    <button type="button" onClick={() => playPhase(phase.num)} className="test-phase-replay">
                      <Play size={14} /> Revisar
                    </button>
                  ) : (
                    <button type="button" onClick={() => playPhase(phase.num)} className="test-phase-play">
                      <Play size={18} fill="currentColor" />
                      {isProgress ? "Continuar" : "Iniciar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {progress?.report_ready && progress.report_id && (
        <div className="max-w-lg mx-auto mt-10 card text-center border-green-200 bg-green-50/50">
          <h3 className="font-semibold text-lg mb-2">Evaluación completada</h3>
          <p className="text-sm text-slate-600 mb-4">Tu reporte ya está disponible.</p>
          <Link to={`/estudiante/reporte/${progress.report_id}`} className="btn-primary px-8 py-3 inline-block">
            Ver reporte
          </Link>
        </div>
      )}

      {progress?.can_finalize && !progress.report_ready && (
        <div className="max-w-lg mx-auto mt-10 card text-center border-brand-morado/30 bg-brand-lila/20">
          <h3 className="font-semibold text-lg mb-2">¡Completaste las 4 etapas!</h3>
          <p className="text-sm text-slate-600 mb-4">Genera tu reporte certificado con todos tus resultados.</p>
          <button disabled={finalizing} onClick={generateReport} className="btn-primary px-8 py-3">
            {finalizing ? "Generando reporte..." : "Generar reporte final"}
          </button>
        </div>
      )}
    </AppShell>
  );
}

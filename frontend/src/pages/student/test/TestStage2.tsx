import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { RIASEC_DESCRIPTIONS, RIASEC_LABELS, sortRiasecScores } from "@/lib/riasec";
import { ArrowLeft, Brain } from "lucide-react";

export function TestStage2() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const hubPath = `/estudiante/test/${sessionId}`;

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const profile = await api<any>(`/api/test/${sessionId}/profile`);
        setData(profile);
      } catch (e: any) {
        setErr(e.message);
        if (e.message?.includes("404") || e.message?.includes("riasec")) {
          nav(hubPath);
        }
      }
    })();
  }, [sessionId, nav, hubPath]);

  async function unlockNextStage() {
    if (!sessionId) return;
    setBusy(true);
    try {
      await api(`/api/test/${sessionId}/advance`, { method: "POST", body: JSON.stringify({ stage: 3 }) });
      nav(hubPath);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!sessionId) return <AppShell title="Etapa 2"><p className="text-slate-500">Sesión no válida.</p></AppShell>;

  if (!data && !err) return <AppShell title="Etapa 2"><p className="text-slate-500">Cargando perfil...</p></AppShell>;

  const scoreEntries = sortRiasecScores(data?.riasec_scores ?? {});

  return (
    <AppShell title="Etapa 2 · Perfil Holland">
      <Link to={hubPath} className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Mapa de etapas
      </Link>

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-brand-morado mb-2">
            <Brain size={20} />
            <span className="font-semibold text-xl">Código Holland: {data.holland_code}</span>
          </div>
          <p className="text-slate-600">Perfil RIASEC normalizado y carreras compatibles.</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
          {scoreEntries.map(([dim, score]) => (
            <div key={dim} className="riasec-dim-card group relative card text-center py-3 cursor-help">
              <div className="text-lg font-bold text-brand-morado">{dim}</div>
              <div className="text-xs text-slate-500">{RIASEC_LABELS[dim]}</div>
              <div className="text-sm text-slate-700 font-medium mt-1">{score}%</div>
              <div className="riasec-tooltip" role="tooltip">
                <strong>{RIASEC_LABELS[dim]}</strong>
                <p>{RIASEC_DESCRIPTIONS[dim]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-8">
          {(data.ranking ?? []).map((r: any, i: number) => (
            <div key={r.career_slug} className={`ranking-card ${i === 0 ? "ranking-top" : ""}`}>
              <div className="ranking-position">{i + 1}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{r.career_name ?? r.career_slug}</h3>
                <p className="text-sm text-slate-600 mt-1">{r.reasoning}</p>
              </div>
              <div className="ranking-score">{r.score}<span className="text-xs">%</span></div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={hubPath} className="btn-outline px-6 py-3 text-center">
            Volver al mapa
          </Link>
          {(data.current_stage ?? 2) < 3 ? (
            <button disabled={busy} onClick={unlockNextStage} className="btn-primary px-6 py-3">
              {busy ? "Guardando..." : "Desbloquear etapa 3 (SJT)"}
            </button>
          ) : (
            <span className="text-sm text-green-700 self-center">Etapa 3 desbloqueada</span>
          )}
        </div>
      </div>
    </AppShell>
  );
}

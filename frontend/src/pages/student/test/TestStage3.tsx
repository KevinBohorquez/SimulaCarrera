import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SjtExperience, type SjtPayload } from "@/components/SjtExperience";
import { api } from "@/lib/api";
import type { TestProgress } from "@/lib/test-types";
import { ArrowLeft } from "lucide-react";

export function TestStage3() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const nav = useNavigate();
  const [payload, setPayload] = useState<SjtPayload | null>(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hubPath = `/estudiante/test/${sessionId}`;

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      try {
        const progress = await api<TestProgress>(`/api/test/${sessionId}/progress`);
        if (!progress.session_id) {
          nav("/estudiante");
          return;
        }
        if (progress.phases[2]?.status === "complete") {
          setDone(true);
          return;
        }
        if (!progress.phases[2]?.unlocked) {
          nav(hubPath);
          return;
        }
        const data = await api<SjtPayload>(`/api/test/${sessionId}/sjt`);
        setPayload(data);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [sessionId, nav, hubPath]);

  async function submit(answers: Array<{ scenario_id: string; most_effective: string; least_effective: string }>) {
    if (!sessionId) return;
    await api(`/api/test/${sessionId}/sjt`, {
      method: "POST",
      body: JSON.stringify({ career_slug: payload!.career_slug, answers }),
    });
    setDone(true);
  }

  if (!sessionId) {
    return <AppShell title="Etapa 3"><p className="text-slate-500">Sesión no válida.</p></AppShell>;
  }

  return (
    <AppShell title="Etapa 3 · Simulación SJT">
      <Link to={hubPath} className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Mapa de etapas
      </Link>

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}

      {done && (
        <div className="max-w-lg mx-auto card text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Etapa 3 completada</h2>
          <p className="text-slate-600 mb-6">Simulación SJT registrada. Continúa con aptitudes cognitivas cuando quieras.</p>
          <Link to={hubPath} className="btn-primary px-8 py-3 inline-block">
            Volver al mapa de etapas
          </Link>
        </div>
      )}

      {!done && payload && (
        <div className="max-w-3xl mx-auto">
          <SjtExperience payload={payload} onSubmit={submit} />
        </div>
      )}

      {!done && !payload && !err && <p className="text-slate-500">Cargando simulación...</p>}
    </AppShell>
  );
}

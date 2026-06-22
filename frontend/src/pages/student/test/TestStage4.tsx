import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import type { TestProgress } from "@/lib/test-types";
import { ArrowLeft } from "lucide-react";

export function TestStage4() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const nav = useNavigate();
  const [catQuestion, setCatQuestion] = useState<any>(null);
  const [catDone, setCatDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (!progress.phases[3]?.unlocked) {
          nav(hubPath);
          return;
        }
        if (progress.phases[3]?.status === "complete") {
          setCatDone(true);
          setLoading(false);
          return;
        }
        const data = await api<any>(`/api/test/${sessionId}/cat/start`, { method: "POST" });
        if (data.done) setCatDone(true);
        else setCatQuestion(data.item);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, nav, hubPath]);

  const handleAnswer = useCallback(
    async (selected: string) => {
      if (!sessionId || !catQuestion) return;
      const data = await api<any>(`/api/test/${sessionId}/cat/answer`, {
        method: "POST",
        body: JSON.stringify({ item_id: catQuestion.item_id, selected }),
      });
      if (data.done) {
        setCatDone(true);
        setCatQuestion(null);
      } else {
        setCatQuestion(data.item);
      }
    },
    [catQuestion, sessionId],
  );

  const { pending, locked, select } = useAutoAdvance<string>(handleAnswer);

  if (!sessionId) {
    return <AppShell title="Etapa 4"><p className="text-slate-500">Sesión no válida.</p></AppShell>;
  }

  if (loading) {
    return (
      <AppShell title="Etapa 4">
        <p className="text-slate-500">Preparando test adaptativo...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Etapa 4 · Aptitudes CAT">
      <Link to={hubPath} className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Mapa de etapas
      </Link>

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}

      {catQuestion && !catDone && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Pregunta {catQuestion.progress.current} de {catQuestion.progress.total}</span>
              <span className="capitalize">{catQuestion.field_short}</span>
            </div>
            <div className="test-progress-bar">
              <div
                className="test-progress-fill"
                style={{ width: `${(catQuestion.progress.current / catQuestion.progress.total) * 100}%` }}
              />
            </div>
          </div>

          <div className="card test-question-card">
            <span className="test-dimension-badge">{catQuestion.field}</span>
            <h3 className="text-lg mb-4 mt-2">{catQuestion.enunciado}</h3>
            <p className="text-sm text-slate-500 mb-4">Toca tu respuesta — avanzará automáticamente.</p>
            <div className="grid gap-2">
              {catQuestion.opciones.map((o: any) => (
                <button
                  key={o.letra}
                  type="button"
                  disabled={locked}
                  onClick={() => select(o.letra)}
                  className={`test-option text-left w-full ${pending === o.letra ? "test-option-pending" : ""}`}
                >
                  <span className="font-semibold mr-2 uppercase">{o.letra}.</span>
                  {o.texto}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {catDone && (
        <div className="max-w-lg mx-auto card text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Etapa 4 completada</h2>
          <p className="text-slate-600 mb-6">30 ítems adaptativos registrados. Genera tu reporte desde el mapa.</p>
          <Link to={hubPath} className="btn-primary px-8 py-3 inline-block">
            Volver al mapa de etapas
          </Link>
        </div>
      )}
    </AppShell>
  );
}

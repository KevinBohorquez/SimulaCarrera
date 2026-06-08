import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

type Stage = "loading" | "diagnostic" | "ranking" | "cognitive" | "done";

export function TestFlow() {
  const nav = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ranking, setRanking] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { session } = await api<any>("/api/test/start", { method: "POST" });
        setSessionId(session.id);
        if (session.current_stage <= 1) await loadDiagnostic();
        else if (session.current_stage <= 3) { setRanking(session.ranking_preliminary ?? []); setStage("ranking"); }
        else await loadCognitive();
      } catch (e: any) { setErr(e.message); }
    })();
  }, []);

  async function loadDiagnostic() {
    const { questions } = await api<any>("/api/test/questions/diagnostic");
    setQuestions(questions); setAnswers({}); setStage("diagnostic");
  }
  async function loadCognitive() {
    const { questions } = await api<any>("/api/test/cognitive");
    setQuestions(questions); setAnswers({}); setStage("cognitive");
  }

  async function submitDiagnostic() {
    setBusy(true); setErr(null);
    try {
      const body = { answers: Object.entries(answers).map(([code, value]) => ({ question_code: code, value })) };
      const { ranking } = await api<any>(`/api/test/${sessionId}/diagnostic`, { method: "POST", body: JSON.stringify(body) });
      setRanking(ranking); setStage("ranking");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }
  async function submitCognitive() {
    setBusy(true); setErr(null);
    try {
      const body = { answers: Object.entries(answers).map(([code, value]) => ({ question_code: code, value })) };
      await api(`/api/test/${sessionId}/cognitive`, { method: "POST", body: JSON.stringify(body) });
      const { report } = await api<any>(`/api/test/${sessionId}/finalize`, { method: "POST" });
      nav(`/estudiante/reporte/${report.id}`);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <AppShell title="Test de orientación">
      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}
      {stage === "loading" && <p className="text-slate-500">Preparando tu sesión...</p>}

      {stage === "diagnostic" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Etapa 1 de 4 · Diagnóstico inicial</p>
          {questions.map((q) => (
            <div key={q.code} className="card">
              <h3 className="mb-3">{q.text}</h3>
              <div className="grid gap-2">
                {q.options.map((o: any) => (
                  <label key={o.value} className={`flex gap-2 p-3 rounded-lg border cursor-pointer ${answers[q.code] === o.value ? "border-brand-morado bg-brand-lila/30" : "border-slate-200"}`}>
                    <input type="radio" name={q.code} checked={answers[q.code] === o.value} onChange={() => setAnswers({ ...answers, [q.code]: o.value })} />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button disabled={busy || Object.keys(answers).length < questions.length} onClick={submitDiagnostic} className="btn-primary px-6 py-3">
            {busy ? "Analizando con IA..." : "Continuar"}
          </button>
        </div>
      )}

      {stage === "ranking" && (
        <div>
          <p className="text-sm text-slate-600 mb-4">Etapa 2 · Tu ranking preliminar (generado por IA)</p>
          <div className="grid gap-3 mb-6">
            {ranking.map((r) => (
              <div key={r.career_slug} className="card flex justify-between items-center">
                <div>
                  <a href={`/estudiante/carreras/${r.career_slug}`} target="_blank" rel="noreferrer" className="font-semibold capitalize hover:text-brand-morado">{r.career_slug.replaceAll("-", " ")}</a>
                  <div className="text-sm text-slate-600 mt-1">{r.reasoning}</div>
                </div>
                <div className="flex items-center gap-4">
                  <a href={`/estudiante/carreras/${r.career_slug}`} target="_blank" className="btn-outline text-xs py-1.5 px-3">Ver detalles y simular</a>
                  <div className="text-2xl font-bold text-brand-morado">{r.score}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-3">Tip: abre las fichas de cada carrera (universidades, salarios, simulaciones) antes de continuar.</p>
          <button onClick={loadCognitive} className="btn-primary px-6 py-3">Continuar al test cognitivo</button>
        </div>
      )}

      {stage === "cognitive" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Etapa 4 · Capacidades cognitivas</p>
          {questions.map((q) => (
            <div key={q.code} className="card">
              <h3 className="mb-1">{q.text}</h3>
              <p className="text-xs text-slate-500 mb-3">{q.capacity}</p>
              <div className="grid gap-2">
                {q.options.map((o: any) => (
                  <label key={o.value} className={`flex gap-2 p-3 rounded-lg border cursor-pointer ${answers[q.code] === o.value ? "border-brand-morado bg-brand-lila/30" : "border-slate-200"}`}>
                    <input type="radio" name={q.code} checked={answers[q.code] === o.value} onChange={() => setAnswers({ ...answers, [q.code]: o.value })} />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button disabled={busy || Object.keys(answers).length < questions.length} onClick={submitCognitive} className="btn-primary px-6 py-3">
            {busy ? "Generando tu reporte..." : "Generar reporte final"}
          </button>
        </div>
      )}
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SimulationExperience } from "@/components/SimulationExperience";
import { api } from "@/lib/api";
import { Brain, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

type Stage = "loading" | "diagnostic" | "ranking" | "simulation" | "cognitive" | "generating";

const STAGES = [
  { key: "diagnostic", label: "Diagnóstico", num: 1 },
  { key: "ranking", label: "Ranking IA", num: 2 },
  { key: "simulation", label: "Simulación", num: 3 },
  { key: "cognitive", label: "Cognitivo", num: 4 },
];

export function TestFlow() {
  const nav = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [sessionId, setSessionId] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ranking, setRanking] = useState<any[]>([]);
  const [simulation, setSimulation] = useState<any>(null);
  const [topCareer, setTopCareer] = useState<any>(null);
  const [simComplete, setSimComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { session, ai_enabled } = await api<any>("/api/test/start", { method: "POST" });
        setSessionId(session.id);
        setAiEnabled(ai_enabled);

        if (session.current_stage <= 1) {
          await loadDiagnostic();
        } else if (session.current_stage === 2) {
          setRanking(session.ranking_preliminary ?? []);
          setStage("ranking");
        } else if (session.current_stage === 3) {
          setRanking(session.ranking_preliminary ?? []);
          await loadSimulation(session.ranking_preliminary?.[0]);
          setStage("simulation");
        } else {
          setRanking(session.ranking_preliminary ?? []);
          await loadCognitive();
        }
      } catch (e: any) { setErr(e.message); }
    })();
  }, []);

  async function loadDiagnostic() {
    const { questions: qs } = await api<any>("/api/test/questions/diagnostic");
    setQuestions(qs);
    setAnswers({});
    setQIndex(0);
    setStage("diagnostic");
  }

  async function loadCognitive() {
    const { questions: qs } = await api<any>("/api/test/cognitive");
    setQuestions(qs);
    setAnswers({});
    setQIndex(0);
    setStage("cognitive");
  }

  async function loadSimulation(topRank?: any) {
    if (!topRank) return;
    const { simulations, career } = await api<any>(`/api/simulations/by-slug/${topRank.career_slug}`);
    setTopCareer(career);
    if (simulations?.[0]) setSimulation(simulations[0]);
  }

  async function submitDiagnostic() {
    setBusy(true);
    setErr(null);
    try {
      const body = { answers: Object.entries(answers).map(([code, value]) => ({ question_code: code, value })) };
      const { ranking: r, ai_used, ai_error } = await api<any>(`/api/test/${sessionId}/diagnostic`, { method: "POST", body: JSON.stringify(body) });
      setRanking(r);
      setAiEnabled(ai_used);
      setAiError(ai_error ?? null);
      await loadSimulation(r[0]);
      setStage("ranking");
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function goToSimulation() {
    await api(`/api/test/${sessionId}/advance`, { method: "POST", body: JSON.stringify({ stage: 3 }) });
    setStage("simulation");
  }

  async function onSimulationSubmit(decisions: Array<{ block_index: number; value: string }>) {
    const r = await api<any>(`/api/simulations/${sessionId}/submit`, {
      method: "POST",
      body: JSON.stringify({ simulation_id: simulation.id, decisions }),
    });
    return r.result;
  }

  async function afterSimulation() {
    await loadCognitive();
  }

  async function submitCognitive() {
    setBusy(true);
    setErr(null);
    try {
      const body = { answers: Object.entries(answers).map(([code, value]) => ({ question_code: code, value })) };
      await api(`/api/test/${sessionId}/cognitive`, { method: "POST", body: JSON.stringify(body) });
      setStage("generating");
      const { report } = await api<any>(`/api/test/${sessionId}/finalize`, { method: "POST" });
      nav(`/estudiante/reporte/${report.id}`);
    } catch (e: any) { setErr(e.message); setStage("cognitive"); }
    finally { setBusy(false); }
  }

  const currentStageNum = STAGES.find((s) => s.key === stage)?.num ?? 0;
  const diagProgress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;

  return (
    <AppShell title="Test de orientación vocacional">
      {/* Stepper */}
      {stage !== "loading" && stage !== "generating" && (
        <div className="test-stepper mb-8">
          {STAGES.map((s) => (
            <div key={s.key} className={`test-step ${currentStageNum >= s.num ? "active" : ""} ${currentStageNum === s.num ? "current" : ""}`}>
              <div className="test-step-dot">{currentStageNum > s.num ? <CheckCircle2 size={14} /> : s.num}</div>
              <span className="test-step-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {!aiEnabled && stage !== "loading" && (
        <div className="card mb-4 text-sm border-amber-200 bg-amber-50 text-amber-800">
          {aiError?.includes("Cuota") || aiError?.includes("429") || aiError?.includes("Groq") ? (
            <p><b>IA con cuota agotada.</b> Usa <b>Groq gratis</b> (sin tarjeta): ve a <a href="https://console.groq.com" className="underline" target="_blank" rel="noreferrer">console.groq.com</a> → crea <code className="bg-amber-100 px-1 rounded">GROQ_API_KEY</code> → ponla en backend/.env con <code className="bg-amber-100 px-1 rounded">AI_PROVIDER=groq</code></p>
          ) : (
            <p>IA no disponible — añade <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code> en backend/.env</p>
          )}
        </div>
      )}

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}
      {stage === "loading" && <p className="text-slate-500">Preparando tu sesión...</p>}

      {stage === "generating" && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-lila mb-4">
            <Sparkles size={28} className="text-brand-morado animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Generando tu reporte con IA</h2>
          <p className="text-slate-500">Analizando diagnóstico, simulación y capacidades cognitivas...</p>
        </div>
      )}

      {/* ETAPA 1: Diagnóstico */}
      {stage === "diagnostic" && questions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Pregunta {qIndex + 1} de {questions.length}</span>
              <span>{Math.round(diagProgress)}% completado</span>
            </div>
            <div className="test-progress-bar"><div className="test-progress-fill" style={{ width: `${diagProgress}%` }} /></div>
          </div>

          <div className="card test-question-card">
            <span className="test-dimension-badge">{questions[qIndex].dimension}</span>
            <h3 className="text-lg mt-2 mb-4">{questions[qIndex].text}</h3>
            <div className="grid gap-2">
              {questions[qIndex].options.map((o: any) => (
                <label key={o.value} className={`test-option ${answers[questions[qIndex].code] === o.value ? "selected" : ""}`}>
                  <input type="radio" name={questions[qIndex].code} checked={answers[questions[qIndex].code] === o.value}
                    onChange={() => setAnswers({ ...answers, [questions[qIndex].code]: o.value })} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button disabled={qIndex === 0} onClick={() => setQIndex(qIndex - 1)} className="btn-outline">Anterior</button>
            {qIndex < questions.length - 1 ? (
              <button disabled={!answers[questions[qIndex].code]} onClick={() => setQIndex(qIndex + 1)} className="btn-primary">
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button disabled={busy || Object.keys(answers).length < questions.length} onClick={submitDiagnostic} className="btn-primary">
                {busy ? <><Sparkles size={16} className="mr-1 animate-pulse" /> Analizando con IA...</> : <>Ver mi ranking <Sparkles size={16} className="ml-1" /></>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ETAPA 2: Ranking */}
      {stage === "ranking" && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-brand-morado mb-2">
              <Brain size={20} />
              <span className="font-semibold">Ranking generado por IA</span>
            </div>
            <p className="text-slate-600">Basado en tus respuestas, estas carreras encajan mejor contigo.</p>
          </div>

          <div className="space-y-3 mb-8">
            {ranking.map((r, i) => (
              <div key={r.career_slug} className={`ranking-card ${i === 0 ? "ranking-top" : ""}`}>
                <div className="ranking-position">{i + 1}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{r.career_name ?? r.career_slug.replaceAll("-", " ")}</h3>
                  <p className="text-sm text-slate-600 mt-1">{r.reasoning}</p>
                </div>
                <div className="ranking-score">{r.score}<span className="text-xs">%</span></div>
              </div>
            ))}
          </div>

          <div className="card bg-gradient-to-r from-brand-lila/30 to-brand-celeste/20 border-brand-morado/20">
            <p className="text-sm text-slate-700 mb-4">
              A continuación vivirás una <strong>simulación inmersiva</strong> de tu carrera #1
              {topCareer ? `: ${topCareer.name}` : ""}. Tomarás decisiones reales y la IA analizará tu estilo profesional.
            </p>
            <button onClick={goToSimulation} className="btn-primary px-6 py-3">
              Iniciar simulación <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: Simulación */}
      {stage === "simulation" && simulation && (
        <div className="max-w-3xl mx-auto">
          <SimulationExperience
            simulation={simulation}
            onSubmit={onSimulationSubmit}
            onComplete={() => setSimComplete(true)}
          />
          {simComplete && (
            <div className="mt-6 text-center">
              <button onClick={afterSimulation} className="btn-primary px-8 py-3">
                Continuar al test cognitivo <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {stage === "simulation" && !simulation && (
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">No hay simulación para tu carrera top. Continuamos al test cognitivo.</p>
          <button onClick={afterSimulation} className="btn-primary">Continuar</button>
        </div>
      )}

      {/* ETAPA 4: Cognitivo */}
      {stage === "cognitive" && questions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Pregunta {qIndex + 1} de {questions.length}</span>
              <span className="capitalize">{questions[qIndex].capacity}</span>
            </div>
            <div className="test-progress-bar"><div className="test-progress-fill" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} /></div>
          </div>

          <div className="card test-question-card">
            <h3 className="text-lg mb-4">{questions[qIndex].text}</h3>
            <div className="grid gap-2">
              {questions[qIndex].options.map((o: any) => (
                <label key={o.value} className={`test-option ${answers[questions[qIndex].code] === o.value ? "selected" : ""}`}>
                  <input type="radio" name={questions[qIndex].code} checked={answers[questions[qIndex].code] === o.value}
                    onChange={() => setAnswers({ ...answers, [questions[qIndex].code]: o.value })} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button disabled={qIndex === 0} onClick={() => setQIndex(qIndex - 1)} className="btn-outline">Anterior</button>
            {qIndex < questions.length - 1 ? (
              <button disabled={!answers[questions[qIndex].code]} onClick={() => setQIndex(qIndex + 1)} className="btn-primary">Siguiente</button>
            ) : (
              <button disabled={busy || Object.keys(answers).length < questions.length} onClick={submitCognitive} className="btn-primary">
                {busy ? <><Sparkles size={16} className="mr-1 animate-pulse" /> Generando reporte...</> : <>Generar reporte final <Sparkles size={16} className="ml-1" /></>}
              </button>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

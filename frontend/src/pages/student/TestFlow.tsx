import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SjtExperience, type SjtPayload } from "@/components/SjtExperience";
import { api } from "@/lib/api";
import { Brain, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react";

type Stage =
  | "loading"
  | "config"
  | "riasec"
  | "profile"
  | "simulation"
  | "cognitive"
  | "generating";

const STAGES = [
  { key: "riasec", label: "Intereses RIASEC", num: 1 },
  { key: "profile", label: "Perfil Holland", num: 2 },
  { key: "simulation", label: "Simulación SJT", num: 3 },
  { key: "cognitive", label: "CAT cognitivo", num: 4 },
];

const LENGTH_OPTIONS = [
  { value: 30, label: "30 preguntas", hint: "Rápido · EEM mayor" },
  { value: 60, label: "60 preguntas", hint: "Balanceado" },
  { value: 90, label: "90 preguntas", hint: "Recomendado" },
  { value: 120, label: "120 preguntas", hint: "Máxima precisión" },
];

export function TestFlow() {
  const nav = useNavigate();
  const [stage, setStage] = useState<Stage>("loading");
  const [sessionId, setSessionId] = useState("");
  const [riasecLength, setRiasecLength] = useState(90);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [hollandCode, setHollandCode] = useState("");
  const [riasecScores, setRiasecScores] = useState<Record<string, number>>({});
  const [ranking, setRanking] = useState<any[]>([]);
  const [sjtPayload, setSjtPayload] = useState<SjtPayload | null>(null);
  const [catQuestion, setCatQuestion] = useState<any>(null);
  const [catDone, setCatDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [qIndex, setQIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { session } = await api<any>("/api/test/active-session");
        if (session) {
          setSessionId(session.id);
          await resumeFromSession(session);
          return;
        }
        setStage("config");
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  async function resumeFromSession(session: any) {
    const cs = session.current_stage ?? 1;
    if (cs <= 1 && !(session.diagnostic_answers as any)?.answers?.length) {
      setStage("config");
      return;
    }
    if (cs <= 1) {
      await loadRiasec(session.id);
      setStage("riasec");
      return;
    }
    if (cs === 2) {
      hydrateProfile(session);
      setStage("profile");
      return;
    }
    if (cs === 3) {
      hydrateProfile(session);
      await loadSjt(session.id, session.ranking_preliminary?.[0]?.career_slug);
      setStage("simulation");
      return;
    }
    if (cs === 4 && !(session.simulation_results as any[])?.length) {
      hydrateProfile(session);
      await loadSjt(session.id, session.ranking_preliminary?.[0]?.career_slug);
      setStage("simulation");
      return;
    }
    if (cs === 4) {
      hydrateProfile(session);
      await startCat(session.id);
      setStage("cognitive");
      return;
    }
    setStage("config");
  }

  function hydrateProfile(session: any) {
    setRanking(session.ranking_preliminary ?? []);
    setHollandCode(session.diagnostic_answers?.scores?.holland_code ?? "");
    setRiasecScores(session.diagnostic_answers?.scores?.normalized ?? {});
  }

  async function startSession() {
    setBusy(true);
    setErr(null);
    try {
      const { session } = await api<any>("/api/test/start", {
        method: "POST",
        body: JSON.stringify({ riasec_length: riasecLength }),
      });
      setSessionId(session.id);
      await loadRiasec(session.id);
      setStage("riasec");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function loadRiasec(sid: string) {
    const data = await api<any>(`/api/test/${sid}/riasec`);
    setQuestions(data.questions ?? []);
    setAnswers({});
    setQIndex(0);
  }

  async function loadSjt(sid: string, careerSlug?: string) {
    const q = careerSlug ? `?career_slug=${encodeURIComponent(careerSlug)}` : "";
    const data = await api<SjtPayload>(`/api/test/${sid}/sjt${q}`);
    setSjtPayload(data);
  }

  async function submitRiasec() {
    setBusy(true);
    setErr(null);
    try {
      const body = {
        answers: Object.entries(answers).map(([item_code, likert]) => ({ item_code, likert })),
      };
      const { scores, ranking: r, session } = await api<any>(`/api/test/${sessionId}/riasec`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setHollandCode(scores.holland_code);
      setRiasecScores(scores.normalized);
      setRanking(r);
      await loadSjt(sessionId, r[0]?.career_slug);
      setStage("profile");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function goToSimulation() {
    await api(`/api/test/${sessionId}/advance`, { method: "POST", body: JSON.stringify({ stage: 3 }) });
    setStage("simulation");
  }

  async function submitSjt(
    sjtAnswers: Array<{ scenario_id: string; most_effective: string; least_effective: string }>,
  ) {
    await api(`/api/test/${sessionId}/sjt`, {
      method: "POST",
      body: JSON.stringify({ career_slug: sjtPayload!.career_slug, answers: sjtAnswers }),
    });
    await startCat(sessionId);
    setStage("cognitive");
  }

  async function startCat(sid: string) {
    const data = await api<any>(`/api/test/${sid}/cat/start`, { method: "POST" });
    if (data.done) {
      setCatDone(true);
      return;
    }
    setCatQuestion(data.item);
    setCatDone(false);
  }

  async function answerCat(selected: string) {
    if (!catQuestion) return;
    setBusy(true);
    setErr(null);
    try {
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
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    setBusy(true);
    setStage("generating");
    try {
      const { report } = await api<any>(`/api/test/${sessionId}/finalize`, { method: "POST" });
      nav(`/estudiante/reporte/${report.id}`);
    } catch (e: any) {
      setErr(e.message);
      setStage("cognitive");
    } finally {
      setBusy(false);
    }
  }

  const currentStageNum = STAGES.find((s) => s.key === stage)?.num ?? 0;
  const riasecProgress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const q = questions[qIndex];

  return (
    <AppShell title="Test de orientación vocacional">
      {stage !== "loading" && stage !== "generating" && stage !== "config" && (
        <div className="test-stepper mb-8">
          {STAGES.map((s) => (
            <div
              key={s.key}
              className={`test-step ${currentStageNum >= s.num ? "active" : ""} ${currentStageNum === s.num ? "current" : ""}`}
            >
              <div className="test-step-dot">
                {currentStageNum > s.num ? <CheckCircle2 size={14} /> : s.num}
              </div>
              <span className="test-step-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}
      {stage === "loading" && <p className="text-slate-500">Preparando tu sesión...</p>}

      {stage === "config" && (
        <div className="max-w-lg mx-auto card">
          <h2 className="text-xl font-semibold mb-2">Profundidad del test RIASEC</h2>
          <p className="text-slate-600 text-sm mb-6">
            Elige cuántas preguntas responderás. A mayor extensión, menor error de medida y perfil más preciso.
          </p>
          <div className="grid gap-2 mb-6">
            {LENGTH_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`test-option ${riasecLength === o.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  checked={riasecLength === o.value}
                  onChange={() => setRiasecLength(o.value)}
                />
                <span>
                  <strong>{o.label}</strong>
                  <span className="block text-xs text-slate-500">{o.hint}</span>
                </span>
              </label>
            ))}
          </div>
          <button disabled={busy} onClick={startSession} className="btn-primary w-full py-3">
            Iniciar evaluación
          </button>
        </div>
      )}

      {stage === "generating" && (
        <div className="text-center py-16">
          <Sparkles size={28} className="text-brand-morado animate-pulse mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Generando tu reporte</h2>
          <p className="text-slate-500">Consolidando RIASEC, SJT y aptitudes cognitivas...</p>
        </div>
      )}

      {stage === "riasec" && q && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>Pregunta {qIndex + 1} de {questions.length}</span>
              <span>{Math.round(riasecProgress)}% completado</span>
            </div>
            <div className="test-progress-bar">
              <div className="test-progress-fill" style={{ width: `${riasecProgress}%` }} />
            </div>
          </div>

          <div className="card test-question-card">
            <span className="test-dimension-badge">{q.dimension_label ?? q.dimension}</span>
            <h3 className="text-lg mt-2 mb-4">{q.enunciado}</h3>
            <p className="text-sm text-slate-500 mb-4">¿Qué tan de acuerdo estás con esta actividad?</p>
            <div className="grid gap-2">
              {(q.likert_options ?? []).map((o: any) => (
                <label
                  key={o.value}
                  className={`test-option ${answers[q.item_code] === o.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    checked={answers[q.item_code] === o.value}
                    onChange={() => setAnswers({ ...answers, [q.item_code]: o.value })}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button disabled={qIndex === 0} onClick={() => setQIndex(qIndex - 1)} className="btn-outline">
              Anterior
            </button>
            {qIndex < questions.length - 1 ? (
              <button
                disabled={answers[q.item_code] == null}
                onClick={() => setQIndex(qIndex + 1)}
                className="btn-primary"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button
                disabled={busy || Object.keys(answers).length < questions.length}
                onClick={submitRiasec}
                className="btn-primary"
              >
                {busy ? "Calculando perfil..." : "Ver mi perfil Holland"}
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "profile" && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-brand-morado mb-2">
              <Brain size={20} />
              <span className="font-semibold">Código Holland: {hollandCode}</span>
            </div>
            <p className="text-slate-600">Perfil RIASEC normalizado y carreras compatibles (scoring determinista).</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
            {Object.entries(riasecScores).map(([dim, score]) => (
              <div key={dim} className="card text-center py-3">
                <div className="text-lg font-bold text-brand-morado">{dim}</div>
                <div className="text-sm text-slate-600">{score}%</div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8">
            {ranking.map((r, i) => (
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

          <div className="card bg-gradient-to-r from-brand-lila/30 to-brand-celeste/20 border-brand-morado/20">
            <p className="text-sm text-slate-700 mb-4">
              Simularás <strong>4 escenarios SJT</strong> de {ranking[0]?.career_name ?? "tu carrera top"}.
              Deberás elegir la acción más y menos efectiva en cada dilema.
            </p>
            <button onClick={goToSimulation} className="btn-primary px-6 py-3">
              Iniciar simulación SJT <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {stage === "simulation" && sjtPayload && (
        <div className="max-w-3xl mx-auto">
          <SjtExperience payload={sjtPayload} onSubmit={submitSjt} />
          <div className="mt-6 text-center">
            <button onClick={() => setStage("cognitive")} className="btn-outline hidden">
              Saltar
            </button>
          </div>
        </div>
      )}

      {stage === "cognitive" && (
        <div className="max-w-2xl mx-auto">
          {catQuestion && !catDone && (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>
                    Pregunta {catQuestion.progress.current} de {catQuestion.progress.total}
                  </span>
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
                <div className="grid gap-2">
                  {catQuestion.opciones.map((o: any) => (
                    <button
                      key={o.letra}
                      disabled={busy}
                      onClick={() => answerCat(o.letra)}
                      className="test-option text-left"
                    >
                      <span className="font-semibold mr-2 uppercase">{o.letra}.</span>
                      {o.texto}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {catDone && (
            <div className="card text-center py-10">
              <h2 className="text-xl font-semibold mb-2">Test cognitivo completado</h2>
              <p className="text-slate-600 mb-6">30 ítems adaptativos registrados (modelo Rasch).</p>
              <button disabled={busy} onClick={finalize} className="btn-primary px-8 py-3">
                {busy ? "Generando reporte..." : "Generar reporte final"}
              </button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}

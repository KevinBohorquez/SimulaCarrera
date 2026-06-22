import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAutoAdvance } from "@/hooks/useAutoAdvance";
import type { TestProgress } from "@/lib/test-types";
import { ArrowLeft } from "lucide-react";

const LENGTH_OPTIONS = [
  { value: 30, label: "30 preguntas", hint: "Rápido" },
  { value: 60, label: "60 preguntas", hint: "Balanceado" },
  { value: 90, label: "90 preguntas", hint: "Recomendado" },
  { value: 120, label: "120 preguntas", hint: "Máxima precisión" },
];

export function TestStage1() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const forceSetup = params.get("setup") === "1";

  const [riasecLength, setRiasecLength] = useState(90);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<"setup" | "quiz" | "done">("setup");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

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

        if (progress.phases[0]?.status === "complete") {
          setPhase("done");
          setInitialized(true);
          return;
        }

        const canResume =
          !forceSetup &&
          (progress.phases[0]?.status === "in_progress" || !!progress.riasec_length);

        if (canResume) {
          try {
            await loadQuiz(sessionId);
            setPhase("quiz");
            setInitialized(true);
            return;
          } catch {
            /* sin ítems sorteados aún — mostrar configuración */
          }
        }

        if (progress.riasec_length) setRiasecLength(progress.riasec_length);
        setPhase("setup");
        setInitialized(true);
      } catch (e: any) {
        setErr(e.message);
        setInitialized(true);
      }
    })();
  }, [sessionId, forceSetup, nav]);

  async function loadQuiz(
    sid: string,
    savedAnswers?: Array<{ item_code: string; likert: number }>,
  ) {
    const data = await api<any>(`/api/test/${sid}/riasec`);
    setQuestions(data.questions ?? []);
    const map: Record<string, number> = {};
    const saved = savedAnswers ?? data.saved_answers ?? [];
    for (const a of saved) map[a.item_code] = a.likert;
    setAnswers(map);
    const total = (data.questions ?? []).length;
    setQIndex(Math.min(saved.length, Math.max(0, total - 1)));
    if (data.riasec_length) setRiasecLength(data.riasec_length);
  }

  async function beginTest() {
    if (!sessionId) return;
    setBusy(true);
    setErr(null);
    try {
      const { session, resume } = await api<any>(`/api/test/${sessionId}/start`, {
        method: "POST",
        body: JSON.stringify({ riasec_length: riasecLength }),
      });
      if (resume && (session.diagnostic_answers?.answers?.length ?? 0) > 0) {
        await loadQuiz(sessionId, session.diagnostic_answers.answers);
      } else {
        await loadQuiz(sessionId, []);
        setAnswers({});
        setQIndex(0);
      }
      setPhase("quiz");
      nav(`${hubPath}/etapa/1`, { replace: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const handleAnswer = useCallback(
    async (likert: number) => {
      if (!sessionId) return;
      const q = questions[qIndex];
      if (!q) return;
      const nextAnswers = { ...answers, [q.item_code]: likert };
      setAnswers(nextAnswers);
      const list = Object.entries(nextAnswers).map(([item_code, l]) => ({ item_code, likert: l }));

      if (list.length < questions.length) {
        const nextIndex = qIndex + 1;
        setQIndex(nextIndex);
        await api(`/api/test/${sessionId}/riasec/progress`, {
          method: "POST",
          body: JSON.stringify({ answers: list, current_index: nextIndex }),
        });
        return;
      }

      setBusy(true);
      try {
        await api(`/api/test/${sessionId}/riasec`, {
          method: "POST",
          body: JSON.stringify({ answers: list }),
        });
        setPhase("done");
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    },
    [answers, qIndex, questions, sessionId],
  );

  const { pending, locked, select } = useAutoAdvance<number>(handleAnswer);

  const q = questions[qIndex];
  const currentAnswered = q?.item_code != null && answers[q.item_code] != null;
  const progressPct = questions.length
    ? Math.min(100, ((qIndex + (currentAnswered ? 1 : 0)) / questions.length) * 100)
    : 0;

  if (!sessionId) {
    return (
      <AppShell title="Etapa 1">
        <p className="text-slate-500">Sesión no válida.</p>
      </AppShell>
    );
  }

  if (!initialized) {
    return (
      <AppShell title="Etapa 1 · Intereses RIASEC">
        <p className="text-slate-500">Cargando...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Etapa 1 · Intereses RIASEC">
      <Link to={hubPath} className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Mapa de etapas
      </Link>

      {err && <div className="card mb-4 text-red-600 text-sm">{err}</div>}

      {phase === "setup" && (
        <div className="max-w-lg mx-auto card">
          <span className="test-dimension-badge">Etapa 1 de 4</span>
          <h2 className="text-xl font-semibold mt-3 mb-2">Profundidad del inventario RIASEC</h2>
          <p className="text-slate-600 text-sm mb-6">
            Elige cuántas preguntas responderás en esta etapa. Podrás pausar y continuar otro día.
          </p>
          <div className="grid gap-2 mb-6">
            {LENGTH_OPTIONS.map((o) => (
              <label key={o.value} className={`test-option ${riasecLength === o.value ? "selected" : ""}`}>
                <input type="radio" checked={riasecLength === o.value} onChange={() => setRiasecLength(o.value)} />
                <span><strong>{o.label}</strong> · {o.hint}</span>
              </label>
            ))}
          </div>
          <button disabled={busy} onClick={beginTest} className="btn-primary w-full py-3">
            Comenzar etapa 1
          </button>
        </div>
      )}

      {phase === "quiz" && q && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-500 mb-2">
              <span>
                Pregunta {Math.min(qIndex + (currentAnswered ? 1 : 0), questions.length)} de {questions.length}
              </span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="test-progress-bar">
              <div className="test-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="card test-question-card">
            <span className="test-dimension-badge">{q.dimension_label ?? q.dimension}</span>
            <h3 className="text-lg mt-2 mb-4">{q.enunciado}</h3>
            <p className="text-sm text-slate-500 mb-4">Toca tu respuesta — avanzará automáticamente.</p>
            <div className="grid gap-2">
              {(q.likert_options ?? []).map((o: any) => (
                <button
                  key={o.value}
                  type="button"
                  disabled={locked || busy}
                  onClick={() => select(o.value)}
                  className={`test-option text-left w-full ${pending === o.value ? "test-option-pending" : ""}`}
                >
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="max-w-lg mx-auto card text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Etapa 1 completada</h2>
          <p className="text-slate-600 mb-6">Tu perfil RIASEC está listo. Revisa la etapa 2 cuando quieras.</p>
          <Link to={hubPath} className="btn-primary px-8 py-3 inline-block">
            Volver al mapa de etapas
          </Link>
        </div>
      )}
    </AppShell>
  );
}

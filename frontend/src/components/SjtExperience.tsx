import { useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";

export interface SjtScenario {
  scenario_id: string;
  contexto_narrativo: string;
  image_url?: string;
  opciones: Array<{ opcion_id: string; texto: string }>;
}

export interface SjtPayload {
  career_slug: string;
  career_name: string;
  title: string;
  description?: string;
  intro?: string;
  estimated_minutes?: number;
  scenarios: SjtScenario[];
}

interface Props {
  payload: SjtPayload;
  onSubmit: (
    answers: Array<{ scenario_id: string; most_effective: string; least_effective: string }>,
  ) => Promise<void>;
}

type PickStep = "most" | "least";

export function SjtExperience({ payload, onSubmit }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [idx, setIdx] = useState(0);
  const [pickStep, setPickStep] = useState<PickStep>("most");
  const [most, setMost] = useState<string | null>(null);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<
    Array<{ scenario_id: string; most_effective: string; least_effective: string }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const scenario = payload.scenarios[idx];
  const total = payload.scenarios.length;
  const subProgress = pickStep === "most" ? 0.5 : 1;
  const progress =
    phase === "playing" ? ((idx + subProgress) / total) * 100 : phase === "done" ? 100 : 0;

  const visibleOptions =
    pickStep === "most" || !most
      ? scenario?.opciones ?? []
      : scenario.opciones.filter((o) => o.opcion_id !== most);

  async function finishAll(nextAnswers: typeof answers) {
    setBusy(true);
    setErr(null);
    try {
      await onSubmit(nextAnswers);
      setPhase("done");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function pickMost(opcionId: string) {
    if (busy || exitingId || pickStep !== "most") return;
    setExitingId(opcionId);
    setTimeout(() => {
      setMost(opcionId);
      setExitingId(null);
      setPickStep("least");
    }, 520);
  }

  function pickLeast(opcionId: string) {
    if (busy || !most || !scenario || pickStep !== "least") return;
    setBusy(true);
    const entry = {
      scenario_id: scenario.scenario_id,
      most_effective: most,
      least_effective: opcionId,
    };
    const next = [...answers, entry];

    setTimeout(() => {
      setMost(null);
      setPickStep("most");
      if (idx + 1 < total) {
        setAnswers(next);
        setIdx(idx + 1);
        setBusy(false);
      } else {
        finishAll(next);
      }
    }, 480);
  }

  if (phase === "intro") {
    return (
      <div className="sim-container sim-container-full">
        <div className="sim-hero">
          {payload.scenarios[0]?.image_url && (
            <img src={payload.scenarios[0].image_url} alt="" className="sim-hero-img" />
          )}
          <div className="sim-hero-overlay" />
          <div className="sim-hero-content">
            <span className="sim-badge"><Sparkles size={14} /> Simulación SJT</span>
            <h2 className="sim-title">{payload.title}</h2>
            <p className="sim-desc">{payload.description}</p>
          </div>
        </div>
        <div className="sim-body">
          <p className="sim-intro">{payload.intro}</p>
          <div className="sim-meta">
            <span>{total} escenarios</span>
            <span>·</span>
            <span>~{payload.estimated_minutes ?? 12} min</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Por cada dilema: primero la acción <strong>más probable</strong> que tomarías; luego, entre las otras cuatro, la <strong>menos probable</strong>.
          </p>
          <button onClick={() => setPhase("playing")} className="btn-primary w-full py-3 text-base">
            Comenzar simulación <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="card text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Simulación completada</h2>
        <p className="text-slate-600">Tus respuestas SJT y perfil Big Five fueron registrados.</p>
      </div>
    );
  }

  if (!scenario) return null;

  return (
    <div className="sim-container">
      <div className="sim-progress-bar">
        <div className="sim-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {scenario.image_url && (
        <div className="sim-scene-img-wrap">
          <img src={scenario.image_url} alt="" className="sim-scene-img" />
          <div className="sim-scene-overlay" />
        </div>
      )}

      <div className="sim-block">
        <span className="text-xs text-slate-400">
          Escenario {idx + 1} de {total}
          {pickStep === "least" && " · paso 2 de 2"}
        </span>
        <p className="sim-block-situation mt-3">{scenario.contexto_narrativo}</p>

        {pickStep === "most" ? (
          <>
            <p className="text-sm font-semibold text-brand-morado mt-6 mb-3">
              ¿Cuál es la respuesta más probable que tomarías?
            </p>
            <div className="grid gap-2">
              {scenario.opciones.map((o) => (
                <button
                  key={o.opcion_id}
                  type="button"
                  disabled={busy || exitingId != null}
                  onClick={() => pickMost(o.opcion_id)}
                  className={`sim-option text-left sjt-pick-option ${
                    exitingId === o.opcion_id ? "sjt-option-exit" : ""
                  }`}
                >
                  <span className="font-semibold mr-2">{o.opcion_id}.</span>
                  {o.texto}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-brand-morado mt-6 mb-1 sjt-step-fade-in">
              ¿Cuál es la respuesta menos probable que tomarías?
            </p>
            <p className="text-xs text-slate-500 mb-3 sjt-step-fade-in">
              Elige entre las 4 opciones restantes.
            </p>
            <div className="grid gap-2">
              {visibleOptions.map((o) => (
                <button
                  key={o.opcion_id}
                  type="button"
                  disabled={busy}
                  onClick={() => pickLeast(o.opcion_id)}
                  className="sim-option text-left sjt-pick-option sjt-step-fade-in"
                >
                  <span className="font-semibold mr-2">{o.opcion_id}.</span>
                  {o.texto}
                </button>
              ))}
            </div>
          </>
        )}

        {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
      </div>
    </div>
  );
}

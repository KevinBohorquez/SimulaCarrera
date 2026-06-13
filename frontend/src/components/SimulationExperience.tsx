import { useState } from "react";
import { Sparkles, ChevronRight, Brain, Zap } from "lucide-react";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  decision: { label: "Decisión clave", color: "bg-purple-100 text-purple-700" },
  resolucion_tecnica: { label: "Resolución técnica", color: "bg-blue-100 text-blue-700" },
  imprevisto: { label: "Imprevisto", color: "bg-amber-100 text-amber-700" },
};

export interface SimBlock {
  type: string;
  title?: string;
  context?: string;
  situation: string;
  image_url?: string;
  options: Array<{ value: string; label: string; hint?: string }>;
}

export interface SimulationData {
  id: string;
  title: string;
  description?: string;
  intro?: string;
  blocks: SimBlock[];
}

export interface SimFeedback {
  headline: string;
  narrative: string;
  strengths: string[];
  growth_areas?: string[];
  fit_score: number;
}

interface Props {
  simulation: SimulationData;
  onComplete: (result: { totals: Record<string, number>; feedback: SimFeedback }) => void;
  onSubmit: (decisions: Array<{ block_index: number; value: string }>) => Promise<{ totals: Record<string, number>; feedback: SimFeedback }>;
  compact?: boolean;
}

export function SimulationExperience({ simulation, onComplete, onSubmit, compact }: Props) {
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<Array<{ block_index: number; value: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ totals: Record<string, number>; feedback: SimFeedback } | null>(null);

  const block = simulation.blocks[idx];
  const typeInfo = TYPE_LABELS[block?.type] ?? { label: block?.type, color: "bg-slate-100 text-slate-600" };
  const progress = phase === "playing" ? ((idx) / simulation.blocks.length) * 100 : phase === "result" ? 100 : 0;

  async function pick(value: string) {
    const next = [...choices, { block_index: idx, value }];
    setChoices(next);
    if (idx + 1 < simulation.blocks.length) {
      setIdx(idx + 1);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await onSubmit(next);
      setResult(r);
      setPhase("result");
      onComplete(r);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "intro") {
    return (
      <div className={`sim-container ${compact ? "" : "sim-container-full"}`}>
        <div className="sim-hero">
          {simulation.blocks[0]?.image_url && (
            <img src={simulation.blocks[0].image_url} alt="" className="sim-hero-img" />
          )}
          <div className="sim-hero-overlay" />
          <div className="sim-hero-content">
            <span className="sim-badge"><Sparkles size={14} /> Simulación inmersiva</span>
            <h2 className="sim-title">{simulation.title}</h2>
            <p className="sim-desc">{simulation.description}</p>
          </div>
        </div>
        <div className="sim-body">
          <p className="sim-intro">{simulation.intro}</p>
          <div className="sim-meta">
            <span>{simulation.blocks.length} escenarios</span>
            <span>·</span>
            <span>~{simulation.blocks.length * 3} min</span>
          </div>
          <button onClick={() => setPhase("playing")} className="btn-primary w-full py-3 text-base">
            Comenzar simulación <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    const { feedback, totals } = result;
    const topTraits = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return (
      <div className="sim-container">
        <div className="sim-result-header">
          <div className="sim-fit-score">
            <span className="sim-fit-number">{feedback.fit_score ?? 75}%</span>
            <span className="sim-fit-label">compatibilidad</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{feedback.headline}</h2>
            <p className="text-sm text-slate-500 mt-1">Análisis con IA · {simulation.title}</p>
          </div>
        </div>

        <div className="card sim-feedback-card">
          <div className="flex items-center gap-2 mb-3 text-brand-morado">
            <Brain size={18} />
            <span className="font-semibold text-sm">Análisis de tus decisiones</span>
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{feedback.narrative}</p>
        </div>

        {feedback.strengths?.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Fortalezas detectadas</h3>
            <div className="flex flex-wrap gap-2">
              {feedback.strengths.map((s) => (
                <span key={s} className="sim-trait-badge sim-trait-positive capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        {feedback.growth_areas && feedback.growth_areas.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-500 mb-3">Áreas de desarrollo</h3>
            <div className="flex flex-wrap gap-2">
              {feedback.growth_areas.map((s) => (
                <span key={s} className="sim-trait-badge sim-trait-neutral capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-500 mb-3">Perfil de rasgos</h3>
          <div className="space-y-2">
            {topTraits.map(([trait, score]) => (
              <div key={trait} className="sim-trait-bar">
                <span className="capitalize text-sm text-slate-600 w-28">{trait}</span>
                <div className="sim-trait-track">
                  <div className="sim-trait-fill" style={{ width: `${Math.min(100, Math.max(10, (score + 5) * 10))}%` }} />
                </div>
                <span className="text-sm font-medium text-brand-morado w-8 text-right">{score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sim-container">
      <div className="sim-progress-bar">
        <div className="sim-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {block.image_url && (
        <div className="sim-scene-img-wrap">
          <img src={block.image_url} alt="" className="sim-scene-img" />
          <div className="sim-scene-overlay" />
          <span className={`sim-type-badge ${typeInfo.color}`}>{typeInfo.label}</span>
        </div>
      )}

      <div className="sim-block">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Escenario {idx + 1} de {simulation.blocks.length}</span>
          {!block.image_url && <span className={`sim-type-badge-inline ${typeInfo.color}`}>{typeInfo.label}</span>}
        </div>

        {block.title && <h2 className="sim-block-title">{block.title}</h2>}
        {block.context && <p className="sim-block-context">{block.context}</p>}
        <p className="sim-block-situation">{block.situation}</p>

        <div className="sim-options">
          {block.options.map((o) => (
            <button
              key={o.value}
              disabled={busy}
              onClick={() => pick(o.value)}
              className="sim-option"
            >
              <div className="sim-option-label">{o.label}</div>
              {o.hint && <div className="sim-option-hint">{o.hint}</div>}
            </button>
          ))}
        </div>

        {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
        {busy && (
          <div className="flex items-center gap-2 mt-4 text-brand-morado text-sm">
            <Zap size={16} className="animate-pulse" /> Analizando tus decisiones con IA...
          </div>
        )}
      </div>
    </div>
  );
}

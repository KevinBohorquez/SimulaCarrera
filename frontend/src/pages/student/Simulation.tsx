import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export function SimulationPlayer() {
  const { careerId } = useParams();
  const [sp] = useSearchParams();
  const simIdQ = sp.get("sim");
  const nav = useNavigate();
  const [sim, setSim] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<Array<{ block_index: number; value: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api<any>("/api/test/start", { method: "POST" });
        setSessionId(s.session.id);
        const list = await api<any>(`/api/simulations/career/${careerId}`);
        const picked = simIdQ ? list.simulations.find((x: any) => x.id === simIdQ) : list.simulations[0];
        if (!picked) throw new Error("Sin simulaciones para esta carrera.");
        setSim(picked);
      } catch (e: any) { setErr(e.message); }
    })();
  }, [careerId, simIdQ]);

  if (err) return <AppShell title="Simulación"><p className="text-red-600">{err}</p></AppShell>;
  if (!sim) return <AppShell title="Simulación"><p>Cargando...</p></AppShell>;
  if (result) {
    return (
      <AppShell title="Resultado de la simulación">
        <div className="card max-w-2xl">
          <h2 className="text-xl mb-3">{sim.title}</h2>
          <p className="text-slate-600 mb-4">Estos son los rasgos que destacaron en tus decisiones:</p>
          <ul className="space-y-2">
            {Object.entries(result.totals).map(([k, v]: any) => (
              <li key={k} className="flex justify-between p-2 rounded bg-brand-lila/20"><span className="capitalize">{k}</span><b>{v}</b></li>
            ))}
          </ul>
          <div className="flex gap-2 mt-6">
            <button onClick={() => nav("/estudiante/carreras")} className="btn-outline">Explorar más</button>
            <button onClick={() => nav("/estudiante/test")} className="btn-primary">Continuar al test</button>
          </div>
        </div>
      </AppShell>
    );
  }

  const block = sim.blocks[idx];
  const TYPE: any = { decision: "Decisión", resolucion_tecnica: "Resolución técnica", imprevisto: "Imprevisto" };

  async function pick(value: string) {
    const next = [...choices, { block_index: idx, value }];
    setChoices(next);
    if (idx + 1 < sim.blocks.length) { setIdx(idx + 1); return; }
    setBusy(true); setErr(null);
    try {
      const r = await api<any>(`/api/simulations/${sessionId}/submit`, {
        method: "POST", body: JSON.stringify({ simulation_id: sim.id, decisions: next }),
      });
      setResult(r.result);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <AppShell title={sim.title}>
      <div className="card max-w-2xl">
        <div className="flex justify-between text-xs text-slate-500 mb-3">
          <span>Bloque {idx + 1} de {sim.blocks.length}</span>
          <span className="px-2 py-0.5 rounded bg-brand-lila/40 text-brand-morado">{TYPE[block.type] ?? block.type}</span>
        </div>
        <h2 className="text-lg mb-4">{block.situation}</h2>
        <div className="grid gap-2">
          {block.options.map((o: any) => (
            <button key={o.value} disabled={busy} onClick={() => pick(o.value)}
              className="text-left p-4 rounded-lg border border-slate-200 hover:border-brand-morado hover:bg-brand-lila/20 transition">
              {o.label}
            </button>
          ))}
        </div>
        {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
      </div>
    </AppShell>
  );
}

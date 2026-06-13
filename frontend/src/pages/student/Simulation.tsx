import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { SimulationExperience } from "@/components/SimulationExperience";
import { api } from "@/lib/api";

export function SimulationPlayer() {
  const { careerId } = useParams();
  const [sp] = useSearchParams();
  const simIdQ = sp.get("sim");
  const nav = useNavigate();
  const [sim, setSim] = useState<any>(null);
  const [sessionId, setSessionId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

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
  if (!sim) return <AppShell title="Simulación"><p className="text-slate-500">Cargando escenario...</p></AppShell>;

  return (
    <AppShell title={sim.title}>
      <SimulationExperience
        simulation={sim}
        onSubmit={async (decisions) => {
          const r = await api<any>(`/api/simulations/${sessionId}/submit`, {
            method: "POST",
            body: JSON.stringify({ simulation_id: sim.id, decisions }),
          });
          return r.result;
        }}
        onComplete={() => setComplete(true)}
      />
      {complete && (
        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => nav("/estudiante/carreras")} className="btn-outline">Explorar más carreras</button>
          <button onClick={() => nav("/estudiante/test")} className="btn-primary">Continuar test vocacional</button>
        </div>
      )}
    </AppShell>
  );
}

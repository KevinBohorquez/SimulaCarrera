import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function PeriodsAdmin() {
  const { sedeId } = useParams();
  const qStr = sedeId ? `?inst_id=${sedeId}` : "";
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["periods", sedeId], queryFn: () => api<any>(`/api/periods${qStr}`) });
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data };
      if (sedeId) payload.institution_id = sedeId;
      return api(`/api/periods${qStr}`, { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["periods"] });
      setForm({ name: "", start_date: "", end_date: "" });
    }
  });

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await mut.mutateAsync(form);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <AppShell title={sedeId ? "Ciclos de Sede" : "Ciclos académicos"}>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={create} className="card md:col-span-1">
          <h3 className="text-lg mb-3">Nuevo ciclo</h3>
          <div className="space-y-3">
            <div><label className="label">Nombre</label><input className="input" required placeholder="2026-I" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Inicio</label><input className="input" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div><label className="label">Fin</label><input className="input" type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
          <button disabled={busy} className="btn-primary w-full mt-4">{busy ? "Creando..." : "Crear"}</button>
        </form>

        <div className="md:col-span-2 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b"><tr><th className="pb-2">Ciclo</th><th>Inicio</th><th>Fin</th><th>Activo</th></tr></thead>
            <tbody>
              {q.data?.periods?.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium">{p.name}</td>
                  <td>{p.start_date}</td><td>{p.end_date}</td>
                  <td>{p.is_active ? <span className="text-green-700">Sí</span> : <span className="text-slate-400">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Calendar, Loader2, Plus } from "lucide-react";

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
    },
  });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await mut.mutateAsync(form);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const periods = q.data?.periods ?? [];

  return (
    <AppShell title={sedeId ? "Ciclos de sede" : "Ciclos academicos"}>
      {sedeId && (
        <div className="mb-5">
          <Link to={`/enterprise/sede/${sedeId}`} className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a la sede
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm mb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-morado mb-3">
          <Calendar size={13} />
          Calendario academico
        </div>
        <h2 className="text-2xl font-bold text-slate-950">Ciclos y periodos</h2>
        <p className="text-sm text-slate-500 mt-1">
          Define ventanas academicas para ordenar evaluaciones, reportes y cohortes de alumnos.
        </p>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={create} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-slate-950 mb-4">Nuevo ciclo</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Nombre</label>
              <input className="input" required placeholder="2026-I" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Inicio</label>
              <input className="input" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="label">Fin</label>
              <input className="input" type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
          <button disabled={busy} className="btn-primary w-full mt-4 inline-flex items-center gap-2">
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creando...
              </>
            ) : (
              <>
                <Plus size={16} /> Crear ciclo
              </>
            )}
          </button>
        </form>

        <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b bg-slate-50/70">
              <tr>
                <th className="px-5 py-3">Ciclo</th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Activo</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((p: any) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-purple-50/30">
                  <td className="px-5 py-4 font-medium text-slate-900">{p.name}</td>
                  <td className="px-5 py-4">{p.start_date}</td>
                  <td className="px-5 py-4">{p.end_date}</td>
                  <td className="px-5 py-4">
                    {p.is_active ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Si</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {q.isLoading && (
            <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
              <Loader2 size={18} className="animate-spin" /> Cargando ciclos...
            </div>
          )}
          {!q.isLoading && periods.length === 0 && <p className="text-center text-slate-500 py-10">Aun no hay ciclos registrados.</p>}
        </div>
      </div>
    </AppShell>
  );
}

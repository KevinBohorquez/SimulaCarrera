import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function InstitutionsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["all-inst"], queryFn: () => api<any>("/api/institutions") });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "school", plan: "starter", student_quota: 50, contact_email: "" });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await api("/api/institutions", { method: "POST", body: JSON.stringify({ ...form, student_quota: Number(form.student_quota) }) });
      setOpen(false); qc.invalidateQueries({ queryKey: ["all-inst"] });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <AppShell title="Instituciones">
      <div className="flex justify-end mb-4">
        <button onClick={() => setOpen(true)} className="btn-primary">Nueva institución</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr><th className="pb-2">Nombre</th><th>Tipo</th><th>Plan</th><th>Cuota</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {q.data?.institutions?.map((i: any) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3">{i.name}</td><td>{i.type}</td><td>{i.plan}</td><td>{i.student_quota}</td><td>{i.license_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={create} className="card max-w-md w-full">
            <h2 className="text-xl mb-4">Nueva institución</h2>
            <div className="space-y-3">
              <div><label className="label">Nombre</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Tipo</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="school">Colegio</option><option value="academy">Academia</option><option value="enterprise_network">Red Enterprise</option>
                </select>
              </div>
              <div><label className="label">Plan</label>
                <select className="input" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                  <option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div><label className="label">Cuota de alumnos</label><input className="input" type="number" required value={form.student_quota} onChange={(e) => setForm({ ...form, student_quota: Number(e.target.value) })} /></div>
              <div><label className="label">Email de contacto</label><input className="input" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
            </div>
            {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
            <div className="flex gap-2 mt-5 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancelar</button>
              <button disabled={busy} className="btn-primary">{busy ? "Creando..." : "Crear"}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}

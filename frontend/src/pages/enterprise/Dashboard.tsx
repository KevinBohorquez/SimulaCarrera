import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Edit2, X } from "lucide-react";

export function EnterpriseDashboard() {
  const queryClient = useQueryClient();
  const q = useQuery({ queryKey: ["enterprise-inst"], queryFn: () => api<any>("/api/institutions") });
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [form, setForm] = useState({ name: "", city: "", student_quota: 50, type: "school" });

  const mut = useMutation({
    mutationFn: (data: any) => {
      if (editing) return api(`/api/institutions/${editing.id}`, { method: "PATCH", body: JSON.stringify(data) });
      return api("/api/institutions", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise-inst"] });
      closeModal();
    }
  });

  const openAdd = () => { setEditing(null); setForm({ name: "", city: "", student_quota: 50, type: "school" }); setShowModal(true); };
  const openEdit = (inst: any) => { setEditing(inst); setForm({ name: inst.name, city: inst.city || "", student_quota: inst.student_quota, type: inst.type }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ ...form, student_quota: Number(form.student_quota) });
  };

  return (
    <AppShell title="Panel Enterprise">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Sedes de tu red:</p>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nueva Sede</button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {q.data?.institutions?.filter((i: any) => i.type !== "enterprise_network").map((i: any) => (
          <div key={i.id} className="card relative group">
            <h3 className="font-semibold pr-8">{i.name}</h3>
            <p className="text-sm text-slate-500">{i.city ?? "—"} · Plan {i.plan}</p>
            <p className="text-xs text-slate-400 mt-2">Cuota: {i.student_quota} alumnos</p>
            
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <button onClick={() => openEdit(i)} className="text-sm text-slate-500 hover:text-brand-morado flex items-center gap-1">
                <Edit2 size={14} /> Editar
              </button>
              <a href={`/enterprise/sede/${i.id}/alumnos`} className="btn-primary text-xs px-3 py-1.5">
                Ver Sede
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{editing ? "Editar Sede" : "Nueva Sede"}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Nombre de la Sede</label>
                <input required className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Ciudad</label>
                <input className="input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
              <div>
                <label className="label">Cupo de Alumnos</label>
                <input required type="number" min="1" className="input" value={form.student_quota} onChange={e => setForm({...form, student_quota: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="school">Colegio</option>
                  <option value="academy">Academia / Instituto</option>
                </select>
              </div>
              <button disabled={mut.isPending} className="btn-primary w-full mt-2">
                {mut.isPending ? "Guardando..." : "Guardar Sede"}
              </button>
              {mut.isError && <p className="text-red-500 text-sm mt-2">{mut.error?.message}</p>}
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export function StudentsAdmin() {
  const { sedeId } = useParams();
  const qStr = sedeId ? `?inst_id=${sedeId}` : "";
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["students", sedeId], queryFn: () => api<any>(`/api/students${qStr}`) });
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ email: "", full_name: "", password: "", grade: "", period_id: "" });
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvResult, setCsvResult] = useState<any[] | null>(null);

  function openEdit(s: any) {
    setErr(null);
    setEditing(s);
    setForm({
      email: s.email,
      full_name: s.full_name || "",
      password: "", // empty so it won't update unless typed
      grade: (Array.isArray(s.student_profiles) ? s.student_profiles[0]?.grade : s.student_profiles?.grade) || "",
      period_id: ""
    });
    setOpen(true);
  }

  function openNew() {
    setErr(null); setEditing(null);
    setForm({ email: "", full_name: "", password: "", grade: "", period_id: "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const body: any = { ...form }; if (!body.period_id) delete body.period_id;
      if (!body.password) delete body.password; // Don't send empty password if editing
      if (sedeId) body.institution_id = sedeId;

      if (editing) {
        await api(`/api/students/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/students", { method: "POST", body: JSON.stringify(body) });
      }
      
      setOpen(false); setEditing(null);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  async function uploadCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    setBusy(true); setErr(null); setCsvResult(null);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/students-csv${qStr}`, {
        method: "POST", body: fd,
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setCsvResult(json.results);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <AppShell title={sedeId ? "Alumnos de Sede" : "Alumnos"}>
      <div className="flex flex-wrap gap-2 mb-4 justify-end">
        <label className="btn-outline cursor-pointer">
          Importar CSV
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={uploadCsv} />
        </label>
        <a href="data:text/csv,email,full_name,password,grade%0Aalumno@demo.com,Nombre,Pass1234,5to" download="plantilla.csv" className="text-xs text-brand-morado underline self-center">plantilla</a>
        <button onClick={openNew} className="btn-primary">Nuevo alumno</button>
      </div>
      {err && <div className="card mb-3 text-red-600 text-sm">{err}</div>}
      {csvResult && (
        <div className="card mb-3 text-sm">
          <b>Importación:</b> {csvResult.filter((r) => r.ok).length} ok / {csvResult.filter((r) => !r.ok).length} con error.
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr><th className="pb-2">Nombre</th><th>Email</th><th>Grado</th><th>Alta</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {q.data?.students?.map((s: any) => {
              const gradeStr = (Array.isArray(s.student_profiles) ? s.student_profiles[0]?.grade : s.student_profiles?.grade) || "—";
              return (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium">{s.full_name ?? "—"}</td>
                  <td className="text-xs">{s.email}</td>
                  <td>{gradeStr}</td>
                  <td className="text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>{s.is_active ? <span className="text-green-700 text-xs">Activo</span> : <span className="text-slate-400 text-xs">Inactivo</span>}</td>
                  <td><button onClick={() => openEdit(s)} className="text-brand-morado hover:underline text-xs">Editar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {q.data?.students?.length === 0 && <p className="text-slate-400 text-center py-6">No hay alumnos registrados.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="card max-w-md w-full">
            <h2 className="text-xl mb-4">{editing ? "Editar alumno" : "Nuevo alumno"}</h2>
            <div className="space-y-3">
              <div><label className="label">Nombre completo</label><input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><label className="label">Email</label><input className="input" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div>
                <label className="label">{editing ? "Nueva contraseña (opcional)" : "Contraseña temporal"}</label>
                <input className="input" type="text" minLength={8} required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "Dejar en blanco para no cambiar" : ""} />
              </div>
              <div><label className="label">Grado</label><input className="input" placeholder="5to secundaria" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
            </div>
            {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
            <div className="flex gap-2 mt-5 justify-end">
              <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="btn-ghost">Cancelar</button>
              <button disabled={busy} className="btn-primary">{busy ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}

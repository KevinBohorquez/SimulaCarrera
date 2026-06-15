import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, API_BASE } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, FileDown, Loader2, Plus, Upload, UserRound } from "lucide-react";

export function StudentsAdmin() {
  const { sedeId } = useParams();
  const qStr = sedeId ? `?inst_id=${sedeId}` : "";
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["students", sedeId], queryFn: () => api<any>(`/api/students${qStr}`) });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ email: "", full_name: "", password: "", grade: "", period_id: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvResult, setCsvResult] = useState<any[] | null>(null);

  function openEdit(s: any) {
    setErr(null);
    setEditing(s);
    setForm({
      email: s.email,
      full_name: s.full_name || "",
      password: "",
      grade: (Array.isArray(s.student_profiles) ? s.student_profiles[0]?.grade : s.student_profiles?.grade) || "",
      period_id: "",
    });
    setOpen(true);
  }

  function openNew() {
    setErr(null);
    setEditing(null);
    setForm({ email: "", full_name: "", password: "", grade: "", period_id: "" });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const body: any = { ...form };
      if (!body.period_id) delete body.period_id;
      if (!body.password) delete body.password;
      if (sedeId) body.institution_id = sedeId;

      if (editing) {
        await api(`/api/students/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api("/api/students", { method: "POST", body: JSON.stringify(body) });
      }

      setOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    setBusy(true);
    setErr(null);
    setCsvResult(null);
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE}/api/uploads/students-csv${qStr}`, {
        method: "POST",
        body: fd,
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setCsvResult(json.results);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const students = q.data?.students ?? [];

  return (
    <AppShell title={sedeId ? "Alumnos de sede" : "Alumnos"}>
      {sedeId && (
        <div className="mb-5">
          <Link to={`/enterprise/sede/${sedeId}`} className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Volver a la sede
          </Link>
        </div>
      )}

      <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-morado mb-3">
              <UserRound size={13} />
              Gestion de alumnos
            </div>
            <h2 className="text-2xl font-bold text-slate-950">Base de estudiantes</h2>
            <p className="text-sm text-slate-500 mt-1">
              Registra alumnos individualmente o importa un CSV para cargar varios accesos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="btn-outline cursor-pointer inline-flex items-center gap-2">
              <Upload size={16} /> Importar CSV
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={uploadCsv} />
            </label>
            <a
              href="data:text/csv,email,full_name,password,grade%0Aalumno@demo.com,Nombre,Pass1234,5to"
              download="plantilla.csv"
              className="btn-ghost inline-flex items-center gap-2"
            >
              <FileDown size={16} /> Plantilla
            </a>
            <button onClick={openNew} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Nuevo alumno
            </button>
          </div>
        </div>
      </section>

      {err && <div className="rounded-xl border border-red-100 bg-red-50 mb-3 p-4 text-red-600 text-sm">{err}</div>}
      {csvResult && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 mb-3 p-4 text-sm text-emerald-700">
          <b>Importacion:</b> {csvResult.filter((r) => r.ok).length} ok / {csvResult.filter((r) => !r.ok).length} con error.
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b bg-slate-50/70">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Grado</th>
              <th className="px-5 py-3">Alta</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => {
              const gradeStr = (Array.isArray(s.student_profiles) ? s.student_profiles[0]?.grade : s.student_profiles?.grade) || "-";
              return (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-purple-50/30">
                  <td className="px-5 py-4 font-medium text-slate-900">{s.full_name ?? "-"}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{s.email}</td>
                  <td className="px-5 py-4">{gradeStr}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {s.is_active ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Activo</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">Inactivo</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(s)} className="text-brand-morado hover:underline text-xs font-semibold">
                      Editar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-10">
            <Loader2 size={18} className="animate-spin" /> Cargando alumnos...
          </div>
        )}
        {!q.isLoading && students.length === 0 && <p className="text-slate-400 text-center py-10">No hay alumnos registrados.</p>}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-950 mb-4">{editing ? "Editar alumno" : "Nuevo alumno"}</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Nombre completo</label>
                <input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" required disabled={!!editing} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">{editing ? "Nueva contrasena (opcional)" : "Contrasena temporal"}</label>
                <input
                  className="input"
                  type="text"
                  minLength={8}
                  required={!editing}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editing ? "Dejar en blanco para no cambiar" : ""}
                />
              </div>
              <div>
                <label className="label">Grado</label>
                <input className="input" placeholder="5to secundaria" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
              </div>
            </div>
            {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
            <div className="flex gap-2 mt-5 justify-end">
              <button type="button" onClick={() => { setOpen(false); setEditing(null); }} className="btn-ghost">
                Cancelar
              </button>
              <button disabled={busy} className="btn-primary">
                {busy ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}

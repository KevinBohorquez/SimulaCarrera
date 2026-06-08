import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { GraduationCap } from "lucide-react";

export function EnterpriseSignup() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", organization_name: "", contact_phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      await api("/api/auth/signup-enterprise", { method: "POST", body: JSON.stringify(form) });
      nav("/login?signup=ok");
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6">
          <GraduationCap /> SimulaCarrera
        </Link>
        <h1 className="text-2xl mb-1">Crea tu cuenta institucional</h1>
        <p className="text-sm text-slate-500 mb-6">Inicia con un plan Enterprise. Podrás agregar tus sedes después.</p>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label">Nombre completo del responsable</label>
            <input className="input" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
          <div><label className="label">Email corporativo</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Contraseña</label>
            <input className="input" type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><label className="label">Nombre de la organización / red</label>
            <input className="input" required value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} /></div>
          <div><label className="label">Teléfono (opcional)</label>
            <input className="input" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? "Creando..." : "Crear cuenta"}</button>
        </form>
        <p className="text-sm mt-4 text-slate-500">¿Ya tienes cuenta? <Link to="/login" className="text-brand-morado">Ingresar</Link></p>
      </div>
    </div>
  );
}

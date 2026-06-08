import { useState } from "react";
import { PublicNav, PublicFooter } from "./Landing";
import { api } from "@/lib/api";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await api("/api/auth/contact", { method: "POST", body: JSON.stringify(form) }); setDone(true); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen">
      <PublicNav />
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl mb-2">Hablemos</h1>
        <p className="text-slate-600 mb-8">Te respondemos en menos de 24h hábiles.</p>
        {done ? (
          <div className="card text-center">
            <p className="text-2xl mb-2">¡Mensaje enviado!</p>
            <p className="text-slate-600">Pronto nos pondremos en contacto contigo.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4">
            <div><label className="label">Nombre</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="label">Institución</label>
              <input className="input" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} /></div>
            <div><label className="label">Mensaje</label>
              <textarea className="input min-h-[120px]" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? "Enviando..." : "Enviar"}</button>
          </form>
        )}
      </section>
      <PublicFooter />
    </div>
  );
}

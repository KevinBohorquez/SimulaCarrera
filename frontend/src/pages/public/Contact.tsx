import { useState } from "react";
import { PublicNav, PublicFooter } from "./Landing";
import { api } from "@/lib/api";
import { Send, CheckCircle2, Mail, User, Building2, MessageSquare } from "lucide-react";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api("/api/auth/contact", { method: "POST", body: JSON.stringify(form) });
      setDone(true);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      <PublicNav />

      <section className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Contáctanos
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Hablemos sobre tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              institución
            </span>
          </h1>
          <p className="text-slate-600">
            Te respondemos en menos de 24h hábiles.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          {/* Panel izquierdo — info */}
          <div className="md:col-span-2 space-y-6">
            {[
              {
                icon: <Mail size={20} />,
                title: "Correo",
                body: "hola@simulacarrera.com",
              },
              {
                icon: <Building2 size={20} />,
                title: "Para instituciones",
                body: "Gestiona hasta cientos de alumnos con un solo panel.",
              },
              {
                icon: <MessageSquare size={20} />,
                title: "Soporte rápido",
                body: "Respuesta garantizada en menos de 24 horas hábiles.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="
                  flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/60 hover:border-purple-200
                  group cursor-default
                "
              >
                <div className="w-11 h-11 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-brand-morado group-hover:text-white">
                  {icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{title}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Panel derecho — formulario */}
          <div className="md:col-span-3">
            {done ? (
              <div className="bg-white rounded-2xl border border-purple-100 shadow-xl shadow-purple-100/40 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-brand-lila flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-brand-morado" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</p>
                <p className="text-slate-600">Pronto nos pondremos en contacto contigo.</p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-purple-100/30 p-8 space-y-5"
              >
                {/* Nombre */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <User size={14} className="text-brand-morado" /> Nombre
                  </label>
                  <input
                    className="input"
                    required
                    placeholder="Tu nombre completo"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Mail size={14} className="text-brand-morado" /> Email
                  </label>
                  <input
                    className="input"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                {/* Institución */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Building2 size={14} className="text-brand-morado" /> Institución
                  </label>
                  <input
                    className="input"
                    placeholder="Nombre de tu institución (opcional)"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-brand-morado" /> Mensaje
                  </label>
                  <textarea
                    className="input min-h-[130px] resize-none"
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {err && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {err}
                  </p>
                )}

                <button
                  disabled={busy}
                  className="
                    w-full py-3 rounded-lg text-sm font-semibold
                    bg-brand-morado text-white border-2 border-[#5a2fa0]
                    flex items-center justify-center gap-2
                    transition-all duration-200
                    hover:bg-[#5a2fa0] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-300/40
                    active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed
                  "
                >
                  <Send size={16} />
                  {busy ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

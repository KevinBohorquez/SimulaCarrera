import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GraduationCap } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setErr(error.message); else setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6">
          <GraduationCap /> SimulaCarrera
        </Link>
        <h1 className="text-2xl mb-1">Recuperar contraseña</h1>
        <p className="text-sm text-slate-500 mb-6">Te enviaremos un enlace al email.</p>
        {done ? (
          <p className="text-sm text-green-700">Revisa tu bandeja. Si la dirección existe, recibirás un enlace.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div><label className="label">Email</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? "Enviando..." : "Enviar enlace"}</button>
          </form>
        )}
        <div className="mt-4 text-sm"><Link to="/login" className="text-brand-morado">← Volver al login</Link></div>
      </div>
    </div>
  );
}

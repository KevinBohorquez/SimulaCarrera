import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { GraduationCap } from "lucide-react";

export function ResetPassword() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase deja la sesión de recovery en el hash; getSession la procesa.
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    if (password !== confirm) { setErr("Las contraseñas no coinciden"); setBusy(false); return; }
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else nav("/home");
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-md">
        <div className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6">
          <GraduationCap /> SimulaCarrera
        </div>
        <h1 className="text-2xl mb-6">Define tu nueva contraseña</h1>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Nueva contraseña</label>
            <input className="input" type="password" minLength={8} required value={password} onChange={(e) => setPw(e.target.value)} /></div>
          <div><label className="label">Confirmar</label>
            <input className="input" type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? "Guardando..." : "Guardar"}</button>
        </form>
      </div>
    </div>
  );
}

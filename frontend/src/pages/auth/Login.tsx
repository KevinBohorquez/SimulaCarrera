import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try { await signIn(email, password); nav("/home"); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6">
          <GraduationCap /> SimulaCarrera
        </Link>
        <h1 className="text-2xl mb-1">Bienvenido</h1>
        <p className="text-sm text-slate-500 mb-6">Inicia sesión en tu cuenta.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPw(e.target.value)} />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link to="/recuperar" className="text-brand-morado">¿Olvidaste tu contraseña?</Link>
          <Link to="/registro-enterprise" className="text-brand-morado">Crear cuenta institucional</Link>
        </div>
      </div>
    </div>
  );
}

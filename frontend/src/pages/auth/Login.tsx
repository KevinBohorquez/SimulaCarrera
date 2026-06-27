import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap } from "lucide-react";
import type { Role } from "@/contexts/AuthContext";

// Mapeo de segmento de URL → roles permitidos y etiqueta
const ROLE_CONFIG: Record<
  string,
  { allowed: Role[]; label: string; backTo: string }
> = {
  estudiante: {
    allowed: ["student"],
    label: "Estudiante",
    backTo: "/seleccionar-rol",
  },
  institucion: {
    allowed: ["institutional", "enterprise"],
    label: "Institución",
    backTo: "/seleccionar-rol",
  },
  administrador: {
    allowed: ["superadmin"],
    label: "Administrador",
    backTo: "/seleccionar-rol",
  },
};

export function Login() {
  const { signIn, signOut } = useAuth();
  const nav = useNavigate();
  const { roleType } = useParams<{ roleType?: string }>();

  const config = roleType ? ROLE_CONFIG[roleType] : null;

  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const profile = await signIn(email, password);

      // Validación de rol: si hay config de ruta, el role debe estar en la lista
      if (config && !config.allowed.includes(profile.role)) {
        // Revoca la sesión para no dejar al usuario logueado con rol incorrecto
        await signOut().catch(() => {});
        setErr(
          `Las credenciales ingresadas no corresponden a un acceso de tipo "${config.label}". Por favor usa el acceso correcto.`
        );
        setLoading(false);
        return;
      }

      nav("/home");
    } catch (e: any) {
      setErr(e.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6"
        >
          <GraduationCap /> SimulaCarrera
        </Link>

        <h1 className="text-2xl mb-1">Bienvenido</h1>
        <p className="text-sm text-slate-500 mb-6">
          {config
            ? `Ingresa tus credenciales de ${config.label}.`
            : "Inicia sesión en tu cuenta."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link to="/recuperar" className="text-brand-morado">
            ¿Olvidaste tu contraseña?
          </Link>
          {config && (
            <Link to={config.backTo} className="text-slate-400 hover:text-brand-morado">
              Cambiar tipo de acceso
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

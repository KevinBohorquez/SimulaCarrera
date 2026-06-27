import { Link } from "react-router-dom";
import { GraduationCap, Building2, User } from "lucide-react";

export function SelectRole() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-lila/40 via-white to-brand-celeste/20">
      <div className="card w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-morado font-bold text-xl mb-6"
        >
          <GraduationCap /> SimulaCarrera
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          ¿Cómo deseas ingresar?
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Selecciona el tipo de acceso que corresponde a tu cuenta.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/login/institucion"
            className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-purple-200 bg-white hover:border-brand-morado hover:bg-brand-lila/30 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-morado to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-200 shrink-0 group-hover:scale-105 transition-transform">
              <Building2 size={22} />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-base">INSTITUCIÓN</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Acceso para colegios, universidades y empresas
              </div>
            </div>
          </Link>

          <Link
            to="/login/estudiante"
            className="group flex items-center gap-4 p-5 rounded-2xl border-2 border-purple-200 bg-white hover:border-brand-morado hover:bg-brand-lila/30 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-morado to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-200 shrink-0 group-hover:scale-105 transition-transform">
              <User size={22} />
            </div>
            <div className="text-left">
              <div className="font-bold text-slate-900 text-base">ESTUDIANTE</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Acceso para explorar carreras y realizar simulaciones
              </div>
            </div>
          </Link>
        </div>

        {/* Enlace discreto para administrador */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/login/administrador"
            className="text-[10px] text-slate-300 hover:text-slate-400 transition-colors"
          >
            administrador
          </Link>
        </div>
      </div>
    </div>
  );
}

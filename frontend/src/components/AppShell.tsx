import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, GraduationCap } from "lucide-react";
import { ReactNode } from "react";

export function AppShell({ title, children, hideTitle }: { title: string; children: ReactNode; hideTitle?: boolean }) {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();

  const homeByRole: Record<string, string> = {
    superadmin: "/admin",
    enterprise: "/enterprise",
    institutional: "/institucion",
    student: "/estudiante",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-[#FAF8FE]">
      <header className="sticky top-0 z-50 bg-[#EADFFE]/95 backdrop-blur border-b border-purple-100/60 shadow-sm shadow-purple-100/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={profile ? homeByRole[profile.role] : "/"} className="flex items-center gap-2 text-brand-morado font-bold text-lg">
            <GraduationCap size={22} /> SimulaCarrera
          </Link>
          <div className="flex items-center gap-4 text-sm">
            {profile?.role === "student" && (
              <Link to="/estudiante/acerca-de-los-test" className="text-slate-600 hover:text-brand-morado font-medium">
                Acerca de los test
              </Link>
            )}
            {profile && (
              <span className="text-slate-600 hidden sm:inline">
                {profile.full_name ?? profile.email} ·{" "}
                <span className="text-brand-morado font-medium">{profile.role}</span>
              </span>
            )}
            <button onClick={async () => { await signOut(); nav("/seleccionar-rol"); }} className="btn-ghost">
              <LogOut size={16} className="mr-1" /> Salir
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!hideTitle && <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}

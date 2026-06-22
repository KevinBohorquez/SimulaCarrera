import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, GraduationCap } from "lucide-react";
import { ReactNode } from "react";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();

  const homeByRole: Record<string, string> = {
    superadmin: "/admin",
    enterprise: "/enterprise",
    institutional: "/institucion",
    student: "/estudiante",
  };

  return (
    <div className="min-h-screen bg-[#FAF8FE]">
      <header className="bg-white border-b border-slate-100">
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
            <button onClick={async () => { await signOut(); nav("/login"); }} className="btn-ghost">
              <LogOut size={16} className="mr-1" /> Salir
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}

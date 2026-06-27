import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import {
  LogOut,
  GraduationCap,
  LayoutDashboard,
  Building2,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin",                label: "Dashboard",     icon: LayoutDashboard, exact: true },
  { to: "/admin/instituciones",  label: "Instituciones", icon: Building2,       exact: false },
  { to: "/admin/pagos",          label: "Pagos",         icon: CreditCard,      exact: false },
  { to: "/admin/licencias",      label: "Licencias",     icon: ShieldAlert,     exact: false },
];

export function SuperadminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-[#FAF8FE] flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#EADFFE]/95 backdrop-blur border-b border-purple-100/60 shadow-sm shadow-purple-100/20">
        <div className="px-6 py-3.5 flex items-center justify-between">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-brand-morado font-bold text-lg hover:opacity-90 transition-opacity"
          >
            <GraduationCap size={22} />
            SimulaCarrera
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600 hidden sm:inline">
              {profile?.full_name ?? profile?.email}
              {" · "}
              <span className="text-brand-morado font-semibold">Superadmin</span>
            </span>
            <button
              onClick={async () => {
                await signOut();
                nav("/seleccionar-rol");
              }}
              className="btn-ghost flex items-center gap-1"
            >
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-purple-100/60 bg-white/50 py-6 px-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-4 mb-3">
            Administración
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-brand-morado text-white shadow shadow-purple-300/50"
                      : "text-slate-600 hover:bg-brand-lila hover:text-brand-morado"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-8 py-8 min-w-0 max-w-6xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

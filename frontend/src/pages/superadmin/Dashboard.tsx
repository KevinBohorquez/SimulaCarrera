import { AppShell } from "@/components/AppShell";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Building2, CreditCard, ShieldAlert } from "lucide-react";

export function SuperadminDashboard() {
  const inst = useQuery({ queryKey: ["all-inst"], queryFn: () => api<any>("/api/institutions") });
  const pays = useQuery({ queryKey: ["all-pays"], queryFn: () => api<any>("/api/payments") });
  const expiring = useQuery({ queryKey: ["expiring"], queryFn: () => api<any>("/api/licenses/expiring?days=30") });

  return (
    <AppShell title="Panel Superadmin">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Link to="/admin/instituciones" className="card hover:border-brand-morado/40">
          <div className="flex items-center gap-3 mb-2"><Building2 className="text-brand-morado" /><h2 className="text-lg">Instituciones</h2></div>
          <p className="text-3xl font-bold">{inst.data?.institutions?.length ?? 0}</p>
        </Link>
        <Link to="/admin/pagos" className="card hover:border-brand-morado/40">
          <div className="flex items-center gap-3 mb-2"><CreditCard className="text-brand-morado" /><h2 className="text-lg">Pagos</h2></div>
          <p className="text-3xl font-bold">{pays.data?.payments?.length ?? 0}</p>
        </Link>
        <Link to="/admin/licencias" className="card hover:border-brand-morado/40">
          <div className="flex items-center gap-3 mb-2"><ShieldAlert className="text-brand-morado" /><h2 className="text-lg">Licencias por vencer</h2></div>
          <p className="text-3xl font-bold">{expiring.data?.institutions?.length ?? 0}</p>
          <p className="text-xs text-slate-500">próximos 30 días</p>
        </Link>
      </div>
    </AppShell>
  );
}

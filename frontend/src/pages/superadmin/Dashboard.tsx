import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase";
import { Building2, CreditCard, ShieldAlert } from "lucide-react";
import { SuperadminShell } from "@/components/SuperadminShell";

export function SuperadminDashboard() {
  const { data: instCount = 0 } = useQuery({
    queryKey: ["sa-inst-count"],
    queryFn: async () => {
      const { count } = await supabaseAdmin
        .from("institutions")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: payCount = 0 } = useQuery({
    queryKey: ["sa-pay-count"],
    queryFn: async () => {
      const { count } = await supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: expiringCount = 0 } = useQuery({
    queryKey: ["sa-expiring-count"],
    queryFn: async () => {
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      const { count } = await supabaseAdmin
        .from("institutions")
        .select("id", { count: "exact", head: true })
        .eq("license_status", "active")
        .lte("license_end", in30.toISOString().split("T")[0]);
      return count ?? 0;
    },
  });

  const stats = [
    {
      to: "/admin/instituciones",
      icon: Building2,
      label: "Instituciones",
      value: instCount,
      sub: "registradas",
    },
    {
      to: "/admin/pagos",
      icon: CreditCard,
      label: "Pagos",
      value: payCount,
      sub: "registros",
    },
    {
      to: "/admin/licencias",
      icon: ShieldAlert,
      label: "Licencias por vencer",
      value: expiringCount,
      sub: "próximos 30 días",
    },
  ];

  return (
    <SuperadminShell title="Panel de control">
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map(({ to, icon: Icon, label, value, sub }) => (
          <Link
            key={to}
            to={to}
            className="card hover:border-brand-morado/50 hover:shadow-md hover:shadow-purple-100 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-brand-lila flex items-center justify-center group-hover:bg-brand-morado transition-colors">
                <Icon size={18} className="text-brand-morado group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-base font-medium text-slate-700">{label}</h2>
            </div>
            <p className="text-4xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </Link>
        ))}
      </div>
    </SuperadminShell>
  );
}

import { AppShell } from "@/components/AppShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function PaymentsAdmin() {
  const q = useQuery({ queryKey: ["all-pays"], queryFn: () => api<any>("/api/payments") });
  return (
    <AppShell title="Pagos">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr><th className="pb-2">Institución</th><th>Monto (PEN)</th><th>Periodo</th><th>Estado</th><th>Pagado</th></tr>
          </thead>
          <tbody>
            {q.data?.payments?.map((p: any) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3">{p.institutions?.name}</td>
                <td>S/ {Number(p.amount_pen).toFixed(2)}</td>
                <td className="text-xs">{p.period_start} → {p.period_end}</td>
                <td><span className={`px-2 py-0.5 rounded text-xs ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "overdue" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>{p.status}</span></td>
                <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.payments?.length === 0 && <p className="text-center text-slate-500 py-6">Sin pagos registrados aún.</p>}
      </div>
    </AppShell>
  );
}

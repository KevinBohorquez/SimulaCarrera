import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function LicensesAdmin() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["expiring"], queryFn: () => api<any>("/api/licenses/expiring?days=60") });
  const [renewId, setRenewId] = useState<string | null>(null);
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);

  async function renew() {
    if (!renewId) return;
    setBusy(true);
    try {
      await api(`/api/licenses/${renewId}/renew`, { method: "POST", body: JSON.stringify({ license_end: until }) });
      setRenewId(null); setUntil("");
      qc.invalidateQueries({ queryKey: ["expiring"] });
    } finally { setBusy(false); }
  }

  async function notify() {
    await api("/api/licenses/notify-expiring", { method: "POST" });
    alert("Notificaciones enviadas.");
  }

  return (
    <AppShell title="Licencias">
      <div className="flex justify-end mb-3">
        <button onClick={notify} className="btn-outline">Enviar avisos automáticos</button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 border-b">
            <tr><th className="pb-2">Institución</th><th>Vence</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            {q.data?.institutions?.map((i: any) => (
              <tr key={i.id} className="border-b border-slate-50 last:border-0">
                <td className="py-3 font-medium">{i.name}</td>
                <td>{i.license_end ?? "—"}</td>
                <td className="text-xs">{i.contact_email ?? "—"}</td>
                <td><button onClick={() => setRenewId(i.id)} className="text-brand-morado text-sm">Renovar</button></td>
              </tr>
            ))}
            {q.data?.institutions?.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-slate-500">No hay licencias por vencer.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {renewId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <h2 className="text-lg mb-3">Renovar licencia</h2>
            <label className="label">Nueva fecha de vencimiento</label>
            <input className="input" type="date" value={until} onChange={(e) => setUntil(e.target.value)} />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setRenewId(null)} className="btn-ghost">Cancelar</button>
              <button onClick={renew} disabled={busy || !until} className="btn-primary">{busy ? "Renovando..." : "Renovar"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

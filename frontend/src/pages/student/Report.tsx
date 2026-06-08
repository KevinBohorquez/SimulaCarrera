import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { Download } from "lucide-react";
import { useState } from "react";

export function ReportPage() {
  const { id } = useParams();
  const q = useQuery({ queryKey: ["report", id], queryFn: () => api<any>(`/api/reports/${id}`) });
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const r = await api<any>(`/api/reports/${id}/pdf`);
      window.open(r.url, "_blank");
    } finally { setDownloading(false); }
  }

  if (q.isLoading) return <AppShell title="Reporte"><p>Cargando...</p></AppShell>;
  const r = q.data?.report?.payload;
  if (!r) return <AppShell title="Reporte"><p>No encontrado.</p></AppShell>;

  return (
    <AppShell title="Tu reporte vocacional">
      <div className="flex justify-end mb-4">
        <button onClick={downloadPdf} disabled={downloading} className="btn-primary">
          <Download size={16} className="mr-1" /> {downloading ? "Generando..." : "Descargar PDF"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl mb-2">Resumen</h2>
          <p className="text-slate-700">{r.summary}</p>
        </div>

        <div className="card bg-gradient-to-br from-brand-morado to-brand-lavanda text-white">
          <p className="text-sm opacity-80 mb-1">Carrera más compatible</p>
          <h2 className="text-3xl mb-2 capitalize">{r.top_career?.name}</h2>
          <p className="opacity-90">{r.top_career?.why}</p>
        </div>

        <div className="card">
          <h3 className="text-lg mb-3">Alternativas</h3>
          <ul className="space-y-2">
            {r.alternatives?.map((a: any, i: number) => (
              <li key={i} className="p-3 rounded-lg bg-brand-lila/20">
                <div className="font-medium capitalize">{a.name}</div>
                <div className="text-sm text-slate-600">{a.why}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg mb-2">Insights cognitivos</h3>
          <p className="text-sm text-slate-700">{r.cognitive_insights}</p>
        </div>

        <div className="card">
          <h3 className="text-lg mb-3">Próximos pasos</h3>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
            {r.next_steps?.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}

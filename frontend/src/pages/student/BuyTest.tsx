import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import type { TestSessionItem } from "@/lib/test-types";
import { ArrowLeft, Brain, CheckCircle2, Sparkles, Target, Zap } from "lucide-react";

const INCLUDES = [
  { icon: Brain, title: "Inventario RIASEC", desc: "Intereses vocacionales con escala Likert (30–120 ítems)." },
  { icon: Target, title: "Perfil Holland", desc: "Código RIASEC y ranking de carreras compatibles." },
  { icon: Sparkles, title: "Simulación SJT", desc: "Juicio situacional vinculado a tu carrera principal." },
  { icon: Zap, title: "Aptitudes CAT", desc: "30 ítems adaptativos en 4 campos cognitivos." },
];

export function BuyTest() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const meta = useQuery({
    queryKey: ["test-sessions-meta"],
    queryFn: () => api<{ price_pen: number }>("/api/test/sessions"),
  });

  const price = meta.data?.price_pen ?? 35;

  async function purchase() {
    setBusy(true);
    setErr(null);
    try {
      const { session } = await api<{ session: TestSessionItem }>("/api/test/purchase", { method: "POST" });
      nav(`/estudiante/test/${session.id}`);
    } catch (e: any) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <AppShell title="Comprar evaluación vocacional">
      <Link to="/estudiante" className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado">
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="card border-brand-morado/20 overflow-hidden p-0">
          <div className="bg-gradient-to-r from-brand-morado to-brand-lavanda text-white p-8">
            <p className="text-sm text-white/80 mb-1">Crédito de evaluación</p>
            <h1 className="text-2xl font-bold mb-2">Evaluación vocacional integral</h1>
            <p className="text-white/90 text-sm max-w-lg">
              Un test completo en tu perfil: 4 etapas independientes que puedes pausar y retomar cuando quieras.
            </p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold">S/ {price.toFixed(2)}</span>
              <span className="text-sm text-white/75">por evaluación</span>
            </div>
          </div>

          <div className="p-8">
            <h2 className="font-semibold text-lg mb-4">Qué incluye</h2>
            <ul className="space-y-4 mb-8">
              {INCLUDES.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-3">
                  <CheckCircle2 className="text-brand-morado shrink-0 mt-0.5" size={18} />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Icon size={16} className="text-brand-morado" />
                      {title}
                    </div>
                    <p className="text-sm text-slate-600">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-xs text-slate-500 mb-6">
              Al confirmar la compra se agregará un test a tu perfil de inmediato. La pasarela de pagos se activará próximamente.
            </p>

            {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

            <button disabled={busy} onClick={purchase} className="btn-primary w-full py-3 text-base">
              {busy ? "Agregando a tu perfil..." : `Comprar por S/ ${price.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

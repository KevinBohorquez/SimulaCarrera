import { Link } from "react-router-dom";
import { PublicNav, PublicFooter } from "./Landing";
import { Check } from "lucide-react";

const plans = [
  { key: "starter", name: "Starter", price: "S/. 290 / mes", quota: "Hasta 50 alumnos",
    features: ["Test completo con IA", "Panel admin", "Reportes en PDF", "1 ciclo académico"] },
  { key: "pro", name: "Pro", price: "S/. 690 / mes", quota: "Hasta 200 alumnos", highlight: true,
    features: ["Todo lo del Starter", "Múltiples ciclos", "Exportación masiva", "Soporte prioritario"] },
  { key: "enterprise", name: "Enterprise", price: "A medida", quota: "Red de sedes ilimitada",
    features: ["Multi-sede / multi-institución", "API y SSO", "Onboarding dedicado", "SLA"] },
];

export function Pricing() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl text-center mb-3">Planes pensados para tu institución</h1>
        <p className="text-center text-slate-600 mb-12">Sin sorpresas. Paga solo por la cuota de alumnos que necesitas.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.key} className={`card ${p.highlight ? "ring-2 ring-brand-morado" : ""}`}>
              {p.highlight && <div className="text-xs font-medium text-brand-morado mb-2">Más popular</div>}
              <h3 className="text-xl">{p.name}</h3>
              <div className="text-3xl font-bold mt-2 mb-1">{p.price}</div>
              <p className="text-xs text-slate-500 mb-4">{p.quota}</p>
              <ul className="space-y-2 text-sm mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check size={16} className="text-brand-morado mt-0.5" /> {f}</li>
                ))}
              </ul>
              <Link to="/contacto" className="btn-primary w-full text-center block">Contactar ventas</Link>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

import { Link } from "react-router-dom";
import { PublicNav, PublicFooter } from "./Landing";
import { Check, Zap, Star, Rocket, Building2 } from "lucide-react";

const plans = [
  {
    key: "starter",
    icon: <Zap size={22} />,
    name: "Starter",
    price: "S/ 1 800",
    period: "por año",
    quota: "Hasta 60 alumnos",
    highlight: false,
    badge: "",
    features: [
      "Test completo con IA",
      "Panel administrador",
      "Reportes en PDF",
      "1 ciclo académico",
      "Soporte por correo",
    ],
  },
  {
    key: "estandar",
    icon: <Star size={22} />,
    name: "Estándar",
    price: "S/ 3 500",
    period: "por año",
    quota: "Hasta 150 alumnos",
    highlight: false,
    badge: "",
    features: [
      "Todo lo del Starter",
      "Múltiples ciclos",
      "Exportación masiva CSV",
      "Comparativa entre grupos",
      "Soporte prioritario",
    ],
  },
  {
    key: "pro",
    icon: <Rocket size={22} />,
    name: "Pro",
    price: "S/ 5 000",
    period: "por año",
    quota: "Hasta 300 alumnos",
    highlight: true,
    badge: "Más popular",
    features: [
      "Todo lo del Estándar",
      "Simulaciones ilimitadas",
      "Dashboard analytics avanzado",
      "Integración LMS",
      "Soporte 24/7",
    ],
  },
  {
    key: "enterprise",
    icon: <Building2 size={22} />,
    name: "Enterprise",
    price: "Precio",
    period: "negociado",
    quota: "Más de 300 alumnos",
    highlight: false,
    badge: "",
    features: [
      "Multi-sede / multi-institución",
      "API y SSO personalizados",
      "Onboarding dedicado",
      "SLA garantizado",
      "Gestor de cuenta exclusivo",
    ],
  },
];

export function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      <PublicNav />
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Planes y precios
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Planes pensados para tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              institución
            </span>
          </h1>
          <p className="text-slate-600">
            Sin sorpresas. Paga solo por la cuota de alumnos que necesitas.
          </p>
        </div>

        {/* Grid de 4 planes */}
        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.key}
              className={`
                relative flex flex-col rounded-2xl border p-6 transition-all duration-300
                cursor-default
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-200/60
                group
                ${
                  p.highlight
                    ? "border-brand-morado ring-2 ring-brand-morado bg-white shadow-lg shadow-purple-200/40"
                    : "border-slate-200 bg-white hover:border-brand-morado/40"
                }
              `}
            >
              {/* Badge "Más popular" */}
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-morado text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                    {p.badge}
                  </span>
                </div>
              )}

              {/* Ícono */}
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                  ${p.highlight
                    ? "bg-brand-morado text-white"
                    : "bg-brand-lila text-brand-morado group-hover:bg-brand-morado group-hover:text-white"
                  }
                `}
              >
                {p.icon}
              </div>

              {/* Nombre */}
              <h3 className="text-lg font-bold text-slate-900 mb-1">{p.name}</h3>

              {/* Precio */}
              <div className="mt-1 mb-0.5">
                <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">{p.period}</p>

              {/* Cuota */}
              <p className="text-sm font-medium text-brand-morado bg-brand-lila/50 rounded-lg px-3 py-1.5 mb-5 text-center">
                {p.quota}
              </p>

              {/* Features */}
              <ul className="space-y-2.5 text-sm text-slate-600 mb-7 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 transition-colors duration-300 ${
                        p.highlight ? "text-brand-morado" : "text-brand-morado group-hover:text-brand-morado"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/contacto"
                className={`
                  w-full text-center block rounded-lg px-4 py-2.5 text-sm font-semibold
                  border-2 transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md
                  ${p.highlight
                    ? "bg-brand-morado text-white border-[#5a2fa0] hover:bg-[#5a2fa0] hover:shadow-purple-300/40"
                    : "bg-white text-brand-morado border-[#7044BF] hover:bg-brand-lila/60 hover:border-[#5a2fa0]"
                  }
                `}
              >
                {p.key === "enterprise" ? "Contactar ventas" : "Comenzar ahora"}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

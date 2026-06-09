import { PublicNav, PublicFooter } from "./Landing";
import { ClipboardList, BookOpen, Play, Brain, FileText } from "lucide-react";

const steps = [
  {
    n: 1,
    icon: <ClipboardList size={24} />,
    title: "Diagnóstico inicial",
    body: "3–5 minutos. Cuestionario adaptativo de intereses, aptitudes y valores. La IA genera un ranking preliminar de 4–6 carreras.",
    accent: "from-[#7044BF] to-[#5A2FA0]",
  },
  {
    n: 2,
    icon: <BookOpen size={24} />,
    title: "Exploración informada",
    body: "Revisas fichas de realidad profesional: salarios, empleabilidad, universidades, costos y proyección de demanda.",
    accent: "from-[#7044BF] to-[#5A2FA0]",
  },
  {
    n: 3,
    icon: <Play size={24} />,
    title: "Simulación interactiva",
    body: "15–20 minutos. Vives un día en la carrera tomando decisiones que reflejan el trabajo real.",
    accent: "from-[#7044BF] to-[#5A2FA0]",
  },
  {
    n: 4,
    icon: <Brain size={24} />,
    title: "Test cognitivo adaptativo",
    body: "10–15 minutos. Capacidades verbales, numéricas, abstractas y espaciales evaluadas con precisión.",
    accent: "from-[#7044BF] to-[#5A2FA0]",
  },
  {
    n: 5,
    icon: <FileText size={24} />,
    title: "Reporte final",
    body: "Reporte personalizado con tu carrera más compatible, alternativas, insights cognitivos y próximos pasos. Descargable en PDF.",
    accent: "from-[#7044BF] to-[#5A2FA0]",
  },
];

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      <PublicNav />

      <section className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            El proceso
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Cómo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              funciona
            </span>
          </h1>
          <p className="text-slate-600">
            5 etapas, ~45 minutos en total. El alumno avanza a su ritmo.
          </p>
        </div>

        {/* Línea de tiempo vertical */}
        <div className="relative">
          {/* Línea conectora */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 via-purple-200 to-fuchsia-200 hidden md:block" />

          <div className="space-y-6">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative flex gap-6 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Número / ícono */}
                <div
                  className={`
                    relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl
                    bg-gradient-to-br ${s.accent} text-white
                    flex items-center justify-center shadow-lg
                    transition-all duration-300
                    group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-purple-300/40
                  `}
                >
                  {s.icon}
                </div>

                {/* Card */}
                <div
                  className="
                    flex-1 bg-white rounded-2xl border border-slate-100 p-6
                    transition-all duration-300
                    group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-purple-100/60
                    group-hover:border-purple-200
                  "
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-brand-morado bg-brand-lila/60 px-2 py-0.5 rounded-full">
                      Paso {s.n}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

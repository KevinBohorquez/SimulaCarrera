import { Link } from "react-router-dom";
import { PublicNav, PublicFooter } from "./Landing";
import {
  ClipboardList,
  BookOpen,
  Play,
  Brain,
  FileText,
  Clock,
  Layers,
  UserCheck,
  ArrowUpRight,
  Users,
  BarChart3,
  Upload,
  type LucideIcon,
} from "lucide-react";

import imgTestAdaptativo from "../../assets/carousel-test-adaptativo.png";
import imgSimulacion from "../../assets/carousel-simulacion.png";
import imgReporte from "../../assets/carousel-reporte.png";

type Step = {
  n: number;
  icon: LucideIcon;
  duration: string;
  title: string;
  body: string;
  image?: string;
};

const steps: Step[] = [
  {
    n: 1,
    icon: ClipboardList,
    duration: "3–5 min",
    title: "Diagnóstico inicial",
    body: "Cuestionario adaptativo de intereses, aptitudes y valores. La IA genera un ranking preliminar de 4–6 carreras compatibles con el perfil del alumno.",
    image: imgTestAdaptativo,
  },
  {
    n: 2,
    icon: BookOpen,
    duration: "5–10 min",
    title: "Exploración informada",
    body: "Fichas de realidad profesional con salarios INEI, empleabilidad MTPE, universidades SUNEDU, costos de estudio y proyección de demanda laboral.",
  },
  {
    n: 3,
    icon: Play,
    duration: "15–20 min",
    title: "Simulación interactiva",
    body: "El alumno vive un día en la carrera tomando decisiones que reflejan el trabajo real, con escenarios generados por IA según el perfil vocacional.",
    image: imgSimulacion,
  },
  {
    n: 4,
    icon: Brain,
    duration: "10–15 min",
    title: "Test cognitivo adaptativo",
    body: "Evaluación de capacidades verbales, numéricas, abstractas y espaciales. El sistema adapta la dificultad según las respuestas del alumno.",
  },
  {
    n: 5,
    icon: FileText,
    duration: "Al finalizar",
    title: "Reporte final",
    body: "Informe personalizado con carrera principal, alternativas, insights cognitivos y próximos pasos concretos. Descargable en PDF para el alumno y la institución.",
    image: imgReporte,
  },
];

const highlights = [
  { icon: Clock, label: "~45 min en total", sub: "El alumno avanza a su ritmo" },
  { icon: Layers, label: "5 etapas guiadas", sub: "Proceso estructurado y claro" },
  { icon: UserCheck, label: "Avalado COP", sub: "Metodología con psicólogo colegiado" },
];

const institutional = [
  {
    icon: Users,
    title: "Dashboard para tutores",
    body: "Monitorea el progreso de cada alumno y detecta quién necesita acompañamiento.",
  },
  {
    icon: BarChart3,
    title: "Reporte grupal por ciclo",
    body: "Visión agregada de tendencias vocacionales y compatibilidad por grupo o sede.",
  },
  {
    icon: Upload,
    title: "Carga masiva por CSV",
    body: "Registra cientos de alumnos en minutos sin trabajo manual repetitivo.",
  },
];

const DEMO_MESSAGE =
  "Quiero saber más sobre cómo contratar SimulaCarrera para mi institución";

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      <PublicNav />

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            El proceso
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Cómo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              funciona
            </span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Un recorrido vocacional integral en cinco etapas. Datos reales del mercado
            laboral peruano y simulaciones con IA, avalados por metodología psicológica.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-12">
          {highlights.map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="bg-white/80 border border-slate-100 rounded-2xl p-4 text-center shadow-sm shadow-purple-100/30 hover:border-purple-200 hover:shadow-md transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center mx-auto mb-3">
                <Icon size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center justify-between mb-10 px-2">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-brand-morado text-white text-xs font-bold flex items-center justify-center shadow-md shadow-purple-200/50">
                  {s.n}
                </div>
                <span className="text-[10px] text-slate-500 font-medium max-w-[72px] text-center leading-tight">
                  {s.title.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-gradient-to-r from-brand-morado/40 to-brand-lavanda/40 rounded-full" />
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute left-[27px] md:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-morado/30 via-brand-lavanda/40 to-brand-celeste/30 hidden sm:block" />

          <div className="space-y-5">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <article key={s.n} className="relative flex gap-4 sm:gap-6 group">
                  <div
                    className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7044BF] to-[#5A2FA0] text-white flex items-center justify-center shadow-lg shadow-purple-200/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-purple-300/40"
                  >
                    <Icon size={22} />
                  </div>

                  <div
                    className="flex-1 bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-purple-100/60 group-hover:border-purple-200"
                  >
                    <div className={s.image ? "grid md:grid-cols-5" : ""}>
                      <div className={`p-5 sm:p-6 ${s.image ? "md:col-span-3" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-brand-morado bg-brand-lila/60 px-2.5 py-0.5 rounded-full">
                            Paso {s.n}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full">
                            <Clock size={11} />
                            {s.duration}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h2>
                        <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
                      </div>

                      {s.image && (
                        <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-violet-100/80 flex items-center justify-center p-6 min-h-[140px] border-t md:border-t-0 md:border-l border-slate-100">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="max-h-32 md:max-h-40 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              Para instituciones
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Más que un test: una plataforma de orientación
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Tutores y directivos tienen visibilidad completa del proceso sin interrumpir
              la experiencia del alumno.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {institutional.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-5 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-[#F8F4FF]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/50 hover:border-purple-200 group"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-brand-morado group-hover:text-white">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="rounded-2xl p-8 sm:p-10 bg-gradient-to-br from-brand-morado via-[#5A2FA0] to-brand-lavanda shadow-xl shadow-purple-300/30 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            ¿Listo para orientar a tus alumnos?
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto mb-6">
            Solicita una demo gratuita o revisa el precio por alumno. Sin contratos
            ocultos ni sorpresas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/contacto"
              state={{ message: DEMO_MESSAGE }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-white text-brand-morado border-2 border-white transition-all duration-200 hover:bg-purple-50 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Solicitar demo gratuita
              <ArrowUpRight size={16} />
            </Link>
            <Link
              to="/precios"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border-2 border-white/40 text-white transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5"
            >
              Ver planes y precios
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ArrowLeft, Brain, FileCheck, Layers, Sparkles, Target, Zap } from "lucide-react";

const STEPS = [
  {
    icon: Brain,
    title: "Paso 1 · Intereses vocacionales (RIASEC)",
    summary:
      "Inventario de preferencias basado en el modelo Holland (RIASEC). Respondes actividades con una escala Likert de 5 puntos.",
    points: [
      "Puedes elegir 30, 60, 90 (recomendado) o 120 preguntas. A más ítems, mayor precisión y menor margen de error.",
      "Las preguntas se sortean al azar desde un banco de 300 ítems, con la misma cantidad por cada dimensión (R, I, A, S, E, C).",
      "El resultado es tu código Holland: las tres dimensiones donde mostraste mayor afinidad.",
    ],
  },
  {
    icon: Target,
    title: "Paso 2 · Perfil Holland y carreras",
    summary:
      "Con tu código RIASEC calculamos compatibilidad con carreras del catálogo mediante un algoritmo determinista (no al azar).",
    points: [
      "Cada carrera tiene un código Holland de referencia; tu perfil se compara letra por letra e intensidad por dimensión.",
      "Obtienes un ranking ordenado con porcentajes de afinidad diferenciados.",
    ],
  },
  {
    icon: Sparkles,
    title: "Paso 3 · Simulación situacional (SJT)",
    summary:
      "Escenarios laborales de tu carrera principal. En cada dilema eliges la acción más y la menos efectiva.",
    points: [
      "Mide criterio profesional (puntuación SJT) y rasgos de personalidad (modelo Big Five) en un solo módulo.",
      "Los escenarios están calibrados con estándares O*NET y validación de expertos.",
      "Duración estimada: 15–20 minutos.",
    ],
  },
  {
    icon: Zap,
    title: "Paso 4 · Aptitudes cognitivas (CAT)",
    summary:
      "Test adaptativo de 30 preguntas que ajusta la dificultad según tus respuestas (modelo Rasch / TRI).",
    points: [
      "Evalúa razonamiento verbal, numérico, abstracto-espacial y comprensión mecánica.",
      "Si aciertas, la siguiente pregunta es más difícil; si fallas, baja el nivel. Así se estima tu habilidad con menos ítems.",
      "El resultado se expresa en percentiles respecto a la población estudiantil.",
    ],
  },
];

export function AboutTests() {
  return (
    <AppShell title="Acerca de los test">
      <Link
        to="/estudiante"
        className="inline-flex items-center gap-1 text-sm text-slate-500 mb-6 hover:text-brand-morado"
      >
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="card bg-gradient-to-br from-brand-lila/40 to-brand-celeste/20 border-brand-morado/15">
          <div className="flex items-start gap-3">
            <Layers className="text-brand-morado shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Evaluación vocacional integral</h2>
              <p className="text-slate-700 text-sm leading-relaxed">
                SimulaCarrera combina cuatro etapas con respaldo psicométrico: intereses, compatibilidad
                profesional, juicio situacional y aptitudes cognitivas. Los resultados se integran en un
                reporte certificado que puedes compartir en tutorías o con tu familia.
              </p>
            </div>
          </div>
        </div>

        <div className="card border-green-200 bg-green-50/40">
          <div className="flex gap-3">
            <FileCheck className="text-green-700 shrink-0" size={22} />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">¿Por qué confiar en estos resultados?</h3>
              <p className="text-sm text-green-900/80 leading-relaxed">
                Los instrumentos usan modelos reconocidos internacionalmente (Holland, Big Five, SJT, TRI/Rasch).
                El banco de preguntas RIASEC y los escenarios SJT pasan validación de expertos. Cada reporte PDF
                incluye la firma del psicólogo educativo asesor de la plataforma (C.Ps.P.), quien supervisa la
                calibración metodológica. La narrativa final puede apoyarse en IA (Groq) usando únicamente tus
                datos numéricos y tablas de mercado laboral — sin inventar resultados.
              </p>
            </div>
          </div>
        </div>

        {STEPS.map(({ icon: Icon, title, summary, points }) => (
          <section key={title} className="card">
            <div className="flex items-center gap-2 text-brand-morado mb-3">
              <Icon size={20} />
              <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
            </div>
            <p className="text-slate-700 text-sm mb-4">{summary}</p>
            <ul className="space-y-2">
              {points.map((p) => (
                <li key={p} className="text-sm text-slate-600 flex gap-2">
                  <span className="text-brand-morado shrink-0">·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="card border-brand-morado/20">
          <h3 className="font-semibold text-lg mb-2">Reporte final</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Al completar las cuatro etapas, el sistema cruza intereses, conducta, aptitudes y datos del mercado
            laboral peruano (salarios, demanda, universidades) para generar tu PDF. Puedes descargarlo desde la
            vista del reporte. Si la IA está activa, el texto interpretativo se genera en segundos; los números
            y rankings siempre provienen del motor determinista del backend.
          </p>
        </section>
      </div>
    </AppShell>
  );
}

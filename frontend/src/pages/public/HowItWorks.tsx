import { PublicNav, PublicFooter } from "./Landing";

const steps = [
  { n: 1, title: "Diagnóstico inicial", body: "3-5 minutos. Cuestionario adaptativo de intereses, aptitudes y valores. La IA genera un ranking preliminar de 4-6 carreras." },
  { n: 2, title: "Exploración informada", body: "Revisas fichas de realidad profesional: salarios, empleabilidad, universidades, costos y proyección de demanda." },
  { n: 3, title: "Simulación interactiva", body: "15-20 minutos. Vives un día en la carrera tomando decisiones que reflejan el trabajo real." },
  { n: 4, title: "Test cognitivo adaptativo", body: "10-15 minutos. Capacidades verbales, numéricas, abstractas y espaciales." },
  { n: 5, title: "Reporte final", body: "Reporte personalizado con tu carrera más compatible, alternativas, insights cognitivos y próximos pasos. Descargable en PDF." },
];

export function HowItWorks() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl mb-2 text-center">Cómo funciona</h1>
        <p className="text-center text-slate-600 mb-12">5 etapas, ~45 minutos en total. El alumno avanza a su ritmo.</p>
        <div className="space-y-4">
          {steps.map((s) => (
            <div key={s.n} className="card flex gap-5">
              <div className="w-12 h-12 rounded-full bg-brand-lila text-brand-morado flex items-center justify-center text-xl font-bold flex-shrink-0">{s.n}</div>
              <div>
                <h3 className="text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}

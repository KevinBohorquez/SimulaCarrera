import { Link } from "react-router-dom";
import { GraduationCap, Sparkles, Target, Users } from "lucide-react";

function PublicNav() {
  return (
    <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-brand-morado font-bold text-lg">
        <GraduationCap /> SimulaCarrera
      </Link>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <Link to="/como-funciona" className="text-slate-600 hover:text-brand-morado">Cómo funciona</Link>
        <Link to="/precios" className="text-slate-600 hover:text-brand-morado">Precios</Link>
        <Link to="/contacto" className="text-slate-600 hover:text-brand-morado">Contacto</Link>
        <div className="flex gap-2">
          <Link to="/login" className="btn-outline">Acceso Instituciones</Link>
          <Link to="/login" className="btn-primary">Entrar como estudiante</Link>
        </div>
      </nav>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-slate-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-4 text-sm text-slate-500">
        <div>© {new Date().getFullYear()} SimulaCarrera</div>
        <div className="flex gap-4">
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/precios">Precios</Link>
          <Link to="/contacto">Contacto</Link>
        </div>
        <div className="md:text-right">
          <Link to="/login" className="hover:text-brand-morado">Acceder</Link>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen">
      <PublicNav />
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-lila text-brand-morado px-3 py-1 rounded-full text-xs font-medium mb-6">
          <Sparkles size={14} /> Orientación vocacional con IA
        </div>
        <h1 className="text-5xl md:text-6xl text-slate-900 max-w-3xl mx-auto leading-tight">
          Descubre tu carrera con <span className="text-brand-morado">simulaciones reales</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
          Diagnóstico inteligente, simulaciones interactivas y un reporte personalizado con universidades, costos y proyección laboral.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/login" className="btn-primary px-6 py-3">Entrar como estudiante</Link>
          <Link to="/registro-enterprise" className="btn-outline px-6 py-3">Soy institución</Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        <Feature icon={<Target />} title="Test adaptativo" body="La IA personaliza las preguntas según tus respuestas." />
        <Feature icon={<Sparkles />} title="Simulación interactiva" body="Vive un día en la carrera y toma decisiones reales." />
        <Feature icon={<Users />} title="Reporte accionable" body="Universidades, costos, empleabilidad y próximos pasos." />
      </section>

      <PublicFooter />
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card">
      <div className="w-10 h-10 rounded-lg bg-brand-lila text-brand-morado flex items-center justify-center mb-3">{icon}</div>
      <h3 className="text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}

export { PublicNav, PublicFooter };

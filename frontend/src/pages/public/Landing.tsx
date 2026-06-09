import { Link } from "react-router-dom";
import { GraduationCap, Sparkles, Target, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// ──────────────── Assets ────────────────
import heroBrain from "../../assets/hero-brain.png";
import imgTestAdaptativo from "../../assets/carousel-test-adaptativo.png";
import imgSimulacion from "../../assets/carousel-simulacion.png";
import imgReporte from "../../assets/carousel-reporte.png";

// ──────────────── Nav ────────────────
function PublicNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#EADFFE]/95 backdrop-blur shadow-lg shadow-purple-900/30"
          : "bg-[#EADFFE]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-brand-morado font-bold text-lg hover:opacity-90 transition-opacity"
        >
          <GraduationCap className="text-purple-600" />
          <span>SimulaCarrera</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {[
            { to: "/como-funciona", label: "Cómo funciona" },
            { to: "/precios", label: "Precios" },
            { to: "/contacto", label: "Contacto" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-slate-600 hover:text-brand-morado transition-colors relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-morado transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          ))}

          <div className="flex gap-3 ml-2">
            <Link
              to="/login"
              className="btn-outline"
            >
              Acceso Instituciones
            </Link>
            <Link
              to="/login"
              className="btn-primary"
            >
              Entrar como estudiante
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ──────────────── Hero ────────────────
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!imageRef.current || !heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateZ(20px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!imageRef.current) return;
    imageRef.current.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#FAF8FE] via-[#FAF8FE] to-[#FAF8FE] min-h-[88vh] flex items-center"
    >
      {/* Blobs decorativos */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Texto izquierda */}
        <div className="text-left space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-purple-200 text-brand-morado px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            <Sparkles size={13} />
            Orientación vocacional con IA
          </div>

          <h1 className="text-5xl md:text-6xl text-slate-900 leading-tight font-bold">
            Descubre tu carrera con{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              simulaciones reales
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Diagnóstico inteligente, simulaciones interactivas y un reporte personalizado con
            universidades, costos y proyección laboral.
          </p>

          <div className="flex gap-4 pt-2">
            <Link to="/login" className="btn-hero-primary group">
              Entrar como estudiante
              <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
            <Link to="/registro-enterprise" className="btn-hero-outline">
              Soy institución
            </Link>
          </div>

          {/* Stats rápidos */}
          <div className="flex gap-8 pt-4 border-t border-purple-100">
            {[
              { num: "10K+", label: "Estudiantes" },
              { num: "95%", label: "Satisfacción" },
              { num: "200+", label: "Carreras" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-brand-morado">{num}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen derecha con efecto 3D al cursor */}
        <div className="flex justify-center items-center animate-fade-in-right">
          <div
            ref={imageRef}
            className="relative transition-transform duration-200 ease-out cursor-pointer"
            style={{ willChange: "transform" }}
          >
            {/* Glow detrás */}
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl scale-90" />
            <img
              src={heroBrain}
              alt="Carreras profesionales con IA"
              className="relative w-full max-w-xl drop-shadow-2xl select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────── Carousel ────────────────
const carouselSlides = [
  {
    icon: <Target size={28} />,
    title: "Test adaptativo",
    body: "La IA personaliza las preguntas según tus respuestas, garantizando un diagnóstico vocacional preciso y único para ti.",
    image: imgTestAdaptativo,
    accent: "from-purple-500 to-purple-600",
    badge: "Paso 1",
  },
  {
    icon: <Sparkles size={28} />,
    title: "Simulación interactiva",
    body: "Vive un día completo en la carrera de tu elección. Toma decisiones reales y descubre si es tu camino ideal.",
    image: imgSimulacion,
    accent: "from-purple-500 to-purple-600",
    badge: "Paso 2",
  },
  {
    icon: <Users size={28} />,
    title: "Reporte accionable",
    body: "Recibe un informe detallado con universidades, costos, empleabilidad y los próximos pasos personalizados para ti.",
    image: imgReporte,
    accent: "from-purple-500 to-purple-600",
    badge: "Paso 3",
  },
];

function FeatureCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (dir: "prev" | "next") => {
      if (isAnimating) return;
      setIsAnimating(true);
      setDirection(dir === "next" ? "right" : "left");
      setTimeout(() => {
        setCurrent((c) =>
          dir === "next" ? (c + 1) % carouselSlides.length : (c - 1 + carouselSlides.length) % carouselSlides.length
        );
        setIsAnimating(false);
      }, 350);
    },
    [isAnimating]
  );

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => go("next"), 4500);
  }, [go]);

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [startAuto]);

  const slide = carouselSlides[current];

  return (
    <section className="bg-gradient-to-b from-[#F8F4FF] to-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            ¿Cómo funciona?
          </span>
          <h2 className="text-4xl font-bold text-slate-900">
            Tres pasos para descubrir tu{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              carrera ideal
            </span>
          </h2>
        </div>

        <div className="relative">
          {/* Card principal */}
          <div
            key={current}
            className={`carousel-card ${isAnimating ? (direction === "right" ? "slide-exit-left" : "slide-exit-right") : "slide-enter"}`}
          >
            <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="grid md:grid-cols-2 min-h-[380px]">
                {/* Panel imagen */}
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-8">
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-10`} />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="relative z-12 max-h-66 object-contain drop-shadow-xl transition-transform duration-500 hover:scale-105"
                  />
                  {/* Badge */}
                  <span className={`absolute top-4 left-4 bg-gradient-to-r ${slide.accent} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
                    {slide.badge}
                  </span>
                </div>

                {/* Panel texto */}
                <div className="flex flex-col justify-center p-10 gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${slide.accent} text-white flex items-center justify-center shadow-lg shadow-purple-200`}>
                    {slide.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{slide.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-base">{slide.body}</p>
                  <Link
                    to="/como-funciona"
                    className="inline-flex items-center gap-2 text-brand-morado font-semibold text-sm hover:gap-3 transition-all"
                  >
                    Saber más <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <button
            onClick={() => { go("prev"); startAuto(); }}
            className="carousel-btn carousel-btn-left"
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => { go("next"); startAuto(); }}
            className="carousel-btn carousel-btn-right"
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {carouselSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? "right" : "left"); setCurrent(i); startAuto(); }}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-8 h-3 bg-brand-morado"
                  : "w-3 h-3 bg-purple-200 hover:bg-purple-300"
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────── Footer ────────────────
function PublicFooter() {
  return (
    <footer className="bg-[#EADFFE] text-purple-200">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-6 text-sm">
        <div className="flex items-center gap-2 font-bold text-purple-600 text-base">
          <GraduationCap size={20} />
          SimulaCarrera
        </div>
        <div className="flex gap-6 flex-wrap">
          <Link to="/como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link>
          <Link to="/precios" className="hover:text-white transition-colors">Precios</Link>
          <Link to="/contacto" className="hover:text-white transition-colors">Contacto</Link>
        </div>
        <div className="md:text-right text-purple-400">
          © {new Date().getFullYear()} SimulaCarrera
        </div>
      </div>
    </footer>
  );
}

// ──────────────── Page ────────────────
export function Landing() {
  return (
    <div className="min-h-screen font-sans">
      <PublicNav />
      <HeroSection />
      <FeatureCarousel />
      <PublicFooter />
    </div>
  );
}

export { PublicNav, PublicFooter };

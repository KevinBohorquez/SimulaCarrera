import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicNav, PublicFooter } from "./Landing";
import {
  Brain,
  BarChart3,
  Play,
  FileText,
  Users,
  GraduationCap,
  Upload,
  LineChart,
  PiggyBank,
  BadgeCheck,
  ShieldCheck,
  Database,
  Lock,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

const PROPOSAL_PDF_URL = "/propuesta-simulacarrera.pdf";
const PROPOSAL_PDF_NAME = "SimulaCarrera-Propuesta-Institucional.pdf";
const PPA = 20;
const TRAD = 70;
const DEMO_MESSAGE =
  "Quiero saber más sobre cómo contratar SimulaCarrera para mi institución";

const features = [
  { icon: Brain, text: "Diagnóstico adaptativo de intereses y perfil" },
  { icon: BarChart3, text: "Datos reales: salarios INEI · MTPE · SUNEDU" },
  { icon: Play, text: "Simulación interactiva de un día laboral con IA" },
  { icon: FileText, text: "Reporte PDF descargable por alumno" },
  { icon: Users, text: "Dashboard para tutores y directivos" },
  { icon: GraduationCap, text: "Universidades e institutos con costos reales" },
  { icon: Upload, text: "Carga masiva de alumnos por CSV" },
  { icon: LineChart, text: "Reporte grupal por ciclo para la institución" },
];

const comparisons = [
  {
    label: "Test gratuito online",
    price: "S/ 0",
    tag: "Sin psicólogo · sin datos reales",
    highlight: false,
  },
  {
    label: "SimulaCarrera",
    price: "S/ 20",
    tag: "Mejor relación valor/precio",
    highlight: true,
  },
  {
    label: "Orientación privada individual",
    price: "S/ 99–220",
    tag: "Por alumno, sin escala",
    highlight: false,
  },
];

const trustItems = [
  { icon: ShieldCheck, text: "Psicólogo colegiado COP" },
  { icon: Database, text: "Fuentes INEI · SUNEDU · MTPE" },
  { icon: Lock, text: "Datos protegidos con RLS" },
  { icon: RefreshCw, text: "Datos actualizados anualmente" },
];

function formatSoles(n: number) {
  return `S/ ${n.toLocaleString("es-PE")}`;
}

export function Pricing() {
  const [students, setStudents] = useState(100);

  const total = students * PPA;
  const saving = students * (TRAD - PPA);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F4FF] to-white">
      <PublicNav />

      <section className="max-w-3xl mx-auto px-6 py-16">
        {/* Header — mismo patrón que Contact / HowItWorks */}
        <div className="text-center mb-10">
          <span className="inline-block bg-brand-lila text-brand-morado text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            Planes y precios
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Orientación profesional que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7044BF] to-[#A855F7]">
              vale la inversión
            </span>
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Un único precio, sin sorpresas. Cada institución paga exactamente por los
            alumnos que orienta — ni más, ni menos.
          </p>
        </div>

        {/* Calculadora */}
        <div className="bg-white/80 border border-slate-100 rounded-2xl p-6 mb-6 shadow-sm shadow-purple-100/40">
          <p className="text-sm text-slate-500 mb-2">
            ¿Cuántos alumnos tiene tu institución?
          </p>
          <div className="flex items-center gap-3 mb-5">
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="flex-1 accent-brand-morado h-2 cursor-pointer"
            />
            <span className="text-sm font-semibold text-slate-900 min-w-[72px] text-right">
              {students} alumnos
            </span>
          </div>

          <div className="bg-gradient-to-b from-[#F8F4FF] to-white border border-slate-100 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Total a pagar</p>
              <p className="text-3xl font-bold text-slate-900">{formatSoles(total)}</p>
              <p className="text-xs text-slate-400 mt-1">
                S/ {PPA} por alumno · pago único
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 bg-[#EAF3DE] text-[#27500A] text-xs font-semibold px-3 py-1.5 rounded-full">
                <PiggyBank size={14} />
                Ahorro vs. método tradicional: {formatSoles(saving)}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                vs. S/ {TRAD}/alumno con psicólogo contratado
              </p>
            </div>
          </div>
        </div>

        {/* Plan único */}
        <div className="bg-white border-2 border-brand-morado rounded-2xl p-8 mb-6 shadow-lg shadow-purple-200/30">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-brand-morado uppercase tracking-wider mb-1">
                Plan institucional
              </p>
              <div>
                <span className="text-5xl font-bold text-slate-900">
                  <span className="text-2xl text-slate-500 align-super mr-1">S/</span>
                  20
                </span>
                <p className="text-sm text-slate-500 mt-1">
                  por alumno · ciclo académico
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#EAF3DE] text-[#27500A] text-xs font-semibold px-3 py-1.5 rounded-full">
              <BadgeCheck size={14} />
              Avalado por psicólogo colegiado
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
                <Icon size={16} className="text-brand-morado mt-0.5 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <hr className="border-slate-100 mb-5" />

          <Link
            to="/contacto"
            state={{ message: DEMO_MESSAGE }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-sm font-semibold bg-brand-morado text-white border-2 border-[#5a2fa0] transition-all duration-200 hover:bg-[#5a2fa0] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-300/40"
          >
            Solicitar demo gratuita
            <ArrowUpRight size={16} />
          </Link>

          <a
            href={PROPOSAL_PDF_URL}
            download={PROPOSAL_PDF_NAME}
            className="w-full mt-2 py-2.5 rounded-lg text-sm text-slate-600 border border-slate-200 transition-colors hover:bg-slate-50 text-center block"
          >
            Descargar propuesta en PDF
          </a>
        </div>

        <p className="text-xs text-slate-400 text-center mb-6">
          ¿Tienes más de 300 alumnos o múltiples sedes?{" "}
          <Link to="/contacto" className="text-brand-morado hover:underline">
            Contáctanos
          </Link>{" "}
          para una propuesta personalizada.
        </p>

        {/* Comparativa */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {comparisons.map((c) => (
            <div
              key={c.label}
              className={`
                rounded-xl p-3 text-center border transition-all
                ${c.highlight
                  ? "bg-brand-lila/60 border-brand-morado/40 shadow-sm"
                  : "bg-white/80 border-slate-100"
                }
              `}
            >
              <p className="text-[11px] text-slate-500 mb-1 leading-tight">{c.label}</p>
              <p
                className={`text-xl font-bold ${c.highlight ? "text-brand-morado" : "text-slate-900"}`}
              >
                {c.price}
              </p>
              <p
                className={`text-[10px] mt-1 ${c.highlight ? "text-brand-morado font-medium" : "text-slate-400"}`}
              >
                {c.tag}
              </p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {trustItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon size={14} className="text-slate-400" />
              {text}
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
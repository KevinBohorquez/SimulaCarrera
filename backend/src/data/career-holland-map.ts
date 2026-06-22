/** Código Holland primario/secundario por slug de carrera (catálogo SimulaCarrera). */
export const CAREER_HOLLAND: Record<string, string> = {
  administracion: "ECS",
  arquitectura: "AIR",
  "ciencia-datos": "ICE",
  contabilidad: "CER",
  derecho: "EIS",
  "diseno-grafico": "AES",
  educacion: "SAE",
  enfermeria: "SIR",
  "ing-civil": "RIE",
  "ing-industrial": "IER",
  "ing-sistemas": "IRE",
  "ing-software": "IRE",
  marketing: "EAS",
  medicina: "ISR",
  nutricion: "SIR",
  psicologia: "SAI",
  publicidad: "AES",
};

export const CARRERA_TO_SLUG: Record<string, string> = {
  "Administración de Empresas": "administracion",
  Arquitectura: "arquitectura",
  "Ciencia de Datos": "ciencia-datos",
  Contabilidad: "contabilidad",
  Derecho: "derecho",
  "Diseño Gráfico": "diseno-grafico",
  Educación: "educacion",
  Enfermería: "enfermeria",
  "Ingeniería Civil": "ing-civil",
  "Ingeniería de Sistemas": "ing-sistemas",
  "Ingeniería de Software": "ing-software",
  "Ingeniería Industrial": "ing-industrial",
  Marketing: "marketing",
  "Medicina Humana": "medicina",
  "Nutrición y Dietética": "nutricion",
  Psicología: "psicologia",
  Publicidad: "publicidad",
};

export const RIASEC_LABELS: Record<string, string> = {
  R: "Realista",
  I: "Investigador",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

export const RIASEC_DESCRIPTIONS: Record<string, string> = {
  R: "Actividades prácticas, manuales y trabajo con herramientas o entornos físicos.",
  I: "Investigar, analizar y resolver problemas complejos de forma lógica.",
  A: "Creatividad, expresión libre y entornos poco estructurados.",
  S: "Ayudar, enseñar y colaborar directamente con otras personas.",
  E: "Liderar, persuadir, emprender y tomar decisiones con impacto.",
  C: "Tareas ordenadas, precisas y con normas claras (datos, registros, procesos).",
};

export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;

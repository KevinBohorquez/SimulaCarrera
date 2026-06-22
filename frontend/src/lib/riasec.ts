/** Dimensiones RIASEC (Holland) — etiquetas y descripciones para UI. */
export const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;

export const RIASEC_LABELS: Record<string, string> = {
  R: "Realista",
  I: "Investigador",
  A: "Artístico",
  S: "Social",
  E: "Emprendedor",
  C: "Convencional",
};

export const RIASEC_DESCRIPTIONS: Record<string, string> = {
  R: "Prefieres actividades prácticas, manuales y trabajo con herramientas, máquinas o al aire libre.",
  I: "Te atraen investigar, analizar datos y resolver problemas complejos de forma lógica.",
  A: "Valoras la creatividad, la expresión libre y los entornos poco estructurados.",
  S: "Disfrutas ayudar, enseñar y colaborar directamente con otras personas.",
  E: "Te motiva liderar, persuadir, emprender y tomar decisiones con impacto.",
  C: "Te orientas a tareas ordenadas, precisas y con normas claras (datos, registros, procesos).",
};

export function sortRiasecScores(scores: Record<string, number>): Array<[string, number]> {
  return RIASEC_ORDER.filter((d) => scores[d] != null).map((d) => [d, scores[d]]);
}

import type { CareerRanking } from "./ai.js";

function cogLevel(score: number) {
  if (score >= 75) return "alto";
  if (score >= 50) return "medio";
  return "bajo";
}

function cogTip(cap: string, score: number) {
  const tips: Record<string, Record<string, string>> = {
    verbal: { alto: "Excelente para carreras con mucha comunicación escrita y oral.", medio: "Practica lectura crítica y redacción.", bajo: "Refuerza comprensión lectora con ejercicios diarios." },
    "numérico": { alto: "Ideal para ingeniería, finanzas y ciencias exactas.", medio: "Resuelve problemas matemáticos gradualmente.", bajo: "Usa apps de práctica numérica 15 min/día." },
    abstracto: { alto: "Fuerte capacidad de razonamiento lógico y patrones.", medio: "Haz puzzles y ejercicios de lógica.", bajo: "Entrena reconocimiento de patrones con juegos." },
    espacial: { alto: "Muy útil en arquitectura, ingeniería y diseño.", medio: "Practica visualización 3D y dibujo técnico.", bajo: "Explora modelos 3D y mapas mentales." },
  };
  return tips[cap]?.[cogLevel(score)] ?? "Sigue practicando esta capacidad.";
}

export function heuristicRanking(
  answers: Array<{ question_code: string; value: string }>,
  questions: any[],
  careers: any[],
): CareerRanking[] {
  const areaScores: Record<string, number> = {};
  for (const a of answers) {
    const q = questions.find((x: any) => x.code === a.question_code);
    const opt = q?.options?.find((o: any) => o.value === a.value);
    if (opt?.weights) {
      for (const [area, w] of Object.entries(opt.weights as Record<string, number>)) {
        areaScores[area] = (areaScores[area] ?? 0) + w;
      }
    }
  }

  const scored = careers.map((c) => {
    const w = areaScores[c.area] ?? 0;
    const base = 55 + w * 4;
    return {
      career_slug: c.slug,
      career_name: c.name,
      score: Math.min(92, Math.max(45, base + Math.floor(Math.random() * 8))),
      reasoning: `Tu perfil muestra afinidad con el área de ${c.area}. ${c.description?.slice(0, 80) ?? ""}`,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 6);
}

export function buildOfflineReport(opts: {
  studentName: string;
  ranking: CareerRanking[];
  cognitiveSummary: Record<string, number>;
  simulationResults: any[];
  careers: any[];
}) {
  const top = opts.ranking[0];
  const topCareer = opts.careers.find((c) => c.slug === top?.career_slug);

  const cognitive_scores = Object.entries(opts.cognitiveSummary).map(([capacity, score]) => ({
    capacity, score, level: cogLevel(score), tip: cogTip(capacity, score),
  }));

  const simResult = opts.simulationResults[0];
  const simFeedback = simResult?.feedback;

  const fichas = opts.ranking.slice(0, 4).map((r) => {
    const c = opts.careers.find((x) => x.slug === r.career_slug);
    return {
      slug: r.career_slug,
      name: r.career_name ?? c?.name ?? r.career_slug,
      salary: c?.avg_salary_pen ? `S/. ${Number(c.avg_salary_pen).toLocaleString()}` : null,
      employability: c?.employability_score ?? null,
      demand: c?.demand_projection ?? null,
      pros: [
        `Demanda ${c?.demand_projection ?? "variable"} en el mercado peruano`,
        c?.employability_score ? `Empleabilidad ${c.employability_score}/100` : "Buenas opciones laborales",
      ],
      cons: ["Requiere dedicación y formación continua"],
      university_tip: c?.universities?.[0] ? `Considera ${c.universities[0].name} (${c.universities[0].city})` : "Investiga universidades acreditadas en Lima y provincias",
    };
  });

  return {
    summary: `${opts.studentName}, completaste tu evaluación vocacional integral. Tu perfil destaca por afinidades en ${topCareer?.area ?? "varias áreas"}, con ${top?.career_name ?? "tu carrera top"} como la opción más compatible (${top?.score ?? 0}%). El análisis combina tu diagnóstico personal, desempeño cognitivo y decisiones en simulación profesional.`,
    personality_profile: top?.reasoning ?? "Tu perfil vocacional refleja intereses y aptitudes diversas que encajan con varias trayectorias profesionales.",
    top_career: {
      slug: top?.career_slug,
      name: top?.career_name ?? top?.career_slug,
      match_score: top?.score ?? 0,
      why: top?.reasoning ?? "",
      strengths: simFeedback?.strengths ?? ["Capacidad de decisión", "Adaptabilidad", "Interés genuino"],
      challenges: simFeedback?.growth_areas ?? ["Formación especializada", "Experiencia práctica"],
      day_in_life: topCareer?.description ?? `Un profesional en ${top?.career_name} enfrenta retos diarios que combinan técnica, comunicación y trabajo en equipo.`,
    },
    alternatives: opts.ranking.slice(1, 4).map((r) => ({
      slug: r.career_slug, name: r.career_name ?? r.career_slug, match_score: r.score, why: r.reasoning,
    })),
    full_ranking: opts.ranking.map((r) => ({
      slug: r.career_slug, name: r.career_name ?? r.career_slug, score: r.score, reasoning: r.reasoning,
    })),
    cognitive_insights: cognitive_scores.length
      ? `Tu perfil cognitivo muestra ${cognitive_scores.map((c) => `${c.capacity}: ${c.score}% (${c.level})`).join(", ")}. Esto sugiere fortalezas distintas según el tipo de carrera que elijas.`
      : "Completaste el test cognitivo que evalúa capacidades clave para el éxito académico.",
    cognitive_scores,
    simulation_insights: simFeedback?.narrative
      ?? (opts.simulationResults.length ? "Completaste una simulación profesional que validó tu estilo de decisión." : "Te recomendamos completar simulaciones para validar tu orientación."),
    simulation_highlights: simFeedback?.strengths ?? ["Completaste el proceso de orientación", "Exploraste escenarios reales"],
    career_fichas: fichas,
    alternatives_insight: opts.ranking.length > 1
      ? `Además de ${top?.career_name}, tu perfil también muestra afinidad con ${opts.ranking.slice(1, 3).map((r) => r.career_name).join(" y ")}. Estas alternativas comparten áreas de interés pero ofrecen enfoques distintos en el mercado laboral peruano.`
      : undefined,
    decision_factors: [
      "Compara el plan de estudios y duración de cada carrera en universidades acreditadas (SUNEDU).",
      "Evalúa la demanda laboral y salarios en Perú para cada opción.",
      "Considera tu desempeño cognitivo: las carreras técnicas requieren más razonamiento numérico/abstracto.",
      "Valida tu elección con simulaciones y conversaciones con profesionales del sector.",
    ],
    academic_fit: cognitive_scores.length
      ? `Tu perfil cognitivo (${cognitive_scores.sort((a, b) => b.score - a.score).slice(0, 2).map((c) => `${c.capacity} ${c.score}%`).join(", ")}) sugiere que te desenvolverías mejor en carreras que valoran estas capacidades. ${top?.career_name ?? "Tu carrera top"} es coherente con este perfil.`
      : "Tu desempeño en el test cognitivo complementa el diagnóstico vocacional para elegir una carrera con demanda en Perú.",
    generated_with_ai: false,
  };
}

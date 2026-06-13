import { chatJSON, isAIConfigured, formatAIError } from "../lib/llm.js";

export interface DiagnosticAnswer { question_code: string; value: string }
export interface CareerRanking {
  career_slug: string;
  career_name?: string;
  score: number;
  reasoning: string;
}

export async function generateCareerRanking(params: {
  answers: DiagnosticAnswer[];
  questions: Array<{ code: string; text: string; dimension: string; options: any[] }>;
  careers: Array<{ slug: string; name: string; area: string; description: string | null }>;
}): Promise<CareerRanking[]> {
  if (!isAIConfigured()) throw new Error("API de IA no configurada");

  const enrichedAnswers = params.answers.map((a) => {
    const q = params.questions.find((x) => x.code === a.question_code);
    const opt = q?.options?.find((o: any) => o.value === a.value);
    return { question: q?.text ?? a.question_code, dimension: q?.dimension, answer: opt?.label ?? a.value };
  });

  const sys = `Eres un orientador vocacional experto para estudiantes peruanos.
Devuelve EXCLUSIVAMENTE JSON:
{"ranking":[{"career_slug":"slug-exacto","career_name":"Nombre","score":0-100,"reasoning":"2 frases en español"}]}
Usa SOLO slugs del catálogo. Devuelve 4-6 carreras ordenadas por compatibilidad.`;

  try {
    const parsed = await chatJSON(sys, JSON.stringify({ respuestas: enrichedAnswers, carreras: params.careers }), 1200, 0.4);
    const ranking: CareerRanking[] = parsed.ranking ?? [];
    return ranking.map((r) => {
      const career = params.careers.find((c) => c.slug === r.career_slug);
      return { ...r, career_name: r.career_name ?? career?.name ?? r.career_slug };
    });
  } catch (e: any) {
    throw new Error(formatAIError(e));
  }
}

export async function generateSimulationFeedback(params: {
  careerName: string;
  simulationTitle: string;
  decisions: Array<{ block_title: string; choice_label: string }>;
  traitTotals: Record<string, number>;
  studentName: string;
}) {
  const topTraits = Object.entries(params.traitTotals).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  const fallback = {
    headline: "¡Excelente trabajo en la simulación!",
    narrative: `En "${params.simulationTitle}" demostraste un estilo propio al enfrentar situaciones de ${params.careerName}. Tus decisiones en ${params.decisions.map((d) => d.block_title).join(", ")} revelan fortalezas en ${topTraits.join(", ") || "varias áreas"}. Esto es una buena señal de que podrías desenvolverte en entornos profesionales reales de esta carrera.`,
    strengths: topTraits.length ? topTraits : ["decisión", "adaptabilidad"],
    growth_areas: Object.entries(params.traitTotals).sort((a, b) => a[1] - b[1]).slice(0, 2).map(([k]) => k),
    fit_score: Math.min(95, 60 + topTraits.length * 10),
  };

  if (!isAIConfigured()) return fallback;

  const sys = `Mentor vocacional. Devuelve EXCLUSIVAMENTE JSON:
{"headline":"...","narrative":"2-3 párrafos","strengths":["..."],"growth_areas":["..."],"fit_score":0-100}`;

  try {
    return await chatJSON(sys, JSON.stringify(params), 800, 0.6);
  } catch {
    return fallback;
  }
}

export async function generateFinalReport(params: {
  ranking: CareerRanking[];
  cognitiveSummary: Record<string, number>;
  simulationResults: any[];
  studentName: string;
  careersData?: any[];
}) {
  if (!isAIConfigured()) throw new Error("API de IA no configurada");

  const sys = `Orientador vocacional peruano. Genera reporte COMPLETO en español. EXCLUSIVAMENTE JSON:
{
  "summary": "3 párrafos personalizados",
  "personality_profile": "1 párrafo sobre perfil vocacional",
  "top_career": {
    "slug":"...","name":"...","match_score":0-100,
    "why":"3 frases","strengths":["3 fortalezas"],"challenges":["2 desafíos"],"day_in_life":"1 párrafo"
  },
  "alternatives":[{"slug":"...","name":"...","match_score":0-100,"why":"2 frases"}],
  "full_ranking":[{"slug":"...","name":"...","score":0-100,"reasoning":"1 frase"}],
  "cognitive_insights":"2 párrafos interpretando capacidades",
  "cognitive_scores":[{"capacity":"verbal|numérico|abstracto|espacial","score":0-100,"level":"alto|medio|bajo","tip":"consejo"}],
  "simulation_insights":"2 párrafos sobre simulación",
  "simulation_highlights":["3 puntos clave de la simulación"],
  "career_fichas":[{"slug":"...","name":"...","pros":["2 pros"],"cons":["1 contra"],"university_tip":"consejo"}],
  "alternatives_insight":"1 párrafo sobre por qué las alternativas también encajan",
  "decision_factors":["4 factores clave para decidir entre estas carreras en Perú"],
  "academic_fit":"1 párrafo sobre cómo el perfil cognitivo encaja con las carreras recomendadas"
}`;

  try {
    return await chatJSON(sys, JSON.stringify(params), 2500, 0.5);
  } catch (e: any) {
    throw new Error(formatAIError(e));
  }
}

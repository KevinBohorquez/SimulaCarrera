import { openai, OPENAI_MODEL } from "../lib/openai.js";

export interface DiagnosticAnswer { question_code: string; value: string }
export interface CareerRanking { career_slug: string; score: number; reasoning: string }

export async function generateCareerRanking(params: {
  answers: DiagnosticAnswer[];
  questions: Array<{ code: string; text: string; options: any[] }>;
  careers: Array<{ slug: string; name: string; area: string; description: string | null }>;
}): Promise<CareerRanking[]> {
  const { answers, questions, careers } = params;

  const sys = `Eres un orientador vocacional. Recibirás respuestas de un alumno a un cuestionario
de diagnóstico y un catálogo de carreras. Devuelve EXCLUSIVAMENTE JSON válido con la forma:
{"ranking":[{"career_slug":"...","score":0-100,"reasoning":"1 frase"}]}.
Ordena de mayor a menor compatibilidad. Devuelve entre 4 y 6 carreras.`;

  const user = JSON.stringify({ answers, questions, careers });

  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });
  const txt = resp.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(txt);
  return parsed.ranking ?? [];
}

export async function generateFinalReport(params: {
  ranking: CareerRanking[];
  cognitiveSummary: Record<string, number>;
  simulationResults: any[];
  studentName: string;
}) {
  const sys = `Eres un orientador vocacional. Genera un reporte final personalizado en español,
en JSON con la forma:
{
 "summary": "1-2 párrafos",
 "top_career": {"slug":"...","name":"...","why":"..."},
 "alternatives": [{"slug":"...","name":"...","why":"..."}],
 "cognitive_insights": "1 párrafo",
 "next_steps": ["paso 1","paso 2","paso 3"]
}`;
  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.5,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: JSON.stringify(params) },
    ],
  });
  return JSON.parse(resp.choices[0]?.message?.content ?? "{}");
}

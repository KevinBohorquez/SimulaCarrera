/** Utilidad compartida para parsear JSON de respuestas IA */
export function parseAIJson<T = any>(raw: string): T {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    throw new Error("La IA no devolvió JSON válido");
  }
}

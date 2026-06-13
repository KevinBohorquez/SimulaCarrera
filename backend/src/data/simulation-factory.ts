import { RICH_SIMULATIONS, type RichSimulation } from "./rich-simulations.js";

const AREA_IMAGES: Record<string, string> = {
  Ingeniería: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=500&fit=crop",
  Salud: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=500&fit=crop",
  Negocios: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=500&fit=crop",
  "Ciencias Sociales": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=500&fit=crop",
  "Arte y Diseño": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=500&fit=crop",
};

const AREA_TRAITS: Record<string, string[]> = {
  Ingeniería: ["analisis", "calidad", "colaboracion"],
  Salud: ["clinico", "empatia", "protocolo"],
  Negocios: ["estrategia", "comunicacion", "liderazgo"],
  "Ciencias Sociales": ["comunicacion", "empatia", "juicio"],
  "Arte y Diseño": ["creatividad", "comunicacion", "analisis"],
};

export function buildFallbackSimulation(career: {
  slug: string;
  name: string;
  area?: string | null;
  description?: string | null;
}): RichSimulation {
  const area = career.area ?? "General";
  const img = AREA_IMAGES[area] ?? AREA_IMAGES.Ingeniería;
  const traits = AREA_TRAITS[area] ?? ["analisis", "comunicacion", "juicio"];

  return {
    title: `Un día como profesional en ${career.name}`,
    description: career.description ?? `Simulación inmersiva para explorar ${career.name}.`,
    estimated_minutes: 10,
    intro: `Es un día típico en ${career.name}. Tres situaciones pondrán a prueba cómo piensas, decides y actúas bajo presión.`,
    blocks: [
      {
        type: "decision",
        title: "Prioridad del día",
        context: `Acabas de llegar a tu puesto en ${career.name}. Hay dos tareas urgentes compitiendo por tu atención.`,
        situation: "¿Qué abordas primero?",
        image_url: img,
        options: [
          { value: "a", label: "La tarea que impacta directamente a personas/clientes", hint: "Orientación a impacto", impact: { [traits[1]]: 3, [traits[0]]: 1 } },
          { value: "b", label: "El problema técnico/analítico más complejo", hint: "Pensamiento profundo", impact: { [traits[0]]: 3, calidad: 2 } },
          { value: "c", label: "Coordinar con el equipo antes de actuar", hint: "Colaboración", impact: { [traits[2]]: 3, comunicacion: 2 } },
        ],
      },
      {
        type: "resolucion_tecnica",
        title: "Desafío profesional",
        context: `Un caso real de ${area} requiere tu criterio profesional.`,
        situation: `Como ${career.name}, ¿cuál es tu enfoque?`,
        image_url: img,
        options: [
          { value: "a", label: "Analizo datos/hechos antes de decidir", hint: "Rigor", impact: { [traits[0]]: 3, juicio: 2 } },
          { value: "b", label: "Actúo rápido con lo que sé y ajusto sobre la marcha", hint: "Agilidad", impact: { velocidad: 3, riesgo: 1 } },
          { value: "c", label: "Consulto protocolos o a un mentor", hint: "Prudencia", impact: { protocolo: 2, [traits[2]]: 2 } },
        ],
      },
      {
        type: "imprevisto",
        title: "Imprevisto",
        context: "Algo no salió como esperabas. El equipo te mira esperando tu reacción.",
        situation: "¿Cómo manejas la situación?",
        image_url: img,
        options: [
          { value: "a", label: "Comunico con transparencia y propongo solución", hint: "Liderazgo", impact: { comunicacion: 3, liderazgo: 2 } },
          { value: "b", label: "Asumo la responsabilidad y corrijo en silencio", hint: "Autonomía", impact: { asertividad: 2, [traits[0]]: 1 } },
          { value: "c", label: "Pido ayuda al equipo para resolver juntos", hint: "Trabajo en equipo", impact: { colaboracion: 3, empatia: 2 } },
        ],
      },
    ],
  };
}

export function getSimulationForCareer(career: {
  slug: string;
  name: string;
  area?: string | null;
  description?: string | null;
}): RichSimulation {
  return RICH_SIMULATIONS[career.slug] ?? buildFallbackSimulation(career);
}

export function listSimulationSlugs(): string[] {
  return Object.keys(RICH_SIMULATIONS);
}

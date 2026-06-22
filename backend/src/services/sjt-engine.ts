import { CARRERA_TO_SLUG } from "../data/career-holland-map.js";
import { getSjtAssets, getSjtBank, type SjtScenario } from "./question-banks.js";

const TRAIT_KEYS: Record<string, string> = {
  Responsabilidad: "responsabilidad",
  Apertura: "apertura",
  "Estabilidad Emocional": "estabilidad_emocional",
  Amabilidad: "amabilidad",
  Extroversión: "extroversion",
};

export const SJT_SCENARIOS_PER_SESSION = 5;

export function getSjtScenariosForSlug(careerSlug: string): SjtScenario[] {
  const bank = getSjtBank();
  const assets = getSjtAssets();
  const carreraName = Object.entries(CARRERA_TO_SLUG).find(([, slug]) => slug === careerSlug)?.[0];
  if (!carreraName) return [];

  return bank
    .filter((s) => s.carrera === carreraName)
    .sort((a, b) => a.scenario_id.localeCompare(b.scenario_id))
    .slice(0, SJT_SCENARIOS_PER_SESSION)
    .map((s) => ({ ...s, image_url: assets[s.scenario_id] ?? null } as SjtScenario & { image_url: string | null }));
}

export interface SjtAnswer {
  scenario_id: string;
  most_effective: string;
  least_effective: string;
}

function sjtPointsForMost(opt: { sjt_score: number } | undefined): number {
  if (!opt) return 0;
  if (opt.sjt_score === 2) return 2;
  if (opt.sjt_score === -2) return -2;
  if (opt.sjt_score === 1) return 1;
  return 0;
}

function sjtPointsForLeast(opt: { sjt_score: number } | undefined): number {
  if (!opt) return 0;
  if (opt.sjt_score === -2) return 0;
  if (opt.sjt_score === 2) return -2;
  return 0;
}

function traitKey(label: string): string {
  return TRAIT_KEYS[label] ?? label.toLowerCase().replace(/\s+/g, "_");
}

export function scoreSjt(answers: SjtAnswer[]) {
  const bank = getSjtBank();
  const byId = new Map(bank.map((s) => [s.scenario_id, s]));

  let sjt_total = 0;
  const big_five: Record<string, number> = {
    responsabilidad: 0,
    apertura: 0,
    amabilidad: 0,
    estabilidad_emocional: 0,
    extroversion: 0,
  };

  for (const a of answers) {
    const scenario = byId.get(a.scenario_id);
    if (!scenario) continue;

    const most = scenario.opciones.find((o) => o.opcion_id === a.most_effective);
    const least = scenario.opciones.find((o) => o.opcion_id === a.least_effective);

    sjt_total += sjtPointsForMost(most);
    sjt_total += sjtPointsForLeast(least);

    if (most) big_five[traitKey(most.big_five_trait)] = (big_five[traitKey(most.big_five_trait)] ?? 0) + 1;
    if (least) big_five[traitKey(least.big_five_trait)] = (big_five[traitKey(least.big_five_trait)] ?? 0) + 1;
  }

  return { sjt_total, big_five };
}

export function buildSjtPayloadForFrontend(careerSlug: string, careerName: string) {
  const scenarios = getSjtScenariosForSlug(careerSlug);
  return {
    career_slug: careerSlug,
    career_name: careerName,
    title: `Simulación SJT — ${careerName}`,
    description: "Evalúa tu criterio situacional y rasgos de personalidad en escenarios reales.",
    estimated_minutes: 12,
    intro: `Vivirás ${scenarios.length} dilemas de ${careerName}. En cada uno indicarás qué harías con más y con menos probabilidad.`,
    scenarios: scenarios.map((s) => {
      const ext = s as SjtScenario & { image_url?: string | null };
      return {
        scenario_id: s.scenario_id,
        contexto_narrativo: s.contexto_narrativo,
        image_url: ext.image_url ?? undefined,
        opciones: s.opciones.map((o) => ({
          opcion_id: o.opcion_id,
          texto: o.texto,
        })),
      };
    }),
  };
}

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../data/bancodepreguntas");

export interface RiasecItem {
  item_code: string;
  dimension: string;
  enunciado: string;
}

export interface SjtOption {
  opcion_id: string;
  texto: string;
  sjt_score: number;
  big_five_trait: string;
}

export interface SjtScenario {
  scenario_id: string;
  carrera: string;
  contexto_narrativo: string;
  opciones: SjtOption[];
}

export interface CatOption {
  letra: string;
  texto: string;
  es_correcta: boolean;
}

export interface CatItem {
  item_id: string;
  campo_cognitivo: string;
  dificultad_b: number;
  enunciado: string;
  opciones: CatOption[];
}

let _riasec: RiasecItem[] | null = null;
let _sjt: SjtScenario[] | null = null;
let _cat: CatItem[] | null = null;
let _sjtAssets: Record<string, string> | null = null;

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(ROOT, file), "utf8")) as T;
}

export function getRiasecBank(): RiasecItem[] {
  if (!_riasec) _riasec = loadJson("riasec_items.json");
  return _riasec!;
}

export function getSjtBank(): SjtScenario[] {
  if (!_sjt) _sjt = loadJson("sjt_scenarios.json");
  return _sjt!;
}

export function getCatBank(): CatItem[] {
  if (!_cat) _cat = loadJson("cat_cognitive_items.json");
  return _cat!;
}

export function getSjtAssets(): Record<string, string> {
  if (!_sjtAssets) _sjtAssets = loadJson("sjt_scenario_assets.json");
  return _sjtAssets!;
}

export const CAT_FIELDS = [
  "Razonamiento Verbal",
  "Razonamiento Numérico",
  "Razonamiento Abstracto y Espacial",
  "Comprensión Mecánica",
] as const;

export type CatField = (typeof CAT_FIELDS)[number];

export const CAT_FIELD_SHORT: Record<CatField, string> = {
  "Razonamiento Verbal": "verbal",
  "Razonamiento Numérico": "numerico",
  "Razonamiento Abstracto y Espacial": "abstracto",
  "Comprensión Mecánica": "mecanico",
};

import { RIASEC_LABELS } from "../data/career-holland-map.js";
import { getRiasecBank, type RiasecItem } from "./question-banks.js";

export const VALID_RIASEC_LENGTHS = [30, 60, 90, 120] as const;
export type RiasecLength = (typeof VALID_RIASEC_LENGTHS)[number];

const DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sampleRiasecItems(length: RiasecLength): RiasecItem[] {
  const perDim = length / 6;
  const bank = getRiasecBank();
  const picked: RiasecItem[] = [];

  for (const dim of DIMENSIONS) {
    const pool = bank.filter((i) => i.dimension === dim);
    if (pool.length < perDim) {
      throw new Error(`Banco RIASEC insuficiente para dimensión ${dim}`);
    }
    picked.push(...shuffle(pool).slice(0, perDim));
  }

  return shuffle(picked);
}

export interface RiasecAnswer {
  item_code: string;
  likert: number;
}

export interface RiasecScores {
  raw: Record<string, number>;
  normalized: Record<string, number>;
  holland_code: string;
  holland_labels: string[];
}

export function scoreRiasec(answers: RiasecAnswer[], itemsPerDimension: number): RiasecScores {
  const bank = getRiasecBank();
  const byCode = new Map(bank.map((i) => [i.item_code, i]));
  const raw: Record<string, number> = Object.fromEntries(DIMENSIONS.map((d) => [d, 0]));

  for (const a of answers) {
    const item = byCode.get(a.item_code);
    if (!item || a.likert < 1 || a.likert > 5) continue;
    raw[item.dimension] = (raw[item.dimension] ?? 0) + a.likert;
  }

  const min = itemsPerDimension * 1;
  const max = itemsPerDimension * 5;
  const normalized: Record<string, number> = {};
  for (const d of DIMENSIONS) {
    normalized[d] = max === min ? 50 : Math.round(((raw[d] - min) / (max - min)) * 1000) / 10;
  }

  const ordered = [...DIMENSIONS].sort((a, b) => normalized[b] - normalized[a]);
  const holland_code = ordered.slice(0, 3).join("");

  return {
    raw,
    normalized,
    holland_code,
    holland_labels: ordered.slice(0, 3).map((d) => d),
  };
}

const DIMS = ["R", "I", "A", "S", "E", "C"] as const;

function careerVector(code: string): number[] {
  return DIMS.map((d) => {
    const i = code.indexOf(d);
    if (i === 0) return 3;
    if (i === 1) return 2;
    if (i === 2) return 1;
    return 0;
  });
}

function studentVector(normalized: Record<string, number>): number[] {
  return DIMS.map((d) => normalized[d] ?? 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / Math.sqrt(magA * magB);
}

const HOLLAND_POS_W = [3, 2, 1] as const;

/** Coincidencia de letras Holland con peso por posición (primaria > secundaria > terciaria). */
function letterOverlapScore(studentCode: string, careerCode: string): number {
  const student = studentCode.split("").slice(0, 3);
  const career = careerCode.split("").slice(0, 3);
  let earned = 0;
  let max = 0;
  for (let i = 0; i < 3; i++) {
    max += HOLLAND_POS_W[i];
    const pos = career.indexOf(student[i]);
    if (pos === -1) continue;
    const align = pos === i ? 1 : pos === 0 ? 0.72 : 0.42;
    earned += HOLLAND_POS_W[i] * align;
  }
  return max > 0 ? earned / max : 0;
}

/** Intensidad del estudiante en las dimensiones que prioriza la carrera. */
function dimensionFitScore(normalized: Record<string, number>, careerCode: string): number {
  const career = careerCode.split("").slice(0, 3);
  let earned = 0;
  let max = 0;
  for (let i = 0; i < 3; i++) {
    const w = HOLLAND_POS_W[i];
    earned += (normalized[career[i]] ?? 0) * w;
    max += 100 * w;
  }
  return max > 0 ? earned / max : 0;
}

/**
 * Afinidad 52–95%: combina coincidencia de letras Holland, intensidad RIASEC
 * y similitud coseno (evita empates masivos por redondeo grueso).
 */
export function hollandMatchScore(
  normalized: Record<string, number>,
  studentCode: string,
  careerCode: string,
): number {
  const letter = letterOverlapScore(studentCode, careerCode);
  const dim = dimensionFitScore(normalized, careerCode);
  const cos = cosineSimilarity(studentVector(normalized), careerVector(careerCode));
  const blended = 0.5 * letter + 0.32 * dim + 0.18 * cos;
  return Math.round((52 + blended * 43) * 10) / 10;
}

export function matchCareersByHolland(
  hollandCode: string,
  normalized: Record<string, number>,
  careers: Array<{ slug: string; name: string; area: string; description: string | null }>,
  hollandByCareer: Record<string, string>,
): Array<{ career_slug: string; career_name: string; score: number; reasoning: string }> {
  const studentTop = hollandCode.split("").slice(0, 3);

  const scored = careers
    .filter((c) => hollandByCareer[c.slug])
    .map((c) => {
      const careerCode = hollandByCareer[c.slug];
      const careerLetters = careerCode.split("");
      const score = hollandMatchScore(normalized, hollandCode, careerCode);
      const shared = studentTop.filter((l) => careerLetters.includes(l));
      const primaryMatch = studentTop[0] === careerLetters[0];
      const topDim = RIASEC_LABELS[studentTop[0]] ?? studentTop[0];
      return {
        career_slug: c.slug,
        career_name: c.name,
        score,
        reasoning: primaryMatch
          ? `Coincides en ${topDim} (${studentTop[0]}) como dimensión principal con ${c.name}. Afinidad ${score}%.`
          : `Afinidad ${score}% con ${c.name} (${shared.join(", ") || "perfil mixto"}). ${c.description?.slice(0, 70) ?? ""}`,
      };
    });

  return scored.sort((a, b) => b.score - a.score || a.career_name.localeCompare(b.career_name)).slice(0, 6);
}

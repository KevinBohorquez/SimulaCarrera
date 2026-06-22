import {
  CAT_FIELDS,
  CAT_FIELD_SHORT,
  getCatBank,
  type CatField,
  type CatItem,
} from "./question-banks.js";

export const CAT_TOTAL_ITEMS = 30;

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function fieldDistribution(): CatField[] {
  const counts = [8, 8, 7, 7];
  const order: CatField[] = [];
  let fi = 0;
  for (let i = 0; i < CAT_TOTAL_ITEMS; i++) {
    order.push(CAT_FIELDS[fi]);
    counts[fi] -= 1;
    if (counts[fi] === 0) fi += 1;
  }
  return order;
}

export interface CatSessionState {
  field_order: CatField[];
  item_index: number;
  used_item_ids: string[];
  theta: Record<string, number>;
  answers: Array<{ item_id: string; field: CatField; selected: string; correct: boolean; b: number }>;
}

export function initCatSession(): CatSessionState {
  return {
    field_order: fieldDistribution(),
    item_index: 0,
    used_item_ids: [],
    theta: Object.fromEntries(CAT_FIELDS.map((f) => [f, 0])),
    answers: [],
  };
}

function itemsForField(field: CatField, exclude: Set<string>): CatItem[] {
  return getCatBank().filter((i) => i.campo_cognitivo === field && !exclude.has(i.item_id));
}

function pickNextItem(field: CatField, theta: number, exclude: Set<string>): CatItem | null {
  const pool = itemsForField(field, exclude);
  if (!pool.length) return null;
  return pool.reduce((best, item) =>
    Math.abs(item.dificultad_b - theta) < Math.abs(best.dificultad_b - theta) ? item : best,
  );
}

function updateTheta(theta: number, b: number, correct: boolean): number {
  const p = logistic(theta - b);
  const step = correct ? 0.45 * (1 - p) : -0.45 * p;
  return Math.max(-3.5, Math.min(3.5, theta + step));
}

function thetaToPercentile(theta: number): number {
  const t = (theta + 3) / 6;
  return Math.round(Math.max(1, Math.min(99, t * 98 + 1)));
}

export function getNextCatQuestion(state: CatSessionState): {
  done: boolean;
  item?: {
    item_id: string;
    field: string;
    field_short: string;
    enunciado: string;
    opciones: Array<{ letra: string; texto: string }>;
    progress: { current: number; total: number };
  };
} {
  if (state.item_index >= CAT_TOTAL_ITEMS) return { done: true };

  const field = state.field_order[state.item_index];
  const used = new Set(state.used_item_ids);
  const theta = state.theta[field] ?? 0;
  const item = pickNextItem(field, theta, used);
  if (!item) return { done: true };

  return {
    done: false,
    item: {
      item_id: item.item_id,
      field,
      field_short: CAT_FIELD_SHORT[field],
      enunciado: item.enunciado,
      opciones: item.opciones.map((o) => ({ letra: o.letra, texto: o.texto })),
      progress: { current: state.item_index + 1, total: CAT_TOTAL_ITEMS },
    },
  };
}

export function submitCatAnswer(state: CatSessionState, itemId: string, selected: string): {
  state: CatSessionState;
  correct: boolean;
  done: boolean;
  results?: CatResults;
} {
  const bank = getCatBank();
  const item = bank.find((i) => i.item_id === itemId);
  if (!item) throw new Error("item_not_found");

  const field = item.campo_cognitivo as CatField;
  const opt = item.opciones.find((o) => o.letra === selected);
  const correct = !!opt?.es_correcta;

  const next: CatSessionState = {
    ...state,
    item_index: state.item_index + 1,
    used_item_ids: [...state.used_item_ids, itemId],
    theta: { ...state.theta, [field]: updateTheta(state.theta[field] ?? 0, item.dificultad_b, correct) },
    answers: [
      ...state.answers,
      { item_id: itemId, field, selected, correct, b: item.dificultad_b },
    ],
  };

  if (next.item_index >= CAT_TOTAL_ITEMS) {
    return { state: next, correct, done: true, results: finalizeCat(next) };
  }

  return { state: next, correct, done: false };
}

export interface CatResults {
  theta_by_field: Record<string, number>;
  percentiles: Record<string, number>;
  summary: Array<{ field: string; field_short: string; theta: number; percentile: number }>;
}

export function finalizeCat(state: CatSessionState): CatResults {
  const theta_by_field: Record<string, number> = {};
  const percentiles: Record<string, number> = {};

  for (const field of CAT_FIELDS) {
    const t = state.theta[field] ?? 0;
    theta_by_field[CAT_FIELD_SHORT[field]] = Math.round(t * 100) / 100;
    percentiles[CAT_FIELD_SHORT[field]] = thetaToPercentile(t);
  }

  return {
    theta_by_field,
    percentiles,
    summary: CAT_FIELDS.map((field) => ({
      field,
      field_short: CAT_FIELD_SHORT[field],
      theta: state.theta[field] ?? 0,
      percentile: percentiles[CAT_FIELD_SHORT[field]],
    })),
  };
}

export function catStateFromJson(raw: unknown): CatSessionState | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as CatSessionState;
  if (!Array.isArray(s.field_order) || typeof s.item_index !== "number") return null;
  return s;
}

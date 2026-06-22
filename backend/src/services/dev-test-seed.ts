import { supabaseAdmin } from "../lib/supabase.js";
import { CAREER_HOLLAND } from "../data/career-holland-map.js";
import { matchCareersByHolland, sampleRiasecItems, scoreRiasec } from "./riasec-engine.js";
import { getSjtScenariosForSlug, scoreSjt } from "./sjt-engine.js";
import {
  finalizeCat,
  getNextCatQuestion,
  initCatSession,
  submitCatAnswer,
} from "./cat-engine.js";
import { getCatBank } from "./question-banks.js";

const TEST_PRICE_PEN = 35;

/** Rellena una sesión con respuestas simuladas (RIASEC → SJT → CAT). Solo desarrollo. */
export async function seedSessionComplete(sessionId: string, studentId: string) {
  const length = 30;
  const selected = sampleRiasecItems(length);
  const answers = selected.map((item) => ({
    item_code: item.item_code,
    likert: item.dimension === "I" || item.dimension === "R" ? 5 : 3,
  }));
  const scores = scoreRiasec(answers, length / 6);

  const { data: careers } = await supabaseAdmin
    .from("careers")
    .select("slug,name,area,description")
    .eq("status", "active");

  const ranking = matchCareersByHolland(
    scores.holland_code,
    scores.normalized,
    careers ?? [],
    CAREER_HOLLAND,
  );
  const topSlug = ranking[0]?.career_slug ?? "ingenieria-de-software";

  const scenarios = getSjtScenariosForSlug(topSlug);
  const sjtAnswers = scenarios.map((s) => {
    const best = s.opciones.find((o) => o.sjt_score === 2) ?? s.opciones[0];
    const worst = s.opciones.find((o) => o.sjt_score === -2) ?? s.opciones[s.opciones.length - 1];
    return {
      scenario_id: s.scenario_id,
      most_effective: best.opcion_id,
      least_effective: worst.opcion_id,
    };
  });
  const sjtResult = scoreSjt(sjtAnswers);

  let catState = initCatSession();
  for (let i = 0; i < 30; i++) {
    const next = getNextCatQuestion(catState);
    if (next.done || !next.item) break;
    const bankItem = getCatBank().find((x) => x.item_id === next.item!.item_id);
    const correct = bankItem?.opciones.find((o) => o.es_correcta);
    const r = submitCatAnswer(catState, next.item.item_id, correct?.letra ?? "a");
    catState = r.state;
    if (r.done) break;
  }
  const catResults = finalizeCat(catState);

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .update({
      current_stage: 4,
      status: "in_progress",
      diagnostic_answers: {
        meta: { label: "Evaluación vocacional integral (seed dev)", price_pen: TEST_PRICE_PEN },
        riasec_length: length,
        selected_items: selected.map((i) => i.item_code),
        answers,
        scores,
      },
      ranking_preliminary: ranking,
      simulation_results: [
        {
          career_slug: topSlug,
          answers: sjtAnswers,
          ...sjtResult,
          completed_at: new Date().toISOString(),
        },
      ],
      cognitive_answers: {
        cat_state: catState,
        results: catResults,
      },
    })
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "seed_update_failed");

  return {
    session: data,
    holland_code: scores.holland_code,
    top_career: topSlug,
    ranking,
  };
}

export async function createDevSession(studentId: string, periodId: string | null) {
  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .insert({
      student_id: studentId,
      period_id: periodId,
      current_stage: 1,
      status: "in_progress",
      diagnostic_answers: {
        meta: { label: "Evaluación vocacional integral (seed dev)", price_pen: TEST_PRICE_PEN },
      },
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "seed_create_failed");
  return data;
}

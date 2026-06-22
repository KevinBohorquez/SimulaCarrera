import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { getAIStatus } from "../lib/llm.js";
import { CAREER_HOLLAND, RIASEC_LABELS, RIASEC_DESCRIPTIONS, RIASEC_ORDER } from "../data/career-holland-map.js";
import {
  matchCareersByHolland,
  sampleRiasecItems,
  scoreRiasec,
  VALID_RIASEC_LENGTHS,
  type RiasecLength,
} from "../services/riasec-engine.js";
import { buildSjtPayloadForFrontend, getSjtScenariosForSlug, scoreSjt } from "../services/sjt-engine.js";
import {
  catStateFromJson,
  getNextCatQuestion,
  initCatSession,
  submitCatAnswer,
} from "../services/cat-engine.js";
import { computeProgressFromSession, sessionListItem } from "../services/test-progress.js";
import { createDevSession, seedSessionComplete } from "../services/dev-test-seed.js";
import { finalizeSessionReport } from "../services/finalize-test.js";

const router = Router();
const TEST_PRICE_PEN = 35;

async function ownedSession(sessionId: string, studentId: string) {
  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

const LIKERT_LABELS = [
  { value: 1, label: "Totalmente en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "De acuerdo" },
  { value: 5, label: "Totalmente de acuerdo" },
];

router.get("/status", requireAuth, (_req, res) => {
  res.json(getAIStatus());
});

router.get("/active-session", requireAuth, requireRole("student"), async (req, res) => {
  const { data: sessions } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("student_id", req.user!.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1);
  res.json({ session: sessions?.[0] ?? null });
});

router.get("/sessions", requireAuth, requireRole("student"), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("student_id", req.user!.id)
    .order("started_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const { data: reportRows } = await supabaseAdmin
    .from("reports")
    .select("id, session_id")
    .eq("student_id", req.user!.id);
  const reportBySession = new Map((reportRows ?? []).map((r) => [r.session_id, r.id]));

  res.json({
    sessions: (data ?? []).map((s) => sessionListItem(s, reportBySession.get(s.id))),
    price_pen: TEST_PRICE_PEN,
  });
});

router.post("/dev/seed-complete", requireAuth, requireRole("student"), async (req, res) => {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SEED !== "true") {
    return res.status(404).json({ error: "not_found" });
  }

  const u = req.user!;
  const body = z
    .object({
      session_id: z.string().uuid().optional(),
      finalize: z.boolean().optional(),
    })
    .safeParse(req.body ?? {});

  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  let sessionId = body.data.session_id;
  if (!sessionId) {
    const { data: profile } = await supabaseAdmin
      .from("student_profiles")
      .select("period_id")
      .eq("user_id", u.id)
      .maybeSingle();
    const created = await createDevSession(u.id, profile?.period_id ?? null);
    sessionId = created.id;
  } else {
    const owned = await ownedSession(sessionId, u.id);
    if (!owned) return res.status(404).json({ error: "session_not_found" });
  }

  if (!sessionId) {
    return res.status(500).json({ error: "seed_session_failed" });
  }

  const seeded = await seedSessionComplete(sessionId, u.id);

  if (body.data.finalize === false) {
    return res.json({
      session_id: sessionId,
      holland_code: seeded.holland_code,
      top_career: seeded.top_career,
      seeded: true,
      finalized: false,
    });
  }

  const { report, ai_used } = await finalizeSessionReport(seeded.session, u.id);
  res.json({
    session_id: sessionId,
    holland_code: seeded.holland_code,
    top_career: seeded.top_career,
    seeded: true,
    finalized: true,
    report,
    ai_used,
  });
});

router.post("/purchase", requireAuth, requireRole("student"), async (req, res) => {
  const u = req.user!;
  const { data: profile } = await supabaseAdmin
    .from("student_profiles")
    .select("period_id")
    .eq("user_id", u.id)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .insert({
      student_id: u.id,
      period_id: profile?.period_id ?? null,
      current_stage: 1,
      status: "in_progress",
      diagnostic_answers: {
        meta: { label: "Evaluación vocacional integral", price_pen: TEST_PRICE_PEN },
      },
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ session: sessionListItem(data) });
});

router.get("/:sessionId/progress", requireAuth, requireRole("student"), async (req, res) => {
  const session = await ownedSession(req.params.sessionId, req.user!.id);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  const { data: report } = await supabaseAdmin
    .from("reports")
    .select("id")
    .eq("session_id", session.id)
    .maybeSingle();
  res.json({ ...computeProgressFromSession(session), report_id: report?.id ?? null });
});

router.get("/progress", requireAuth, requireRole("student"), async (req, res) => {
  const sessionId = req.query.session_id as string | undefined;
  if (sessionId) {
    const session = await ownedSession(sessionId, req.user!.id);
    if (!session) return res.status(404).json({ error: "session_not_found" });
    return res.json(computeProgressFromSession(session));
  }
  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("student_id", req.user!.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  res.json(computeProgressFromSession(session));
});

const StartBody = z.object({
  riasec_length: z.union([z.literal(30), z.literal(60), z.literal(90), z.literal(120)]),
});

router.post("/:sessionId/start", requireAuth, requireRole("student"), async (req, res) => {
  const u = req.user!;
  const session = await ownedSession(req.params.sessionId, u.id);
  if (!session) return res.status(404).json({ error: "session_not_found" });
  if (session.status !== "in_progress") return res.status(400).json({ error: "session_not_active" });

  const diag = (session.diagnostic_answers ?? {}) as any;
  if (diag.scores?.holland_code) {
    return res.json({ session, ...getAIStatus(), resume: true });
  }

  const parsed = StartBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "riasec_length_required", valid: VALID_RIASEC_LENGTHS });
  }

  const riasec_length = parsed.data.riasec_length as RiasecLength;
  const hasAnswers = (diag.answers?.length ?? 0) > 0;

  if (hasAnswers && diag.selected_items?.length) {
    return res.json({ session, ...getAIStatus(), resume: true });
  }

  const selected = sampleRiasecItems(riasec_length);
  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .update({
      current_stage: 1,
      diagnostic_answers: {
        ...diag,
        riasec_length,
        selected_items: selected.map((i) => i.item_code),
        answers: [],
        current_index: 0,
      },
    })
    .eq("id", session.id)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, ...getAIStatus(), resume: false });
});

/** @deprecated use POST /:sessionId/start */
router.post("/start", requireAuth, requireRole("student"), async (req, res) => {
  return res.status(400).json({
    error: "use_session_start",
    message: "Usa POST /api/test/:sessionId/start tras comprar un crédito de test.",
  });
});

router.get("/:sessionId/riasec", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session, error } = await supabaseAdmin
    .from("test_sessions")
    .select("diagnostic_answers, student_id")
    .eq("id", req.params.sessionId)
    .single();

  if (error || !session || session.student_id !== req.user!.id) {
    return res.status(404).json({ error: "session_not_found" });
  }

  const diag = session.diagnostic_answers as any;
  const codes: string[] = diag?.selected_items ?? [];
  if (!codes.length) return res.status(400).json({ error: "riasec_not_initialized" });

  const { getRiasecBank } = await import("../services/question-banks.js");
  const bank = getRiasecBank();
  const byCode = new Map(bank.map((i) => [i.item_code, i]));

  const questions = codes
    .map((code) => {
      const item = byCode.get(code);
      if (!item) return null;
      return {
        item_code: item.item_code,
        dimension: item.dimension,
        dimension_label: RIASEC_LABELS[item.dimension] ?? item.dimension,
        enunciado: item.enunciado,
        likert_options: LIKERT_LABELS,
      };
    })
    .filter(Boolean);

  res.json({
    riasec_length: diag.riasec_length ?? codes.length,
    questions,
    likert_options: LIKERT_LABELS,
    saved_answers: diag.answers ?? [],
    current_index: diag.current_index ?? 0,
  });
});

const RiasecProgressBody = z.object({
  answers: z.array(z.object({ item_code: z.string(), likert: z.number().int().min(1).max(5) })),
  current_index: z.number().int().min(0),
});

router.post("/:sessionId/riasec/progress", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = RiasecProgressBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions")
    .select("diagnostic_answers, student_id")
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  const diag = (session.diagnostic_answers ?? {}) as any;
  if (diag.scores?.holland_code) return res.status(400).json({ error: "riasec_already_completed" });

  const diagnostic_answers = {
    ...diag,
    answers: parsed.data.answers,
    current_index: parsed.data.current_index,
  };

  const { error } = await supabaseAdmin
    .from("test_sessions")
    .update({ diagnostic_answers, current_stage: 1 })
    .eq("id", req.params.sessionId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, saved: parsed.data.answers.length });
});

const RiasecSubmit = z.object({
  answers: z.array(z.object({ item_code: z.string(), likert: z.number().int().min(1).max(5) })),
});

router.post("/:sessionId/riasec", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = RiasecSubmit.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  const diag = (session.diagnostic_answers ?? {}) as any;
  const length = diag.riasec_length ?? 90;
  const expected = length / 6;
  if (parsed.data.answers.length !== length) {
    return res.status(400).json({ error: "incomplete_answers", expected: length });
  }

  const scores = scoreRiasec(parsed.data.answers, expected);

  const { data: careers } = await supabaseAdmin
    .from("careers")
    .select("slug,name,area,description")
    .eq("status", "active");

  const ranking = matchCareersByHolland(scores.holland_code, scores.normalized, careers ?? [], CAREER_HOLLAND);

  const diagnostic_answers = {
    ...diag,
    answers: parsed.data.answers,
    scores,
  };

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .update({
      diagnostic_answers,
      ranking_preliminary: ranking,
      current_stage: 2,
    })
    .eq("id", req.params.sessionId)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({
    session: data,
    scores,
    ranking,
    holland_code: scores.holland_code,
    progress: computeProgressFromSession(data),
  });
});

router.get("/:sessionId/profile", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session, error } = await supabaseAdmin
    .from("test_sessions")
    .select("diagnostic_answers, ranking_preliminary, current_stage, student_id")
    .eq("id", req.params.sessionId)
    .single();

  if (error || !session || session.student_id !== req.user!.id) {
    return res.status(404).json({ error: "session_not_found" });
  }

  const diag = session.diagnostic_answers as any;
  if (!diag?.scores?.holland_code) {
    return res.status(400).json({ error: "riasec_not_completed" });
  }

  const { data: careers } = await supabaseAdmin
    .from("careers")
    .select("slug,name,area,description")
    .eq("status", "active");

  const ranking = matchCareersByHolland(diag.scores.holland_code, diag.scores.normalized, careers ?? [], CAREER_HOLLAND);

  if (JSON.stringify(ranking) !== JSON.stringify(session.ranking_preliminary)) {
    await supabaseAdmin
      .from("test_sessions")
      .update({ ranking_preliminary: ranking })
      .eq("id", req.params.sessionId);
  }

  res.json({
    holland_code: diag.scores.holland_code,
    riasec_scores: diag.scores.normalized,
    raw_scores: diag.scores.raw,
    ranking,
    current_stage: session.current_stage,
    riasec_info: RIASEC_ORDER.map((d) => ({
      code: d,
      label: RIASEC_LABELS[d],
      description: RIASEC_DESCRIPTIONS[d],
    })),
  });
});

router.get("/:sessionId/sjt", requireAuth, requireRole("student"), async (req, res) => {
  const careerSlug = req.query.career_slug as string | undefined;

  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select("ranking_preliminary, student_id, current_stage")
    .eq("id", req.params.sessionId)
    .single();

  if (!session || session.student_id !== req.user!.id) {
    return res.status(404).json({ error: "session_not_found" });
  }

  if ((session.current_stage ?? 1) < 3) {
    return res.status(403).json({ error: "stage_locked", required_stage: 3 });
  }

  const slug =
    careerSlug ??
    (session.ranking_preliminary as any[])?.[0]?.career_slug ??
    "administracion";

  const { data: career } = await supabaseAdmin
    .from("careers")
    .select("slug,name")
    .eq("slug", slug)
    .maybeSingle();

  const payload = buildSjtPayloadForFrontend(slug, career?.name ?? slug);
  if (!payload.scenarios.length) return res.status(404).json({ error: "sjt_not_found_for_career" });

  res.json(payload);
});

const SjtSubmit = z.object({
  career_slug: z.string(),
  answers: z.array(
    z.object({
      scenario_id: z.string(),
      most_effective: z.string(),
      least_effective: z.string(),
    }),
  ),
});

router.post("/:sessionId/sjt", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = SjtSubmit.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  const expected = getSjtScenariosForSlug(parsed.data.career_slug).length;
  if (expected === 0) return res.status(404).json({ error: "sjt_not_found_for_career" });
  if (parsed.data.answers.length !== expected) {
    return res.status(400).json({ error: "incomplete_sjt", expected, received: parsed.data.answers.length });
  }

  const result = scoreSjt(parsed.data.answers);
  const entry = {
    career_slug: parsed.data.career_slug,
    answers: parsed.data.answers,
    ...result,
    completed_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .update({
      simulation_results: [entry],
      current_stage: 4,
    })
    .eq("id", req.params.sessionId)
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, result: entry });
});

router.post("/:sessionId/cat/start", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  if (!(session.simulation_results as any[])?.length) {
    return res.status(403).json({ error: "stage_locked", required: "sjt_complete" });
  }

  let state = catStateFromJson((session.cognitive_answers as any)?.cat_state);
  if (!state) {
    state = initCatSession();
    await supabaseAdmin
      .from("test_sessions")
      .update({ cognitive_answers: { cat_state: state }, current_stage: 4 })
      .eq("id", req.params.sessionId);
  }

  const next = getNextCatQuestion(state);
  res.json({ cat_state: state, ...next });
});

router.get("/:sessionId/cat/next", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session } = await supabaseAdmin
    .from("test_sessions")
    .select("cognitive_answers, student_id")
    .eq("id", req.params.sessionId)
    .single();

  if (!session || session.student_id !== req.user!.id) {
    return res.status(404).json({ error: "session_not_found" });
  }

  const state = catStateFromJson((session.cognitive_answers as any)?.cat_state);
  if (!state) return res.status(400).json({ error: "cat_not_started" });

  res.json(getNextCatQuestion(state));
});

const CatAnswerBody = z.object({
  item_id: z.string(),
  selected: z.string(),
});

router.post("/:sessionId/cat/answer", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = CatAnswerBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions")
    .select("*")
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  let state = catStateFromJson((session.cognitive_answers as any)?.cat_state);
  if (!state) return res.status(400).json({ error: "cat_not_started" });

  const { state: newState, correct, done, results } = submitCatAnswer(
    state,
    parsed.data.item_id,
    parsed.data.selected,
  );

  const cognitive_answers: any = {
    ...(session.cognitive_answers as object),
    cat_state: newState,
  };
  if (done && results) {
    cognitive_answers.results = results;
    cognitive_answers.completed_at = new Date().toISOString();
  }

  await supabaseAdmin
    .from("test_sessions")
    .update({ cognitive_answers, current_stage: done ? 5 : 4 })
    .eq("id", req.params.sessionId);

  const next = done ? { done: true, results } : getNextCatQuestion(newState);
  res.json({ correct, ...next });
});

router.post("/:sessionId/advance", requireAuth, requireRole("student"), async (req, res) => {
  const { stage } = req.body;
  if (typeof stage !== "number") return res.status(400).json({ error: "stage_required" });

  const { data, error } = await supabaseAdmin
    .from("test_sessions")
    .update({ current_stage: stage })
    .eq("id", req.params.sessionId)
    .eq("student_id", req.user!.id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data });
});

router.post("/:sessionId/finalize", requireAuth, requireRole("student"), async (req, res) => {
  const session = await ownedSession(req.params.sessionId, req.user!.id);
  if (!session) return res.status(404).json({ error: "session_not_found" });

  try {
    const result = await finalizeSessionReport(session, req.user!.id);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "finalize_failed" });
  }
});

export { VALID_RIASEC_LENGTHS };
export default router;

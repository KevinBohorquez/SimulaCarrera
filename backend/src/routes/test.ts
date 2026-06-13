import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { generateCareerRanking, generateFinalReport } from "../services/ai.js";
import { getAIStatus } from "../lib/llm.js";
import { heuristicRanking, buildOfflineReport } from "../services/report-builder.js";
import { attachLaborMarketToReport } from "../services/labor-market.js";

const router = Router();

function pickDiagnosticQuestions(questions: any[], perDimension = 3) {
  const byDim: Record<string, any[]> = {};
  for (const q of questions) {
    byDim[q.dimension] ??= [];
    byDim[q.dimension].push(q);
  }
  const picked: any[] = [];
  for (const dim of Object.keys(byDim)) {
    const shuffled = [...byDim[dim]].sort(() => Math.random() - 0.5);
    picked.push(...shuffled.slice(0, perDimension));
  }
  return picked.sort(() => Math.random() - 0.5);
}

function pickCognitiveQuestions(questions: any[]) {
  const capacities = ["verbal", "numérico", "abstracto", "espacial"];
  const picked: any[] = [];
  for (const cap of capacities) {
    const pool = questions.filter((q) => q.capacity === cap);
    const mid = pool.filter((q) => q.difficulty >= 2 && q.difficulty <= 3);
    const source = mid.length ? mid : pool;
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    if (shuffled[0]) picked.push(shuffled[0]);
    if (shuffled[1]) picked.push(shuffled[1]);
  }
  return picked;
}

// GET /api/test/status — verifica si IA está disponible
router.get("/status", requireAuth, (_req, res) => {
  res.json(getAIStatus());
});

// POST /api/test/start
router.post("/start", requireAuth, requireRole("student"), async (req, res) => {
  const u = req.user!;
  const { data: existing } = await supabaseAdmin
    .from("test_sessions").select("*").eq("student_id", u.id).eq("status", "in_progress")
    .order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) return res.json({ session: existing, ...getAIStatus() });

  const { data: profile } = await supabaseAdmin
    .from("student_profiles").select("period_id").eq("user_id", u.id).maybeSingle();

  const { data, error } = await supabaseAdmin.from("test_sessions").insert({
    student_id: u.id, period_id: profile?.period_id ?? null, current_stage: 1,
  }).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ session: data, ...getAIStatus() });
});

// GET /api/test/questions/diagnostic — 9 preguntas (3 por dimensión)
router.get("/questions/diagnostic", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("diagnostic_questions").select("id,code,text,dimension,options").eq("is_active", true);
  if (error) return res.status(500).json({ error: error.message });
  const questions = pickDiagnosticQuestions(data ?? [], 3);
  res.json({ questions, total_available: data?.length ?? 0 });
});

// POST /api/test/:sessionId/diagnostic
const DiagnosticBody = z.object({
  answers: z.array(z.object({ question_code: z.string(), value: z.string() })),
});
router.post("/:sessionId/diagnostic", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = DiagnosticBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: questions } = await supabaseAdmin
    .from("diagnostic_questions").select("code,text,dimension,options").eq("is_active", true);
  const { data: careers } = await supabaseAdmin
    .from("careers").select("slug,name,area,description").eq("status", "active");

  let ranking: any[] = [];
  let ai_used = false;
  let ai_error: string | null = null;
  try {
    ranking = await generateCareerRanking({
      answers: parsed.data.answers,
      questions: questions ?? [],
      careers: careers ?? [],
    });
    ai_used = true;
  } catch (e: any) {
    ai_error = e.message;
    console.error("IA ranking error:", e.message);
    ranking = heuristicRanking(parsed.data.answers, questions ?? [], careers ?? []);
  }

  const { data, error } = await supabaseAdmin.from("test_sessions").update({
    diagnostic_answers: parsed.data.answers, ranking_preliminary: ranking, current_stage: 2,
  }).eq("id", req.params.sessionId).eq("student_id", req.user!.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, ranking, ai_used, ai_error });
});

// GET /api/test/cognitive — 2 preguntas por capacidad (8 total)
router.get("/cognitive", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("cognitive_questions")
    .select("id,code,text,capacity,difficulty,options").eq("is_active", true);
  if (error) return res.status(500).json({ error: error.message });

  const picked = pickCognitiveQuestions(data ?? []);
  const safe = picked.map((q: any) => ({
    ...q,
    options: q.options.map((o: any) => ({ value: o.value, label: o.label })),
  }));
  res.json({ questions: safe });
});

const CognitiveBody = z.object({
  answers: z.array(z.object({ question_code: z.string(), value: z.string() })),
});
router.post("/:sessionId/cognitive", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = CognitiveBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: questions } = await supabaseAdmin
    .from("cognitive_questions").select("code,capacity,options");

  const byCap: Record<string, { correct: number; total: number }> = {};
  for (const a of parsed.data.answers) {
    const q = questions?.find((x: any) => x.code === a.question_code);
    if (!q) continue;
    const opt = (q.options as any[]).find((o) => o.value === a.value);
    byCap[q.capacity] ??= { correct: 0, total: 0 };
    byCap[q.capacity].total += 1;
    if (opt?.is_correct) byCap[q.capacity].correct += 1;
  }
  const summary: Record<string, number> = {};
  for (const k of Object.keys(byCap)) {
    summary[k] = Math.round((byCap[k].correct / byCap[k].total) * 100);
  }

  const { data, error } = await supabaseAdmin.from("test_sessions").update({
    cognitive_answers: parsed.data.answers, current_stage: 4,
  }).eq("id", req.params.sessionId).eq("student_id", req.user!.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, summary });
});

// POST /api/test/:sessionId/advance — avanza etapa (ej. ranking → simulación)
router.post("/:sessionId/advance", requireAuth, requireRole("student"), async (req, res) => {
  const { stage } = req.body;
  if (typeof stage !== "number") return res.status(400).json({ error: "stage_required" });

  const { data, error } = await supabaseAdmin.from("test_sessions").update({ current_stage: stage })
    .eq("id", req.params.sessionId).eq("student_id", req.user!.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data });
});

// POST /api/test/:sessionId/finalize
router.post("/:sessionId/finalize", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions").select("*").eq("id", req.params.sessionId).eq("student_id", req.user!.id).single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  const { data: profile } = await supabaseAdmin
    .from("users").select("full_name,institution_id").eq("id", req.user!.id).single();

  const { data: cogQs } = await supabaseAdmin.from("cognitive_questions").select("code,capacity,options");
  const byCap: Record<string, { c: number; t: number }> = {};
  for (const a of (session.cognitive_answers ?? []) as any[]) {
    const q = cogQs?.find((x: any) => x.code === a.question_code);
    if (!q) continue;
    const opt = (q.options as any[]).find((o) => o.value === a.value);
    byCap[q.capacity] ??= { c: 0, t: 0 };
    byCap[q.capacity].t += 1;
    if (opt?.is_correct) byCap[q.capacity].c += 1;
  }
  const cognitiveSummary: Record<string, number> = {};
  for (const k of Object.keys(byCap)) cognitiveSummary[k] = Math.round((byCap[k].c / byCap[k].t) * 100);

  const { data: careers } = await supabaseAdmin.from("careers").select("*").eq("status", "active");

  let report: any;
  let ai_used = false;
  let rep: any;
  try {
    report = await generateFinalReport({
      ranking: session.ranking_preliminary as any[],
      cognitiveSummary,
      simulationResults: (session.simulation_results as any[]) ?? [],
      studentName: profile?.full_name ?? "Estudiante",
      careersData: careers ?? [],
    });
    report.generated_with_ai = true;
    ai_used = true;
  } catch (e: any) {
    console.error("IA report error:", e.message);
    report = buildOfflineReport({
      studentName: profile?.full_name ?? "Estudiante",
      ranking: (session.ranking_preliminary as any[]) ?? [],
      cognitiveSummary,
      simulationResults: (session.simulation_results as any[]) ?? [],
      careers: careers ?? [],
    });
  }

  const { data: repRow } = await supabaseAdmin.from("reports").insert({
    session_id: session.id, student_id: req.user!.id,
    institution_id: profile?.institution_id ?? null,
    period_id: session.period_id, payload: report,
  }).select("*").single();
  rep = repRow;

  report = attachLaborMarketToReport(report, (session.ranking_preliminary as any[]) ?? []);
  if (rep) await supabaseAdmin.from("reports").update({ payload: report }).eq("id", rep.id);

  await supabaseAdmin.from("test_sessions").update({
    final_report: report, status: "completed", completed_at: new Date().toISOString(), current_stage: 5,
  }).eq("id", session.id);

  res.json({ report: { ...rep, payload: report }, ai_used });
});

export default router;

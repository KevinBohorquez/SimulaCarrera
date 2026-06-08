import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { generateCareerRanking, generateFinalReport } from "../services/ai.js";

const router = Router();

// POST /api/test/start — crea o reanuda la sesión activa del alumno
router.post("/start", requireAuth, requireRole("student"), async (req, res) => {
  const u = req.user!;
  const { data: existing } = await supabaseAdmin
    .from("test_sessions").select("*").eq("student_id", u.id).eq("status", "in_progress")
    .order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) return res.json({ session: existing });

  const { data: profile } = await supabaseAdmin
    .from("student_profiles").select("period_id").eq("user_id", u.id).maybeSingle();

  const { data, error } = await supabaseAdmin.from("test_sessions").insert({
    student_id: u.id, period_id: profile?.period_id ?? null, current_stage: 1,
  }).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ session: data });
});

// GET /api/test/questions/diagnostic
router.get("/questions/diagnostic", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("diagnostic_questions").select("id,code,text,dimension,options").eq("is_active", true);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ questions: data });
});

// POST /api/test/:sessionId/diagnostic — guarda respuestas y genera ranking con IA
const DiagnosticBody = z.object({
  answers: z.array(z.object({ question_code: z.string(), value: z.string() })),
});
router.post("/:sessionId/diagnostic", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = DiagnosticBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: questions } = await supabaseAdmin
    .from("diagnostic_questions").select("code,text,options").eq("is_active", true);
  const { data: careers } = await supabaseAdmin
    .from("careers").select("slug,name,area,description").eq("status", "active");

  let ranking: any[] = [];
  try {
    ranking = await generateCareerRanking({
      answers: parsed.data.answers,
      questions: questions ?? [],
      careers: careers ?? [],
    });
  } catch (e: any) {
    console.error("OpenAI error:", e.message);
    // Fallback heurístico simple
    ranking = (careers ?? []).slice(0, 5).map((c, i) => ({
      career_slug: c.slug, score: 80 - i * 5, reasoning: "Recomendación por defecto.",
    }));
  }

  const { data, error } = await supabaseAdmin.from("test_sessions").update({
    diagnostic_answers: parsed.data.answers, ranking_preliminary: ranking, current_stage: 2,
  }).eq("id", req.params.sessionId).eq("student_id", req.user!.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, ranking });
});

// GET /api/test/cognitive — adaptativo simple: 1 por capacidad, dificultad media
router.get("/cognitive", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("cognitive_questions")
    .select("id,code,text,capacity,difficulty,options").eq("is_active", true);
  if (error) return res.status(500).json({ error: error.message });
  // Quita is_correct antes de enviar al cliente
  const safe = (data ?? []).map((q: any) => ({
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
    cognitive_answers: parsed.data.answers, current_stage: 5,
  }).eq("id", req.params.sessionId).eq("student_id", req.user!.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ session: data, summary });
});

// POST /api/test/:sessionId/finalize — genera el reporte final con IA
router.post("/:sessionId/finalize", requireAuth, requireRole("student"), async (req, res) => {
  const { data: session, error: sErr } = await supabaseAdmin
    .from("test_sessions").select("*").eq("id", req.params.sessionId).eq("student_id", req.user!.id).single();
  if (sErr || !session) return res.status(404).json({ error: "session_not_found" });

  const { data: profile } = await supabaseAdmin
    .from("users").select("full_name,institution_id").eq("id", req.user!.id).single();

  // Re-calcular resumen cognitivo
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

  let report: any;
  try {
    report = await generateFinalReport({
      ranking: session.ranking_preliminary as any[],
      cognitiveSummary,
      simulationResults: (session.simulation_results as any[]) ?? [],
      studentName: profile?.full_name ?? "Estudiante",
    });
  } catch (e: any) {
    console.error("OpenAI error:", e.message);
    const top = (session.ranking_preliminary as any[])[0];
    report = {
      summary: "Reporte generado por defecto.",
      top_career: { slug: top?.career_slug, name: top?.career_slug, why: top?.reasoning ?? "" },
      alternatives: (session.ranking_preliminary as any[]).slice(1, 4),
      cognitive_insights: JSON.stringify(cognitiveSummary),
      next_steps: ["Investigar universidades", "Hablar con un profesional del área"],
    };
  }

  const { data: rep } = await supabaseAdmin.from("reports").insert({
    session_id: session.id, student_id: req.user!.id,
    institution_id: profile?.institution_id ?? null,
    period_id: session.period_id, payload: report,
  }).select("*").single();

  await supabaseAdmin.from("test_sessions").update({
    final_report: report, status: "completed", completed_at: new Date().toISOString(),
  }).eq("id", session.id);

  res.json({ report: rep });
});

export default router;

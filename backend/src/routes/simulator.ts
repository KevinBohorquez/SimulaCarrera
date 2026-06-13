import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { generateSimulationFeedback } from "../services/ai.js";
import { getSimulationForCareer } from "../data/simulation-factory.js";
import { richSimId, isRichSimId, slugFromRichSimId } from "../data/rich-simulations.js";

const router = Router();

function resolveSimulation(career: { id: string; slug: string; name: string; area?: string | null; description?: string | null }) {
  const sim = getSimulationForCareer(career);
  return {
    id: richSimId(career.slug),
    career_id: career.id,
    title: sim.title,
    description: sim.description,
    estimated_minutes: sim.estimated_minutes,
    intro: sim.intro,
    blocks: sim.blocks,
    is_rich: true,
  };
}

router.get("/career/:careerId", requireAuth, async (req, res) => {
  const { data: career, error: cErr } = await supabaseAdmin
    .from("careers").select("id, slug, name, area, description").eq("id", req.params.careerId).single();
  if (cErr || !career) return res.status(404).json({ error: "career_not_found" });
  res.json({ simulations: [resolveSimulation(career)], career });
});

router.get("/by-slug/:slug", requireAuth, async (req, res) => {
  const { data: career } = await supabaseAdmin
    .from("careers").select("id, slug, name, area, description").eq("slug", req.params.slug).single();
  if (!career) return res.status(404).json({ error: "career_not_found" });
  res.json({ simulations: [resolveSimulation(career)], career });
});

const SubmitBody = z.object({
  simulation_id: z.string(),
  decisions: z.array(z.object({ block_index: z.number(), value: z.string() })),
});

router.post("/:sessionId/submit", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = SubmitBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const simId = parsed.data.simulation_id;
  let sim: any = null;
  let careerName = "Carrera";
  let slug = "";

  if (isRichSimId(simId)) {
    slug = slugFromRichSimId(simId);
    const { data: career } = await supabaseAdmin
      .from("careers").select("slug, name, area, description").eq("slug", slug).single();
    if (!career) return res.status(404).json({ error: "career_not_found" });
    const rich = getSimulationForCareer(career);
    sim = { id: simId, title: rich.title, blocks: rich.blocks, slug };
    careerName = career.name;
  } else {
    const { data } = await supabaseAdmin.from("simulations").select("*, careers(name, slug)").eq("id", simId).single();
    sim = data;
    careerName = (data as any)?.careers?.name ?? "Carrera";
    slug = (data as any)?.careers?.slug ?? "";
  }
  if (!sim) return res.status(404).json({ error: "simulation_not_found" });

  const totals: Record<string, number> = {};
  const decisionDetails: Array<{ block_title: string; choice_label: string }> = [];

  for (const d of parsed.data.decisions) {
    const block = (sim.blocks as any[])[d.block_index];
    const opt = block?.options?.find((o: any) => o.value === d.value);
    decisionDetails.push({
      block_title: block?.title ?? block?.situation ?? `Bloque ${d.block_index + 1}`,
      choice_label: opt?.label ?? d.value,
    });
    if (opt?.impact) {
      for (const [k, v] of Object.entries(opt.impact as Record<string, number>)) {
        totals[k] = (totals[k] ?? 0) + v;
      }
    }
  }

  const { data: profile } = await supabaseAdmin
    .from("users").select("full_name").eq("id", req.user!.id).single();

  const feedback = await generateSimulationFeedback({
    careerName,
    simulationTitle: sim.title,
    decisions: decisionDetails,
    traitTotals: totals,
    studentName: profile?.full_name ?? "Estudiante",
  });

  const { data: session } = await supabaseAdmin
    .from("test_sessions").select("simulation_results, explored_careers, current_stage")
    .eq("id", req.params.sessionId).eq("student_id", req.user!.id).single();

  const prev = (session?.simulation_results as any[]) ?? [];
  const resultEntry = { simulation_id: simId, career_slug: slug || slugFromRichSimId(simId), totals, decisions: parsed.data.decisions, feedback };
  const next = [...prev, resultEntry];

  const { data: career } = await supabaseAdmin
    .from("careers").select("id").eq("slug", slug || slugFromRichSimId(simId)).maybeSingle();

  const explored = new Set([...(session?.explored_careers ?? []), career?.id].filter(Boolean));

  await supabaseAdmin.from("test_sessions").update({
    simulation_results: next,
    explored_careers: Array.from(explored),
    current_stage: Math.max(session?.current_stage ?? 3, 3),
  }).eq("id", req.params.sessionId);

  res.json({ result: { simulation_id: simId, totals, feedback } });
});

export default router;

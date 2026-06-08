import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/career/:careerId", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("simulations").select("*").eq("career_id", req.params.careerId).eq("status", "active");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ simulations: data });
});

const SubmitBody = z.object({
  simulation_id: z.string().uuid(),
  decisions: z.array(z.object({ block_index: z.number(), value: z.string() })),
});

router.post("/:sessionId/submit", requireAuth, requireRole("student"), async (req, res) => {
  const parsed = SubmitBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: sim } = await supabaseAdmin
    .from("simulations").select("*").eq("id", parsed.data.simulation_id).single();
  if (!sim) return res.status(404).json({ error: "simulation_not_found" });

  const totals: Record<string, number> = {};
  for (const d of parsed.data.decisions) {
    const block = (sim.blocks as any[])[d.block_index];
    const opt = block?.options?.find((o: any) => o.value === d.value);
    if (opt?.impact) for (const [k, v] of Object.entries(opt.impact as Record<string, number>)) {
      totals[k] = (totals[k] ?? 0) + v;
    }
  }

  const { data: session } = await supabaseAdmin
    .from("test_sessions").select("simulation_results")
    .eq("id", req.params.sessionId).eq("student_id", req.user!.id).single();
  const prev = (session?.simulation_results as any[]) ?? [];
  const next = [...prev, { simulation_id: sim.id, totals, decisions: parsed.data.decisions }];

  await supabaseAdmin.from("test_sessions").update({ simulation_results: next })
    .eq("id", req.params.sessionId);

  res.json({ result: { simulation_id: sim.id, totals } });
});

export default router;

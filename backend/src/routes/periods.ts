import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/", requireAuth, requireRole("institutional", "enterprise", "superadmin"), async (req, res) => {
  const u = req.user!;
  let targetInstId = u.institution_id;
  if (u.role === "enterprise" && req.query.inst_id) {
    if (req.query.inst_id === u.institution_id) {
      targetInstId = u.institution_id;
    } else {
      const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.query.inst_id).single();
      if (inst?.parent_id === u.institution_id) targetInstId = req.query.inst_id as string;
      else return res.status(403).json({ error: "forbidden" });
    }
  }

  let q = supabaseAdmin.from("academic_periods").select("*").order("start_date", { ascending: false });
  if (u.role !== "superadmin") q = q.eq("institution_id", targetInstId!);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ periods: data });
});

const Body = z.object({
  name: z.string().min(2),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().optional(),
  institution_id: z.string().uuid().optional(),
});

router.post("/", requireAuth, requireRole("institutional", "enterprise"), async (req, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let targetInstId = req.user!.institution_id;
  if (req.user!.role === "enterprise" && parsed.data.institution_id) {
    if (parsed.data.institution_id === req.user!.institution_id) {
      targetInstId = req.user!.institution_id;
    } else {
      const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", parsed.data.institution_id).single();
      if (inst?.parent_id === req.user!.institution_id) targetInstId = parsed.data.institution_id;
      else return res.status(403).json({ error: "forbidden" });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("academic_periods").insert({ ...parsed.data, institution_id: targetInstId })
    .select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ period: data });
});

router.patch("/:id", requireAuth, requireRole("institutional", "enterprise"), async (req, res) => {
  let targetInstId = req.user!.institution_id;
  if (req.user!.role === "enterprise" && req.query.inst_id) {
    const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.query.inst_id).single();
    if (inst?.parent_id === req.user!.institution_id) targetInstId = req.query.inst_id as string;
    else return res.status(403).json({ error: "forbidden" });
  }

  const { data, error } = await supabaseAdmin
    .from("academic_periods").update(req.body).eq("id", req.params.id)
    .eq("institution_id", targetInstId!).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ period: data });
});

router.delete("/:id", requireAuth, requireRole("institutional", "enterprise"), async (req, res) => {
  let targetInstId = req.user!.institution_id;
  if (req.user!.role === "enterprise" && req.query.inst_id) {
    const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.query.inst_id).single();
    if (inst?.parent_id === req.user!.institution_id) targetInstId = req.query.inst_id as string;
    else return res.status(403).json({ error: "forbidden" });
  }

  const { error } = await supabaseAdmin.from("academic_periods").delete()
    .eq("id", req.params.id).eq("institution_id", targetInstId!);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

export default router;

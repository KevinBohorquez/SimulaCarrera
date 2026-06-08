import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

// GET /api/institutions  (superadmin: todas; enterprise: hijas; institutional: la suya)
router.get("/", requireAuth, async (req, res) => {
  const u = req.user!;
  let q = supabaseAdmin.from("institutions").select("*").order("created_at", { ascending: false });
  if (u.role === "institutional") q = q.eq("id", u.institution_id!);
  if (u.role === "enterprise") q = q.or(`id.eq.${u.institution_id},parent_id.eq.${u.institution_id}`);
  if (u.role === "student") return res.status(403).json({ error: "forbidden" });
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ institutions: data });
});

const CreateInst = z.object({
  name: z.string().min(2),
  type: z.enum(["school", "academy", "enterprise_network"]).default("school"),
  parent_id: z.string().uuid().nullable().optional(),
  plan: z.enum(["starter", "pro", "enterprise"]).default("starter"),
  student_quota: z.number().int().positive().default(50),
  license_start: z.string().optional(),
  license_end: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  city: z.string().optional(),
});

router.post("/", requireAuth, requireRole("superadmin", "enterprise"), async (req, res) => {
  const parsed = CreateInst.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const payload = { ...parsed.data };
  if (req.user!.role === "enterprise") {
    payload.parent_id = req.user!.institution_id;
  }
  
  const { data, error } = await supabaseAdmin.from("institutions").insert(payload).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ institution: data });
});

router.patch("/:id", requireAuth, requireRole("superadmin", "enterprise"), async (req, res) => {
  if (req.user!.role === "enterprise") {
    const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.params.id).single();
    if (inst?.parent_id !== req.user!.institution_id && req.params.id !== req.user!.institution_id) {
      return res.status(403).json({ error: "forbidden" });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("institutions").update(req.body).eq("id", req.params.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ institution: data });
});

export default router;

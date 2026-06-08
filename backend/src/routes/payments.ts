import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const u = req.user!;
  let q = supabaseAdmin.from("payments").select("*, institutions(name)").order("created_at", { ascending: false });
  if (u.role !== "superadmin") q = q.eq("institution_id", u.institution_id!);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payments: data });
});

const CreatePayment = z.object({
  institution_id: z.string().uuid(),
  amount_pen: z.number().positive(),
  period_start: z.string(),
  period_end: z.string(),
  status: z.enum(["pending", "paid", "overdue", "cancelled"]).default("pending"),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
});

router.post("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const parsed = CreatePayment.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { data, error } = await supabaseAdmin
    .from("payments").insert({ ...parsed.data, created_by: req.user!.id }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ payment: data });
});

router.patch("/:id", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("payments").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payment: data });
});

export default router;

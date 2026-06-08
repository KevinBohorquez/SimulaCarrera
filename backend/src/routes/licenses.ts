import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { sendEmail, templates } from "../lib/email.js";

const router = Router();

// GET /api/licenses/expiring?days=30 — superadmin: licencias por vencer
router.get("/expiring", requireAuth, requireRole("superadmin"), async (req, res) => {
  const days = Number(req.query.days ?? 30);
  const until = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("institutions")
    .select("id,name,license_end,license_status,contact_email")
    .lte("license_end", until)
    .eq("license_status", "active")
    .order("license_end");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ institutions: data });
});

// POST /api/licenses/:id/renew — renueva licencia
const Renew = z.object({
  license_end: z.string(),
  plan: z.enum(["starter", "pro", "enterprise"]).optional(),
  student_quota: z.number().int().positive().optional(),
});
router.post("/:id/renew", requireAuth, requireRole("superadmin"), async (req, res) => {
  const parsed = Renew.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const patch: any = { license_end: parsed.data.license_end, license_status: "active" };
  if (parsed.data.plan) patch.plan = parsed.data.plan;
  if (parsed.data.student_quota) patch.student_quota = parsed.data.student_quota;
  const { data, error } = await supabaseAdmin.from("institutions")
    .update(patch).eq("id", req.params.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ institution: data });
});

// POST /api/licenses/:id/suspend
router.post("/:id/suspend", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { data, error } = await supabaseAdmin.from("institutions")
    .update({ license_status: "suspended" }).eq("id", req.params.id).select("*").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ institution: data });
});

// POST /api/licenses/notify-expiring — envía notificaciones; útil para cron
router.post("/notify-expiring", requireAuth, requireRole("superadmin"), async (_req, res) => {
  const today = new Date();
  const targets = [30, 14, 7, 1];
  const results: any[] = [];
  for (const d of targets) {
    const at = new Date(today.getTime() + d * 86400000).toISOString().slice(0, 10);
    const { data } = await supabaseAdmin.from("institutions")
      .select("id,name,contact_email,license_end").eq("license_end", at).eq("license_status", "active");
    for (const i of data ?? []) {
      if (!i.contact_email) continue;
      const tpl = templates.licenseExpiring(i.name, d);
      await sendEmail({ to: i.contact_email, ...tpl });
      results.push({ institution: i.id, days: d });
    }
  }
  res.json({ sent: results });
});

export default router;

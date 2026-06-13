import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { getLaborMarketStats, getAllLaborMarketStats } from "../data/labor-market-pe.js";

const router = Router();

router.get("/labor-market/overview", requireAuth, (_req, res) => {
  res.json({
    stats: getAllLaborMarketStats(),
    meta: {
      country: "Perú",
      disclaimer: "Datos curados de fuentes públicas (INEI, MTPE). No constituyen asesoría laboral oficial.",
      last_updated: "2025-01-15",
    },
  });
});

router.get("/:slug/labor-market", requireAuth, (req, res) => {
  const stats = getLaborMarketStats(req.params.slug);
  if (!stats) return res.status(404).json({ error: "labor_data_not_found" });
  res.json({ labor_market: stats });
});

router.get("/", requireAuth, async (_req, res) => {
  const { data, error } = await supabaseAdmin.from("careers").select("*").eq("status", "active").order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ careers: data });
});

router.get("/:slug", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("careers").select("*").eq("slug", req.params.slug).single();
  if (error) return res.status(404).json({ error: "not_found" });

  const labor = getLaborMarketStats(req.params.slug);
  res.json({ career: data, labor_market: labor });
});

router.post("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { data, error } = await supabaseAdmin.from("careers").insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ career: data });
});

export default router;

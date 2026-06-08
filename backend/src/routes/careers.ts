import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const u = req.user!;
  let q = supabaseAdmin.from("careers").select("*").eq("status", "active").order("name");
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ careers: data });
});

router.get("/:slug", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("careers").select("*").eq("slug", req.params.slug).single();
  if (error) return res.status(404).json({ error: "not_found" });
  res.json({ career: data });
});

router.post("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const { data, error } = await supabaseAdmin.from("careers").insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ career: data });
});

export default router;

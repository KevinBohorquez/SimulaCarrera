import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const BUCKET_LOGOS = process.env.STORAGE_BUCKET_LOGOS ?? "logos";
const BUCKET_CSV = process.env.STORAGE_BUCKET_CSV ?? "csv-imports";

// POST /api/uploads/logo — admin sube el logo de su institución
router.post("/logo", requireAuth, requireRole("institutional", "enterprise", "superadmin"), upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const instId = req.user!.institution_id;
    if (!instId) return res.status(400).json({ error: "no_institution" });
    const path = `${instId}/logo-${Date.now()}.${(req.file.originalname.split(".").pop() ?? "png")}`;
    const { error } = await supabaseAdmin.storage.from(BUCKET_LOGOS).upload(path, req.file.buffer, {
      upsert: true, contentType: req.file.mimetype,
    });
    if (error) return res.status(500).json({ error: error.message });
    const { data } = supabaseAdmin.storage.from(BUCKET_LOGOS).getPublicUrl(path);
    await supabaseAdmin.from("institutions").update({ /* opcional: logo_url */ }).eq("id", instId);
    res.json({ url: data.publicUrl, path });
  });

// POST /api/uploads/students-csv — admin sube CSV con alumnos
router.post("/students-csv", requireAuth, requireRole("institutional"), upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "no_file" });
    const instId = req.user!.institution_id!;
    const path = `${instId}/${Date.now()}-${req.file.originalname}`;
    await supabaseAdmin.storage.from(BUCKET_CSV).upload(path, req.file.buffer, {
      upsert: false, contentType: "text/csv",
    });

    // parse simple CSV: email,full_name,password,grade
    const lines = req.file.buffer.toString("utf-8").split(/\r?\n/).filter((l) => l.trim());
    const header = lines.shift()?.split(",").map((h) => h.trim().toLowerCase()) ?? [];
    const idx = (k: string) => header.indexOf(k);
    const results: any[] = [];
    for (const line of lines) {
      const cols = line.split(",").map((c) => c.trim());
      const email = cols[idx("email")];
      const full_name = cols[idx("full_name")] ?? cols[idx("nombre")] ?? "";
      const password = cols[idx("password")] ?? Math.random().toString(36).slice(2, 12);
      const grade = idx("grade") >= 0 ? cols[idx("grade")] : null;
      if (!email) { results.push({ email, ok: false, error: "missing_email" }); continue; }
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email, password, email_confirm: true,
          user_metadata: { full_name, role: "student" },
        });
        if (error || !data.user) throw error ?? new Error("auth_error");
        await supabaseAdmin.from("users").update({
          institution_id: instId, full_name, role: "student",
        }).eq("id", data.user.id);
        await supabaseAdmin.from("student_profiles").insert({
          user_id: data.user.id, institution_id: instId, grade,
        });
        results.push({ email, ok: true });
      } catch (e: any) {
        results.push({ email, ok: false, error: e.message });
      }
    }
    res.json({ stored: path, results });
  });

export default router;

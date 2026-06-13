import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { buildReportPdf } from "../lib/pdf.js";

const router = Router();
const BUCKET = process.env.STORAGE_BUCKET_REPORTS ?? "reports";

// GET /api/reports
router.get("/", requireAuth, requireRole("institutional", "enterprise", "superadmin", "student"), async (req, res) => {
  const u = req.user!;
  let q = supabaseAdmin
    .from("reports")
    .select("*, users!reports_student_id_fkey(full_name,email)")
    .order("created_at", { ascending: false });

  if (u.role === "student") {
    q = q.eq("student_id", u.id);
  } else if (u.role === "institutional") {
    q = q.eq("institution_id", u.institution_id!);
  } else if (u.role === "enterprise") {
    let targetInstId = u.institution_id;
    if (req.query.inst_id) {
      if (req.query.inst_id === u.institution_id) {
        targetInstId = u.institution_id;
      } else {
        const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.query.inst_id).single();
        if (inst?.parent_id === u.institution_id) targetInstId = req.query.inst_id as string;
        else return res.status(403).json({ error: "forbidden" });
      }
    }
    q = q.eq("institution_id", targetInstId!);
  }

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ reports: data });
});

router.get("/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("reports").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "not_found" });
  res.json({ report: data });
});

// GET /api/reports/:id/pdf — genera (o reusa) PDF y devuelve URL firmada
router.get("/:id/pdf", requireAuth, async (req, res) => {
  const { data: report, error } = await supabaseAdmin
    .from("reports").select("*").eq("id", req.params.id).single();
  if (error || !report) return res.status(404).json({ error: "not_found" });

  // Si ya hay pdf_url y aún existe en storage, firma una URL nueva
  const path = `${report.student_id}/${report.id}.pdf`;

  // Cargar metadatos
  const { data: student } = await supabaseAdmin
    .from("users").select("full_name, email, institution_id").eq("id", report.student_id).single();
  const { data: inst } = student?.institution_id
    ? await supabaseAdmin.from("institutions").select("name").eq("id", student.institution_id).single()
    : { data: null as any };

  // Fichas de carreras del reporte (top + alternativas)
  const slugs: string[] = [];
  const payload: any = report.payload;
  if (payload?.top_career?.slug) slugs.push(payload.top_career.slug);
  for (const a of payload?.alternatives ?? []) if (a.slug) slugs.push(a.slug);
  const { data: fichas } = slugs.length
    ? await supabaseAdmin.from("careers").select("*").in("slug", slugs)
    : { data: [] };

  const pdf = await buildReportPdf({
    studentName: student?.full_name ?? "Estudiante",
    institutionName: inst?.name ?? null,
    generatedAt: new Date(report.created_at),
    report: payload,
  });

  // Subir (upsert) a Storage privado
  await supabaseAdmin.storage.from(BUCKET).upload(path, pdf, {
    upsert: true, contentType: "application/pdf",
  });

  const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
  await supabaseAdmin.from("reports").update({ pdf_url: signed?.signedUrl ?? null }).eq("id", report.id);

  res.json({ url: signed?.signedUrl, expires_in: 600 });
});

export default router;

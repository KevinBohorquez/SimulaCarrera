import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { supabaseAdmin } from "../lib/supabase.js";

const router = Router();

// GET /api/students
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

  let q = supabaseAdmin
    .from("users")
    .select("id,email,full_name,institution_id,created_at,is_active, student_profiles(grade,period_id,enrolled_at)")
    .eq("role", "student");
  if (u.role !== "superadmin") q = q.eq("institution_id", targetInstId!);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ students: data });
});

const CreateStudent = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
  password: z.string().min(8),
  grade: z.string().optional(),
  period_id: z.string().uuid().optional(),
  institution_id: z.string().uuid().optional(),
});

// POST /api/students — crea cuenta de alumno (Supabase Auth + perfil)
router.post("/", requireAuth, requireRole("institutional", "enterprise"), async (req, res) => {
  const parsed = CreateStudent.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const u = req.user!;

  let targetInstId = u.institution_id;
  if (u.role === "enterprise" && parsed.data.institution_id) {
    if (parsed.data.institution_id === u.institution_id) {
      targetInstId = u.institution_id;
    } else {
      const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", parsed.data.institution_id).single();
      if (inst?.parent_id === u.institution_id) targetInstId = parsed.data.institution_id;
      else return res.status(403).json({ error: "forbidden" });
    }
  }

  // 1. crear usuario en Auth
  const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name, role: "student" },
  });
  if (cErr || !created.user) return res.status(400).json({ error: cErr?.message ?? "auth_error" });

  // 2. actualizar perfil con institution_id (el trigger ya creó la fila)
  const { error: uErr } = await supabaseAdmin
    .from("users")
    .update({ institution_id: targetInstId, full_name: parsed.data.full_name, role: "student" })
    .eq("id", created.user.id);
  if (uErr) return res.status(400).json({ error: uErr.message });

  // 3. crear student_profile
  await supabaseAdmin.from("student_profiles").insert({
    user_id: created.user.id,
    institution_id: targetInstId,
    period_id: parsed.data.period_id ?? null,
    grade: parsed.data.grade ?? null,
  });

  res.status(201).json({ id: created.user.id });
});

// POST /api/students/bulk — alta masiva (array)
router.post("/bulk", requireAuth, requireRole("institutional", "enterprise"), async (req, res) => {
  const Body = z.object({ students: z.array(CreateStudent) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let targetInstId = req.user!.institution_id;
  if (req.user!.role === "enterprise" && req.query.inst_id) {
    if (req.query.inst_id === req.user!.institution_id) {
      targetInstId = req.user!.institution_id;
    } else {
      const { data: inst } = await supabaseAdmin.from("institutions").select("parent_id").eq("id", req.query.inst_id).single();
      if (inst?.parent_id === req.user!.institution_id) targetInstId = req.query.inst_id as string;
      else return res.status(403).json({ error: "forbidden" });
    }
  }

  const results: Array<{ email: string; ok: boolean; error?: string }> = [];
  for (const s of parsed.data.students) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: s.email, password: s.password, email_confirm: true,
        user_metadata: { full_name: s.full_name, role: "student" },
      });
      if (error || !data.user) throw error ?? new Error("auth_error");
      await supabaseAdmin.from("users").update({
        institution_id: targetInstId, full_name: s.full_name, role: "student",
      }).eq("id", data.user.id);
      await supabaseAdmin.from("student_profiles").insert({
        user_id: data.user.id, institution_id: targetInstId,
        period_id: s.period_id ?? null, grade: s.grade ?? null,
      });
      results.push({ email: s.email, ok: true });
    } catch (e: any) {
      results.push({ email: s.email, ok: false, error: e.message });
    }
  }
  res.json({ results });
});

router.patch("/:id", requireAuth, requireRole("institutional", "enterprise", "superadmin"), async (req, res) => {
  const UpdateStudent = z.object({
    full_name: z.string().optional(),
    grade: z.string().optional(),
    password: z.string().min(8).optional(),
  });
  const parsed = UpdateStudent.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Update Auth if password changed
  if (parsed.data.password) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, {
      password: parsed.data.password,
    });
    if (error) return res.status(400).json({ error: error.message });
  }

  // Update profile
  if (parsed.data.full_name) {
    await supabaseAdmin.from("users").update({ full_name: parsed.data.full_name }).eq("id", req.params.id);
  }
  if (parsed.data.grade !== undefined) {
    await supabaseAdmin.from("student_profiles").update({ grade: parsed.data.grade }).eq("user_id", req.params.id);
  }

  res.json({ success: true });
});

router.delete("/:id", requireAuth, requireRole("institutional", "enterprise", "superadmin"), async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

export default router;

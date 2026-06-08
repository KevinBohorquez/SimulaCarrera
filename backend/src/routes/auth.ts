import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase.js";
import { sendEmail, templates } from "../lib/email.js";

const router = Router();

// POST /api/auth/signup-enterprise — crea cuenta Enterprise + institución raíz
const SignupEnterprise = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organization_name: z.string().min(2),
  contact_phone: z.string().optional(),
});

router.post("/signup-enterprise", async (req, res) => {
  const parsed = SignupEnterprise.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // 1. crear institución raíz tipo enterprise_network
  const { data: inst, error: iErr } = await supabaseAdmin.from("institutions").insert({
    name: parsed.data.organization_name,
    type: "enterprise_network",
    plan: "enterprise",
    student_quota: 0,
    contact_email: parsed.data.email,
    contact_phone: parsed.data.contact_phone,
  }).select("*").single();
  if (iErr) return res.status(500).json({ error: iErr.message });

  // 2. crear cuenta en Auth con rol enterprise
  const { data: user, error: uErr } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name, role: "enterprise" },
  });
  if (uErr || !user.user) return res.status(400).json({ error: uErr?.message });

  // 3. asignar institución y rol en perfil
  await supabaseAdmin.from("users").update({
    role: "enterprise", institution_id: inst.id, full_name: parsed.data.full_name,
  }).eq("id", user.user.id);

  // 4. email de bienvenida
  const tpl = templates.welcome(parsed.data.full_name, parsed.data.email, parsed.data.password);
  await sendEmail({ to: parsed.data.email, ...tpl });

  res.status(201).json({ ok: true, institution_id: inst.id });
});

// POST /api/auth/forgot — envía email de recuperación vía Supabase Auth
router.post("/forgot", async (req, res) => {
  const Body = z.object({ email: z.string().email() });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const redirectTo = `${process.env.APP_URL ?? "http://localhost:5173"}/reset-password`;
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery", email: parsed.data.email, options: { redirectTo },
  });
  if (error) return res.status(400).json({ error: error.message });
  // Supabase ya envía el email; respondemos OK sin filtrar si existe o no.
  res.json({ ok: true });
});

// POST /api/auth/contact — formulario público de contacto
router.post("/contact", async (req, res) => {
  const Body = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    organization: z.string().optional(),
    message: z.string().min(5),
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const to = process.env.CONTACT_TO ?? process.env.SMTP_FROM ?? "hola@simulacarrera.app";
  await sendEmail({
    to,
    subject: `Nuevo contacto: ${parsed.data.name}`,
    html: `<p><b>${parsed.data.name}</b> (${parsed.data.email})${parsed.data.organization ? " · " + parsed.data.organization : ""}</p><p>${parsed.data.message}</p>`,
  });
  res.json({ ok: true });
});

export default router;

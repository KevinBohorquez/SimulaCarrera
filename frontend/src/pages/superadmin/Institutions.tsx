import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase";
import { SuperadminShell } from "@/components/SuperadminShell";
import {
  Eye, Pencil, Trash2, Search, Plus, X,
  Building2, BookOpen, GraduationCap, AlertCircle,
  Mail, Phone, ShieldCheck, KeyRound,
} from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────

type InstitutionType = "school" | "academy" | "enterprise_network";
type LicenseStatus   = "active" | "suspended" | "expired";

interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  country: string;
  city: string | null;
  plan: "starter" | "pro" | "enterprise";
  student_quota: number;
  license_start: string | null;
  license_end:   string | null;
  license_status: LicenseStatus;
  contact_email:  string | null;
  contact_phone:  string | null;
  parent_id:      string | null;
  created_at:     string;
}

interface LinkedUser {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
}

interface CreateForm {
  // Datos institución
  name: string;
  type: InstitutionType;
  contact_email: string;
  contact_phone: string;
  student_quota: number;
  // Credenciales de acceso
  authEmail: string;
  password: string;
  confirmPassword: string;
}

interface EditForm {
  name: string;
  type: InstitutionType;
  contact_email: string;
  contact_phone: string;
  student_quota: number;
  // Credenciales (opcionales — solo se actualizan si el usuario los llena)
  newAuthEmail: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Validación ────────────────────────────────────────────────────────────────

const PHONE_RE = /^9\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const V = {
  name:            (v: string) => v.trim().length < 2 ? "Mínimo 2 caracteres" : null,
  contact_phone:   (v: string) => v && !PHONE_RE.test(v) ? "Exactamente 9 dígitos comenzando con 9" : null,
  contact_email:   (v: string) => v && !EMAIL_RE.test(v) ? "Ingresa un email válido" : null,
  student_quota:   (v: number) => v < 1 ? "Mínimo 1 cupo" : null,
  authEmail:       (v: string) => !EMAIL_RE.test(v) ? "Email obligatorio y válido" : null,
  password:        (v: string) => v.length < 8 ? "Mínimo 8 caracteres" : null,
  confirmPassword: (v: string, pwd: string) => v !== pwd ? "Las contraseñas no coinciden" : null,
};

type Touched = Set<string>;

function errorsCreate(f: CreateForm): Record<string, string | null> {
  return {
    name:            V.name(f.name),
    contact_phone:   V.contact_phone(f.contact_phone),
    contact_email:   V.contact_email(f.contact_email),
    student_quota:   V.student_quota(f.student_quota),
    authEmail:       V.authEmail(f.authEmail),
    password:        V.password(f.password),
    confirmPassword: V.confirmPassword(f.confirmPassword, f.password),
  };
}

function errorsEdit(f: EditForm): Record<string, string | null> {
  return {
    name:            V.name(f.name),
    contact_phone:   V.contact_phone(f.contact_phone),
    contact_email:   V.contact_email(f.contact_email),
    student_quota:   V.student_quota(f.student_quota),
    // Credenciales: solo validar si el usuario escribió algo
    newAuthEmail:    f.newAuthEmail  ? V.authEmail(f.newAuthEmail)  : null,
    newPassword:     f.newPassword   ? V.password(f.newPassword)    : null,
    confirmPassword: f.newPassword   ? V.confirmPassword(f.confirmPassword, f.newPassword) : null,
  };
}

// ── Componentes de input validado ─────────────────────────────────────────────

function ValidInput({
  fieldKey, error, touched,
  ...props
}: {
  fieldKey: string;
  error: string | null;
  touched: Touched;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const t = touched.has(fieldKey);
  const cls = t
    ? error
      ? "!border-red-400 focus:!border-red-400 !ring-1 !ring-red-100 bg-red-50/30"
      : "!border-green-500 focus:!border-green-500 !ring-1 !ring-green-100"
    : "";
  return (
    <div>
      <input className={`input ${cls}`} {...props} />
      {t && error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function ValidSelect({
  fieldKey, error, touched, children,
  ...props
}: {
  fieldKey: string;
  error: string | null;
  touched: Touched;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const t = touched.has(fieldKey);
  const cls = t
    ? error
      ? "!border-red-400 focus:!border-red-400 !ring-1 !ring-red-100"
      : "!border-green-500 focus:!border-green-500 !ring-1 !ring-green-100"
    : "";
  return (
    <div>
      <select className={`input ${cls}`} {...props}>{children}</select>
      {t && error && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <AlertCircle size={11} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

// ── Helpers visuales ──────────────────────────────────────────────────────────

const TYPE_META: Record<InstitutionType, { label: string; icon: typeof Building2; color: string }> = {
  school:             { label: "Colegio",      icon: GraduationCap, color: "text-violet-600 bg-violet-50" },
  academy:            { label: "Academia",     icon: BookOpen,      color: "text-sky-600 bg-sky-50"       },
  enterprise_network: { label: "Red Empresa",  icon: Building2,     color: "text-emerald-600 bg-emerald-50" },
};

const STATUS_CFG: Record<LicenseStatus, { label: string; dot: string; badge: string }> = {
  active:    { label: "Activa",     dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  suspended: { label: "Suspendida", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"       },
  expired:   { label: "Vencida",    dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200"             },
};

function StatusBadge({ status }: { status: LicenseStatus }) {
  const { label, dot, badge } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function TypeChip({ type }: { type: InstitutionType }) {
  const { label, icon: Icon, color } = TYPE_META[type];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg ${color}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

// ── Fecha helpers ─────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split("T")[0]; }
function oneYearStr() {
  const d = new Date(); d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}
function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s + "T12:00:00").toLocaleDateString("es-PE", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Sección separadora ────────────────────────────────────────────────────────

function SectionDivider({ icon: Icon, label }: { icon: typeof Building2; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <div className="w-6 h-6 rounded-lg bg-brand-lila flex items-center justify-center">
        <Icon size={13} className="text-brand-morado" />
      </div>
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-purple-100" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

// ── Modal Crear ───────────────────────────────────────────────────────────────

const EMPTY_CREATE: CreateForm = {
  name: "", type: "school", contact_email: "", contact_phone: "",
  student_quota: 50, authEmail: "", password: "", confirmPassword: "",
};

const ALL_CREATE_FIELDS = new Set([
  "name", "type", "contact_phone", "contact_email",
  "student_quota", "authEmail", "password", "confirmPassword",
]);

function CreateModal({ onSave, onClose }: {
  onSave: (f: CreateForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateForm>(EMPTY_CREATE);
  const [touched, setTouched] = useState<Touched>(new Set());
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);

  const errors = errorsCreate(form);
  const touch  = (k: string) => setTouched(t => new Set([...t, k]));
  const set    = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => {
    touch(k); setForm(f => ({ ...f, [k]: v }));
  };

  const hasErrors = Object.values(errors).some(Boolean);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(ALL_CREATE_FIELDS);
    if (hasErrors) return;
    setBusy(true); setErr(null);
    try { await onSave(form); onClose(); }
    catch (e: any) { setErr(e.message ?? "Error inesperado"); }
    finally { setBusy(false); }
  }

  return (
    <Overlay onClick={onClose}>
      <form onSubmit={submit} className="card my-10 w-full max-w-lg" onClick={stop}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-morado to-purple-500 flex items-center justify-center shadow-md shadow-purple-200">
              <Building2 size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Nueva institución</h2>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-1 text-slate-400"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* ── Datos institución ── */}
          <SectionDivider icon={Building2} label="Datos de la institución" />

          <Field label="Nombre *">
            <ValidInput fieldKey="name" error={errors.name} touched={touched}
              required value={form.name} placeholder="Ej. Colegio San Marcos"
              onChange={e => set("name", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <ValidSelect fieldKey="type" error={errors.type} touched={touched}
                value={form.type} onChange={e => set("type", e.target.value as InstitutionType)}>
                <option value="school">Colegio</option>
                <option value="academy">Academia</option>
                <option value="enterprise_network">Red Enterprise</option>
              </ValidSelect>
            </Field>
            <Field label="Cupos (test adquiridos)">
              <ValidInput fieldKey="student_quota" error={errors.student_quota} touched={touched}
                type="number" min={1} value={form.student_quota}
                onChange={e => set("student_quota", Number(e.target.value))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email de contacto">
              <ValidInput fieldKey="contact_email" error={errors.contact_email} touched={touched}
                type="email" value={form.contact_email} placeholder="contacto@inst.edu"
                onChange={e => set("contact_email", e.target.value)} />
            </Field>
            <Field label="Teléfono">
              <ValidInput fieldKey="contact_phone" error={errors.contact_phone} touched={touched}
                type="tel" value={form.contact_phone} placeholder="9XXXXXXXX"
                maxLength={9} onChange={e => set("contact_phone", e.target.value)} />
            </Field>
          </div>

          {/* Info auto */}
          <div className="rounded-xl bg-brand-lila/40 border border-purple-100 px-4 py-3 text-xs text-slate-500 space-y-0.5">
            <p>📅 Inicio de licencia: <span className="font-medium text-slate-700">{fmtDate(todayStr())}</span></p>
            <p>📅 Fin de licencia: <span className="font-medium text-slate-700">{fmtDate(oneYearStr())}</span></p>
            <p>📦 Plan: <span className="font-medium text-slate-700">Starter</span></p>
          </div>

          {/* ── Credenciales ── */}
          <SectionDivider icon={ShieldCheck} label="Credenciales de acceso" />

          <Field label="Email de acceso *">
            <ValidInput fieldKey="authEmail" error={errors.authEmail} touched={touched}
              type="email" value={form.authEmail} placeholder="acceso@institución.com"
              onChange={e => set("authEmail", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Contraseña *">
              <ValidInput fieldKey="password" error={errors.password} touched={touched}
                type="password" value={form.password} placeholder="Mínimo 8 caracteres"
                onChange={e => set("password", e.target.value)} />
            </Field>
            <Field label="Confirmar contraseña *">
              <ValidInput fieldKey="confirmPassword" error={errors.confirmPassword} touched={touched}
                type="password" value={form.confirmPassword} placeholder="Repetir contraseña"
                onChange={e => set("confirmPassword", e.target.value)} />
            </Field>
          </div>
        </div>

        {err && (
          <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
            <AlertCircle size={15} /> {err}
          </p>
        )}

        <div className="flex gap-2 mt-6 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Creando…" : "Crear institución"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Modal Editar ──────────────────────────────────────────────────────────────

const ALL_EDIT_FIELDS = new Set([
  "name", "type", "contact_phone", "contact_email", "student_quota",
  "newAuthEmail", "newPassword", "confirmPassword",
]);

function EditModal({ inst, onSave, onClose }: {
  inst: Institution;
  onSave: (f: EditForm) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name:            inst.name,
    type:            inst.type,
    contact_email:   inst.contact_email ?? "",
    contact_phone:   inst.contact_phone ?? "",
    student_quota:   inst.student_quota,
    newAuthEmail:    "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Touched>(new Set());
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState<string | null>(null);

  // Carga usuario vinculado
  const { data: linkedUser } = useQuery({
    queryKey: ["sa-linked-user", inst.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("users").select("id,email,full_name,phone,role")
        .eq("institution_id", inst.id).maybeSingle();
      return data as LinkedUser | null;
    },
  });

  const errors = errorsEdit(form);
  const touch  = (k: string) => setTouched(t => new Set([...t, k]));
  const set    = <K extends keyof EditForm>(k: K, v: EditForm[K]) => {
    touch(k); setForm(f => ({ ...f, [k]: v }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(ALL_EDIT_FIELDS);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true); setErr(null);
    try { await onSave(form); onClose(); }
    catch (e: any) { setErr(e.message ?? "Error inesperado"); }
    finally { setBusy(false); }
  }

  return (
    <Overlay onClick={onClose}>
      <form onSubmit={submit} className="card my-10 w-full max-w-lg" onClick={stop}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-orange-200">
              <Pencil size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Editar institución</h2>
              <p className="text-xs text-slate-400">{inst.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-1 text-slate-400"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <SectionDivider icon={Building2} label="Datos de la institución" />

          <Field label="Nombre *">
            <ValidInput fieldKey="name" error={errors.name} touched={touched}
              required value={form.name} onChange={e => set("name", e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <ValidSelect fieldKey="type" error={errors.type} touched={touched}
                value={form.type} onChange={e => set("type", e.target.value as InstitutionType)}>
                <option value="school">Colegio</option>
                <option value="academy">Academia</option>
                <option value="enterprise_network">Red Enterprise</option>
              </ValidSelect>
            </Field>
            <Field label="Cupos (test adquiridos)">
              <ValidInput fieldKey="student_quota" error={errors.student_quota} touched={touched}
                type="number" min={1} value={form.student_quota}
                onChange={e => set("student_quota", Number(e.target.value))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email de contacto">
              <ValidInput fieldKey="contact_email" error={errors.contact_email} touched={touched}
                type="email" value={form.contact_email}
                onChange={e => set("contact_email", e.target.value)} />
            </Field>
            <Field label="Teléfono">
              <ValidInput fieldKey="contact_phone" error={errors.contact_phone} touched={touched}
                type="tel" value={form.contact_phone} maxLength={9}
                onChange={e => set("contact_phone", e.target.value)} />
            </Field>
          </div>

          {/* Credenciales de acceso — editables */}
          <SectionDivider icon={KeyRound} label="Credenciales de acceso" />

          {linkedUser && (
            <div className="rounded-xl bg-brand-lila/30 border border-purple-100 px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
              <Mail size={12} className="text-brand-morado shrink-0" />
              Email actual: <span className="font-semibold text-slate-700">{linkedUser.email}</span>
            </div>
          )}

          <Field label="Nuevo email de acceso">
            <ValidInput
              fieldKey="newAuthEmail" error={errors.newAuthEmail} touched={touched}
              type="email" value={form.newAuthEmail}
              placeholder="Dejar vacío para no cambiar"
              onChange={e => set("newAuthEmail", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nueva contraseña">
              <ValidInput
                fieldKey="newPassword" error={errors.newPassword} touched={touched}
                type="password" value={form.newPassword}
                placeholder="Dejar vacío para no cambiar"
                onChange={e => set("newPassword", e.target.value)}
              />
            </Field>
            <Field label="Confirmar contraseña">
              <ValidInput
                fieldKey="confirmPassword" error={errors.confirmPassword} touched={touched}
                type="password" value={form.confirmPassword}
                placeholder="Repetir nueva contraseña"
                onChange={e => set("confirmPassword", e.target.value)}
              />
            </Field>
          </div>

          <p className="text-[11px] text-slate-400">
            Los campos vacíos no modifican las credenciales actuales.
            El nombre y teléfono se sincronizan automáticamente con la cuenta.
          </p>
        </div>

        {err && (
          <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
            <AlertCircle size={15} /> {err}
          </p>
        )}
        <div className="flex gap-2 mt-6 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
          <button disabled={busy} className="btn-primary">{busy ? "Guardando…" : "Guardar cambios"}</button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Modal Detalle ─────────────────────────────────────────────────────────────

function DetailModal({ inst, sedes, onClose }: {
  inst: Institution; sedes: Institution[]; onClose: () => void;
}) {
  const { data: linkedUser } = useQuery({
    queryKey: ["sa-linked-user", inst.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("users").select("id,email,full_name,phone,role")
        .eq("institution_id", inst.id).maybeSingle();
      return data as LinkedUser | null;
    },
  });

  return (
    <Overlay onClick={onClose}>
      <div className="card my-10 w-full max-w-lg" onClick={stop}>
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden mb-5 bg-gradient-to-br from-brand-morado to-purple-500 p-5 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,white,transparent)]" />
          <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white">
            <X size={18} />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{inst.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <TypeChip type={inst.type} />
                <StatusBadge status={inst.license_status} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20 text-center">
            {[
              { label: "Cupos", val: inst.student_quota },
              { label: "Plan",  val: inst.plan.charAt(0).toUpperCase() + inst.plan.slice(1) },
              { label: "País",  val: inst.country },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] text-white/60 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info licencia */}
        <dl className="divide-y divide-slate-100">
          {[
            ["Inicio de licencia", fmtDate(inst.license_start)],
            ["Fin de licencia",    fmtDate(inst.license_end)],
            ["Email de contacto",  inst.contact_email ?? "—"],
            ["Teléfono",           inst.contact_phone ?? "—"],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2.5 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-800">{val}</dd>
            </div>
          ))}
        </dl>

        {/* Cuenta vinculada */}
        {linkedUser && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Cuenta de acceso
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={13} className="text-slate-400" />
                <span className="font-medium text-slate-800">{linkedUser.email}</span>
              </div>
              {linkedUser.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={13} className="text-slate-400" />
                  <span className="font-medium text-slate-800">{linkedUser.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sedes */}
        {sedes.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Sedes ({sedes.length})
            </p>
            <div className="space-y-2">
              {sedes.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{s.student_quota} cupos</span>
                    <StatusBadge status={s.license_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Overlay>
  );
}

// ── Modal Eliminar ────────────────────────────────────────────────────────────

function DeleteModal({ inst, onConfirm, onClose, busy }: {
  inst: Institution; onConfirm: () => void; onClose: () => void; busy: boolean;
}) {
  return (
    <Overlay onClick={onClose}>
      <div className="card my-10 w-full max-w-sm text-center" onClick={stop}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Eliminar institución</h3>
        <p className="text-sm text-slate-500 mb-2">
          ¿Eliminar <span className="font-semibold text-slate-800">"{inst.name}"</span>?
        </p>
        <p className="text-xs text-red-400 bg-red-50 rounded-lg px-3 py-2 mb-6">
          También se eliminará la cuenta de acceso vinculada a esta institución.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={onConfirm} disabled={busy}
            className="btn-primary !bg-red-600 hover:!bg-red-700 !shadow-red-100">
            {busy ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function InstitutionsAdmin() {
  const qc = useQueryClient();

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["sa-institutions"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("institutions").select("*").is("parent_id", null).order("name");
      if (error) throw new Error(error.message);
      return data as Institution[];
    },
  });

  const { data: allSedes = [] } = useQuery({
    queryKey: ["sa-sedes"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("institutions").select("*").not("parent_id", "is", null);
      if (error) throw new Error(error.message);
      return data as Institution[];
    },
  });

  // ── Filtros combinables
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | LicenseStatus>("");
  const [typeFilter,   setTypeFilter]   = useState<"" | InstitutionType>("");

  const filtered = useMemo(() =>
    institutions.filter(i => {
      const q = search.toLowerCase();
      return (
        i.name.toLowerCase().includes(q) &&
        (statusFilter === "" || i.license_status === statusFilter) &&
        (typeFilter   === "" || i.type          === typeFilter)
      );
    }),
  [institutions, search, statusFilter, typeFilter]);

  // ── Estados de modales
  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<Institution | null>(null);
  const [viewTarget,   setViewTarget]   = useState<Institution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);
  const [deleteBusy,   setDeleteBusy]   = useState(false);

  function sedesOf(id: string) { return allSedes.filter(s => s.parent_id === id); }

  // ── Crear: dual mutation institutions + auth/users
  async function handleCreate(form: CreateForm) {
    // 1. Insertar institución
    const { data: instData, error: instErr } = await supabaseAdmin
      .from("institutions")
      .insert([{
        name:           form.name.trim(),
        type:           form.type,
        plan:           "starter",
        student_quota:  form.student_quota,
        contact_email:  form.contact_email.trim() || null,
        contact_phone:  form.contact_phone.trim() || null,
        country:        "PE",
        license_start:  todayStr(),
        license_end:    oneYearStr(),
        license_status: "active",
        parent_id:      null,
      }])
      .select("id")
      .single();
    if (instErr) throw new Error(instErr.message);

    const institutionId = instData.id as string;

    // 2. Crear cuenta de autenticación (el trigger auto-inserta en public.users)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email:         form.authEmail.trim(),
      password:      form.password,
      email_confirm: true,
    });
    if (authErr) {
      // Rollback: eliminar la institución si falla la creación del usuario
      await supabaseAdmin.from("institutions").delete().eq("id", institutionId);
      throw new Error(authErr.message);
    }

    const userId = authData.user.id;

    // 3. Actualizar public.users con los datos mapeados
    const { error: userErr } = await supabaseAdmin
      .from("users")
      .update({
        full_name:      form.name.trim(),
        phone:          form.contact_phone.trim() || null,
        role:           "enterprise",
        institution_id: institutionId,
      })
      .eq("id", userId);
    if (userErr) throw new Error(userErr.message);

    qc.invalidateQueries({ queryKey: ["sa-institutions"] });
    qc.invalidateQueries({ queryKey: ["sa-inst-count"] });
  }

  // ── Editar: actualiza institutions, public.users y opcionalmente las credenciales auth
  async function handleEdit(form: EditForm) {
    if (!editTarget) return;

    // 1. Actualizar institución
    const { error: instErr } = await supabaseAdmin
      .from("institutions")
      .update({
        name:          form.name.trim(),
        type:          form.type,
        student_quota: form.student_quota,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
      })
      .eq("id", editTarget.id);
    if (instErr) throw new Error(instErr.message);

    // 2. Sincronizar full_name y phone en public.users
    const userUpdate: Record<string, string | null> = {
      full_name: form.name.trim(),
      phone:     form.contact_phone.trim() || null,
    };
    if (form.newAuthEmail.trim()) {
      userUpdate.email = form.newAuthEmail.trim();
    }
    const { data: linkedUsers } = await supabaseAdmin
      .from("users").select("id").eq("institution_id", editTarget.id);

    const { error: userErr } = await supabaseAdmin
      .from("users").update(userUpdate).eq("institution_id", editTarget.id);
    if (userErr) throw new Error(userErr.message);

    // 3. Actualizar credenciales en auth.users si el usuario las cambió
    for (const u of linkedUsers ?? []) {
      const authUpdate: { email?: string; password?: string } = {};
      if (form.newAuthEmail.trim())  authUpdate.email    = form.newAuthEmail.trim();
      if (form.newPassword.trim())   authUpdate.password = form.newPassword.trim();
      if (Object.keys(authUpdate).length > 0) {
        const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(
          u.id, authUpdate,
        );
        if (authErr) throw new Error(authErr.message);
      }
    }

    qc.invalidateQueries({ queryKey: ["sa-institutions"] });
    qc.invalidateQueries({ queryKey: ["sa-linked-user", editTarget.id] });
  }

  // ── Eliminar: borra primero la cuenta auth (cascada a public.users), luego la institución
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      // Obtener IDs de usuarios vinculados
      const { data: linkedUsers } = await supabaseAdmin
        .from("users").select("id").eq("institution_id", deleteTarget.id);

      // Eliminar cada cuenta de auth (el ON DELETE CASCADE borra public.users)
      for (const u of linkedUsers ?? []) {
        await supabaseAdmin.auth.admin.deleteUser(u.id);
      }

      // Eliminar la institución
      const { error } = await supabaseAdmin
        .from("institutions").delete().eq("id", deleteTarget.id);
      if (error) throw new Error(error.message);

      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ["sa-institutions"] });
      qc.invalidateQueries({ queryKey: ["sa-inst-count"] });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeleteBusy(false);
    }
  }

  // ── Render
  return (
    <SuperadminShell title="Instituciones">

      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-white border border-purple-100 shadow-sm">
        {/* Búsqueda */}
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className="input pl-9 text-sm h-9"
            placeholder="Buscar institución…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filtro tipo */}
        <select
          className="input text-sm h-9 w-auto min-w-[150px]"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as "" | InstitutionType)}
        >
          <option value="">Todos los tipos</option>
          <option value="enterprise_network">Red Empresarial</option>
          <option value="school">Colegio</option>
          <option value="academy">Academia</option>
        </select>

        {/* Filtro estado */}
        <select
          className="input text-sm h-9 w-auto min-w-[150px]"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as "" | LicenseStatus)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activa</option>
          <option value="suspended">Suspendida</option>
          <option value="expired">Vencida</option>
        </select>

        {/* Indicador de filtros activos */}
        {(search || typeFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setTypeFilter(""); setStatusFilter(""); }}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Limpiar
          </button>
        )}

        <button
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2 h-9 ml-auto shrink-0"
        >
          <Plus size={15} /> Nueva institución
        </button>
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl border border-purple-100 shadow-sm overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-brand-lila/60 to-purple-50 border-b border-purple-100">
              <th className="text-left text-slate-600 font-semibold px-5 py-3.5">Institución</th>
              <th className="text-left text-slate-600 font-semibold px-4 py-3.5">Tipo</th>
              <th className="text-left text-slate-600 font-semibold px-4 py-3.5">Test adquiridos</th>
              <th className="text-left text-slate-600 font-semibold px-4 py-3.5">Estado</th>
              <th className="px-4 py-3.5 w-32" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-14">
                  <div className="inline-block w-6 h-6 rounded-full border-2 border-brand-morado border-t-transparent animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-14 text-slate-400">
                  {search || statusFilter || typeFilter
                    ? "Sin resultados para los filtros aplicados."
                    : "No hay instituciones registradas."}
                </td>
              </tr>
            )}
            {filtered.map((inst, idx) => {
              const sedCount = sedesOf(inst.id).length;
              return (
                <tr key={inst.id}
                  className={`border-b border-slate-50 last:border-0 hover:bg-brand-lila/10 transition-colors
                    ${idx % 2 !== 0 ? "bg-slate-50/40" : ""}`}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 leading-tight">{inst.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {inst.student_quota} test adquiridos
                      {sedCount > 0 && (
                        <span className="ml-2 text-violet-400">
                          · {sedCount} sede{sedCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-4"><TypeChip type={inst.type} /></td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-lila font-bold text-brand-morado text-sm">
                      {inst.student_quota}
                    </span>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={inst.license_status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <ActionBtn title="Ver detalle" onClick={() => setViewTarget(inst)}
                        className="hover:text-brand-morado hover:bg-brand-lila">
                        <Eye size={15} />
                      </ActionBtn>
                      <ActionBtn title="Editar" onClick={() => setEditTarget(inst)}
                        className="hover:text-amber-600 hover:bg-amber-50">
                        <Pencil size={15} />
                      </ActionBtn>
                      <ActionBtn title="Eliminar" onClick={() => setDeleteTarget(inst)}
                        className="hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isLoading && institutions.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>
              {filtered.length} de {institutions.length} institución{institutions.length !== 1 ? "es" : ""}
              {(search || statusFilter || typeFilter) && " (filtradas)"}
            </span>
            <span className="text-violet-400">Solo instituciones principales</span>
          </div>
        )}
      </div>

      {/* ── Modales ── */}
      {createOpen   && <CreateModal onSave={handleCreate} onClose={() => setCreateOpen(false)} />}
      {editTarget   && <EditModal   inst={editTarget}    onSave={handleEdit}   onClose={() => setEditTarget(null)} />}
      {viewTarget   && <DetailModal inst={viewTarget}    sedes={sedesOf(viewTarget.id)} onClose={() => setViewTarget(null)} />}
      {deleteTarget && <DeleteModal inst={deleteTarget}  onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} busy={deleteBusy} />}
    </SuperadminShell>
  );
}

// ── Micro helpers ─────────────────────────────────────────────────────────────

function Overlay({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function ActionBtn({ children, title, onClick, className }: {
  children: React.ReactNode; title: string; onClick: () => void; className: string;
}) {
  return (
    <button title={title} onClick={onClick}
      className={`p-1.5 rounded-lg text-slate-400 transition-colors ${className}`}>
      {children}
    </button>
  );
}

const stop = (e: React.MouseEvent) => e.stopPropagation();

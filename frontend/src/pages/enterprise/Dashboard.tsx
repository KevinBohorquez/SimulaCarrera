import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowUpRight, Building2, Edit2,
  Loader2, Network, Plus, ShoppingCart, Users, X,
} from "lucide-react";

// ── Modal Upsell ──────────────────────────────────────────────────────────────

function UpsellModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-xl bg-brand-lila flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={22} className="text-brand-morado" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Adquirir cupos adicionales</h3>
        <p className="text-sm text-slate-500 mb-3 leading-relaxed">
          Has alcanzado el límite de cupos de tu plan actual. Para asignar más a tus sedes, amplía tu contrato.
        </p>
        <p className="text-xs text-brand-morado bg-brand-lila/50 rounded-lg px-3 py-2 mb-6">
          🚧 Próximamente. Contacta a tu ejecutivo de cuenta para ampliar tu plan.
        </p>
        <button onClick={onClose} className="btn-primary w-full">Entendido</button>
      </div>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export function EnterpriseDashboard() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const institutionId = profile?.institution_id ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["enterprise-inst"],
    queryFn: () => api<any>("/api/institutions"),
    enabled: !!institutionId,
  });

  // BUG FIX: institución principal y sedes separadas correctamente
  const parentInst = useMemo(
    () => data?.institutions?.find((i: any) => i.id === institutionId) ?? null,
    [data, institutionId],
  );
  const sedes: any[] = useMemo(
    () => data?.institutions?.filter((i: any) => i.parent_id === institutionId) ?? [],
    [data, institutionId],
  );

  // Cupos
  const totalQuota    = parentInst?.student_quota ?? 0;
  const assignedQuota = useMemo(
    () => sedes.reduce((sum: number, s: any) => sum + Number(s.student_quota ?? 0), 0),
    [sedes],
  );
  const availableQuota = Math.max(0, totalQuota - assignedQuota);
  const pctUsed        = totalQuota > 0 ? Math.min(100, Math.round((assignedQuota / totalQuota) * 100)) : 0;

  // Alumnos por sede
  const studentQueries = useQueries({
    queries: sedes.map((s) => ({
      queryKey: ["students", s.id],
      queryFn:  () => api<any>(`/api/students?inst_id=${s.id}`),
      enabled:  sedes.length > 0,
    })),
  });

  function getStudentsUsed(sedeId: string) {
    const idx = sedes.findIndex((s) => s.id === sedeId);
    return studentQueries[idx]?.data?.students?.length ?? 0;
  }

  // Modal estado
  const [showModal,  setShowModal]  = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [editing,    setEditing]    = useState<any>(null);
  const [form,       setForm]       = useState({ name: "", city: "", student_quota: 10, type: "school" });
  const [quotaErr,   setQuotaErr]   = useState<string | null>(null);
  const [mutErr,     setMutErr]     = useState<string | null>(null);
  const [mutBusy,    setMutBusy]    = useState(false);

  const availableForForm = editing
    ? availableQuota + Number(editing.student_quota ?? 0)
    : availableQuota;

  function validateQuota(val: number) {
    if (val < 1) return "Mínimo 1 cupo.";
    if (val > availableForForm)
      return `Solo hay ${availableForForm} cupo${availableForForm !== 1 ? "s" : ""} disponible${availableForForm !== 1 ? "s" : ""}.`;
    return null;
  }

  const openAdd = () => {
    if (availableQuota === 0) { setUpsellOpen(true); return; }
    setEditing(null);
    setForm({ name: "", city: "", student_quota: Math.min(10, availableQuota), type: "school" });
    setQuotaErr(null); setMutErr(null);
    setShowModal(true);
  };

  const openEdit = (inst: any) => {
    setEditing(inst);
    setForm({ name: inst.name, city: inst.city ?? "", student_quota: inst.student_quota, type: inst.type });
    setQuotaErr(null); setMutErr(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateQuota(form.student_quota);
    if (err) { setQuotaErr(err); return; }
    setMutBusy(true); setMutErr(null);
    try {
      const payload = { ...form, student_quota: Number(form.student_quota), parent_id: institutionId };
      if (editing) {
        await api(`/api/institutions/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await api("/api/institutions", { method: "POST", body: JSON.stringify(payload) });
      }
      qc.invalidateQueries({ queryKey: ["enterprise-inst"] });
      closeModal();
    } catch (e: any) {
      setMutErr(e.message ?? "Error al guardar.");
    } finally {
      setMutBusy(false);
    }
  };

  return (
    <AppShell title={parentInst?.name ?? "Panel de red"}>

      {/* Banner */}
      <div className="card bg-gradient-to-r from-brand-morado to-brand-lavanda text-white mb-6 p-8">
        <div className="flex items-start gap-3">
          <Network size={24} className="shrink-0 mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-1">Gestión centralizada de sedes</h2>
            <p className="text-white/85 text-sm">
              Distribuye cupos entre tus sedes y monitorea el uso desde un solo lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Stats de cupos */}
      {!isLoading && parentInst && (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Cupos totales",     value: totalQuota,     sub: "test adquiridos",   warn: false },
            { label: "Asignados a sedes", value: assignedQuota,  sub: `${pctUsed}% del total`, warn: false },
            { label: "Disponibles",       value: availableQuota, sub: availableQuota === 0 ? "Sin cupos libres" : "para distribuir",
              warn: availableQuota === 0 },
          ].map(({ label, value, sub, warn }) => (
            <div key={label} className={`card ${warn ? "border-amber-300 bg-amber-50" : ""}`}>
              <h3 className="text-sm text-slate-500 mb-1">{label}</h3>
              <p className={`text-2xl font-bold ${warn ? "text-amber-700" : "text-slate-900"}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${warn ? "text-amber-600" : "text-slate-400"}`}>{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Barra de distribución */}
      {!isLoading && parentInst && totalQuota > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Distribución de cupos</span>
            {availableQuota === 0 && (
              <button
                onClick={() => setUpsellOpen(true)}
                className="btn-outline text-xs py-1 px-3 flex items-center gap-1"
              >
                <ShoppingCart size={13} /> Adquirir más cupos
              </button>
            )}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{assignedQuota} asignados de {totalQuota}</span>
            <span>{pctUsed}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pctUsed >= 100 ? "bg-red-400" : pctUsed >= 80 ? "bg-amber-400" : "bg-brand-morado"
              }`}
              style={{ width: `${pctUsed}%` }}
            />
          </div>
        </div>
      )}

      {/* Encabezado de sedes */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Sedes {!isLoading && <span className="text-slate-400 font-normal text-base">({sedes.length})</span>}
        </h2>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Nueva sede
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-brand-morado" />
          <span className="text-slate-500 text-sm">Cargando sedes…</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="card border-red-200 bg-red-50 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">No se pudo cargar la información. Intenta de nuevo.</p>
        </div>
      )}

      {/* Sin sedes */}
      {!isLoading && !isError && sedes.length === 0 && (
        <div className="card text-center py-12">
          <Building2 size={32} className="text-brand-morado mx-auto mb-3" />
          <p className="text-slate-600 mb-1 font-medium">Sin sedes registradas</p>
          <p className="text-sm text-slate-400 mb-4">Agrega tu primera sede para comenzar a distribuir cupos.</p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
            <Plus size={15} /> Crear primera sede
          </button>
        </div>
      )}

      {/* Grid de sedes */}
      {sedes.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sedes.map((sede: any) => {
            const used = getStudentsUsed(sede.id);
            const pct  = sede.student_quota > 0
              ? Math.min(100, Math.round((used / sede.student_quota) * 100))
              : 0;
            const full = used >= sede.student_quota && sede.student_quota > 0;

            return (
              <div key={sede.id} className="card hover:border-brand-morado/40">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-lila flex items-center justify-center">
                    <Building2 size={18} className="text-brand-morado" />
                  </div>
                  <button
                    onClick={() => openEdit(sede)}
                    className="text-slate-400 hover:text-brand-morado transition-colors p-1"
                    title="Editar sede"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>

                <h3 className="font-semibold text-slate-900 mb-0.5">{sede.name}</h3>
                {sede.city && <p className="text-xs text-slate-400 mb-3">{sede.city}</p>}

                {/* Uso de alumnos */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1"><Users size={11} /> Alumnos</span>
                    <span className={`font-medium ${full ? "text-red-500" : "text-slate-700"}`}>
                      {used} / {sede.student_quota}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${full ? "bg-red-400" : "bg-brand-morado"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{sede.student_quota} test adquiridos</p>
                </div>

                <Link
                  to={`/enterprise/sede/${sede.id}`}
                  className="btn-outline w-full flex items-center justify-center gap-1 text-sm"
                >
                  Ver sede <ArrowUpRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal Crear / Editar ──────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={closeModal}
        >
          <div className="card my-10 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? "Editar sede" : "Nueva sede"}
              </h2>
              <button onClick={closeModal} className="btn-ghost p-1 text-slate-400"><X size={17} /></button>
            </div>

            {/* Cupos disponibles */}
            <div className="flex items-center justify-between text-sm bg-brand-lila/40 border border-purple-100 rounded-lg px-3 py-2 mb-4">
              <span className="text-slate-600">Cupos disponibles</span>
              <span className={`font-bold ${availableForForm === 0 ? "text-red-500" : "text-brand-morado"}`}>
                {availableForForm}
              </span>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Nombre de la sede *</label>
                <input
                  required className="input"
                  placeholder="Ej: Sede Lima Norte"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Ciudad</label>
                <input
                  className="input" placeholder="Ej: Lima"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                />
              </div>

              <div>
                <label className="label">Tipo</label>
                <select
                  className="input" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                >
                  <option value="school">Colegio</option>
                  <option value="academy">Academia / Instituto</option>
                </select>
              </div>

              <div>
                <label className="label">Cupos asignados *</label>
                <input
                  required type="number" min={1} max={availableForForm}
                  className="input"
                  value={form.student_quota}
                  onChange={e => {
                    const v = Number(e.target.value);
                    setForm(f => ({ ...f, student_quota: v }));
                    setQuotaErr(validateQuota(v));
                  }}
                />
                {quotaErr
                  ? <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{quotaErr}</p>
                  : <p className="text-xs text-slate-400 mt-1">Máximo {availableForForm} cupos disponibles.</p>
                }
              </div>

              {availableForForm === 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-amber-700">Sin cupos disponibles para distribuir.</p>
                  <button
                    type="button"
                    onClick={() => { closeModal(); setUpsellOpen(true); }}
                    className="text-xs text-amber-700 underline flex items-center gap-1"
                  >
                    <ShoppingCart size={11} /> Ampliar plan
                  </button>
                </div>
              )}

              {mutErr && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle size={14} /> {mutErr}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancelar</button>
                <button
                  disabled={mutBusy || !!quotaErr || availableForForm === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {mutBusy
                    ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                    : editing ? "Guardar cambios" : "Crear sede"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {upsellOpen && <UpsellModal onClose={() => setUpsellOpen(false)} />}
    </AppShell>
  );
}

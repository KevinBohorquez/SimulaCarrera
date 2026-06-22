import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Edit2,
  LayoutGrid,
  Loader2,
  MapPin,
  Network,
  Plus,
  School,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const planStyle: Record<string, string> = {
  starter: "bg-slate-100 text-slate-600",
  estandar: "bg-brand-lila/80 text-brand-morado",
  pro: "bg-violet-100 text-violet-700",
  enterprise: "bg-purple-100 text-purple-800",
};

const typeLabel: Record<string, string> = {
  school: "Colegio",
  academy: "Academia / Instituto",
};

export function EnterpriseDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["enterprise-inst"],
    queryFn: () => api<any>("/api/institutions"),
    retry: 1,
  });

  const sedes: any[] = data?.institutions?.filter((i: any) => i.type !== "enterprise_network") ?? [];

  const studentQueries = useQueries({
    queries: sedes.map((sede) => ({
      queryKey: ["students", sede.id],
      queryFn: () => api<any>(`/api/students?inst_id=${sede.id}`),
      enabled: sedes.length > 0,
    })),
  });

  function getSedeUsage(sedeId: string, quota: number) {
    const idx = sedes.findIndex((s) => s.id === sedeId);
    const used = studentQueries[idx]?.data?.students?.length ?? 0;
    const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
    return { used, pct };
  }

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", city: "", student_quota: 50, type: "school" });

  const mut = useMutation({
    mutationFn: (payload: any) =>
      editing
        ? api(`/api/institutions/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
        : api("/api/institutions", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprise-inst"] });
      closeModal();
    },
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", city: "", student_quota: 50, type: "school" });
    setShowModal(true);
  };

  const openEdit = (inst: any) => {
    setEditing(inst);
    setForm({
      name: inst.name,
      city: inst.city ?? "",
      student_quota: inst.student_quota,
      type: inst.type,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ ...form, student_quota: Number(form.student_quota) });
  };

  const totalQuota = sedes.reduce((sum, sede) => sum + Number(sede.student_quota ?? 0), 0);
  const activePlans = new Set(sedes.map((sede) => sede.plan ?? "starter")).size;

  return (
    <AppShell title="Red Enterprise" hideTitle>
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white p-8 mb-8 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-morado via-purple-400 to-brand-celeste" />

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-morado mb-4">
              <Sparkles size={13} />
              Gestión centralizada
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-950 leading-tight mb-3">
              Administra tus sedes
            </h1>
            <p className="text-slate-600 text-base leading-relaxed max-w-xl">
              Crea sedes, revisa cupos y monitorea alumnos, reportes y ciclos académicos desde aquí.
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 self-start lg:self-auto whitespace-nowrap">
            <Plus size={16} /> Nueva sede
          </button>
        </div>

        {/* STATS - 3 cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-white/80 p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-lila text-brand-morado flex items-center justify-center">
                <Network size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-500">Sedes</span>
            </div>
            <p className="text-3xl font-bold text-slate-950">{sedes.length}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white/80 p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-lila text-brand-morado flex items-center justify-center">
                <Users size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-500">Cupo total</span>
            </div>
            <p className="text-3xl font-bold text-slate-950">{totalQuota}</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white/80 p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100/60 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-lila text-brand-morado flex items-center justify-center">
                <School size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-500">Planes activos</span>
            </div>
            <p className="text-3xl font-bold text-slate-950">{sedes.length ? activePlans : 0}</p>
          </div>
        </div>
      </section>

      {/* LOADING */}
      {isLoading && (
        <div className="flex items-center justify-center py-20 text-brand-morado gap-3 rounded-2xl border border-purple-100 bg-white">
          <Loader2 size={24} className="animate-spin" />
          <span className="text-slate-500">Cargando sedes...</span>
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 flex items-start gap-4">
          <AlertCircle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">No se pudo conectar con el servidor</p>
            <p className="text-sm text-red-500 mt-1">{(error as any)?.message ?? "ERR_CONNECTION_REFUSED"}</p>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && sedes.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-purple-100 rounded-2xl bg-gradient-to-b from-purple-50 to-white">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-lila text-brand-morado">
            <LayoutGrid size={40} />
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-2">Aún no tienes sedes creadas</p>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Cuando agregues sedes, aparecerán aquí con accesos rápidos a alumnos, reportes y ciclos.
          </p>
          <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Crear primera sede
          </button>
        </div>
      )}

      {/* TUSSEDES SECTION */}
      {sedes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Tus sedes ({sedes.length})</h2>
            <button onClick={openAdd} className="btn-outline hidden lg:flex items-center gap-2">
              <Plus size={16} /> Nueva sede
            </button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sedes.map((sede: any) => {
              const { used, pct } = getSedeUsage(sede.id, sede.student_quota);
              return (
                <div
                  key={sede.id}
                  className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100/60 hover:border-purple-200"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-morado via-purple-400 to-brand-celeste" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center transition-all duration-300 group-hover:bg-brand-morado group-hover:text-white">
                      <Building2 size={20} />
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planStyle[sede.plan] ?? planStyle.starter}`}>
                      {sede.plan ?? "starter"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{sede.name}</h3>

                  {sede.city && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                      <MapPin size={13} /> {sede.city}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 mb-4">{typeLabel[sede.type] ?? sede.type}</p>

                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-slate-500 font-medium mb-2">
                      <span>Cuota de alumnos</span>
                      <span className="text-slate-700 font-bold">
                        {used} / {sede.student_quota}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-morado to-brand-celeste rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{pct}% utilizado</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => openEdit(sede)}
                      className="text-xs text-slate-400 hover:text-brand-morado flex items-center gap-1 transition-colors"
                    >
                      <Edit2 size={13} /> Editar
                    </button>
                    <Link to={`/enterprise/sede/${sede.id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      Ver <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-purple-100/40 w-full max-w-md p-8 relative border border-purple-100">
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-lila text-brand-morado flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{editing ? "Editar sede" : "Nueva sede"}</h2>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Building2 size={14} className="text-brand-morado" /> Nombre de la sede *
                </label>
                <input
                  required
                  className="input"
                  placeholder="Ej: Colegio San Martín"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <MapPin size={14} className="text-brand-morado" /> Ciudad
                </label>
                <input
                  className="input"
                  placeholder="Ej: Lima"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <Users size={14} className="text-brand-morado" /> Cupo de alumnos *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  className="input"
                  value={form.student_quota}
                  onChange={(e) => setForm({ ...form, student_quota: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <School size={14} className="text-brand-morado" /> Tipo de institución
                </label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="school">Colegio</option>
                  <option value="academy">Academia / Instituto</option>
                </select>
              </div>

              {mut.isError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{(mut.error as any)?.message ?? "Error al guardar."}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button disabled={mut.isPending} className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                  {mut.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> {editing ? "Guardar" : "Crear"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export type PhaseStatus = "locked" | "available" | "in_progress" | "complete";

export interface PhaseInfo {
  num: number;
  key: string;
  title: string;
  subtitle: string;
  status: PhaseStatus;
  unlocked: boolean;
  progress_pct?: number;
}

export interface TestProgress {
  session_id: string | null;
  riasec_length?: number;
  holland_code?: string;
  phases: PhaseInfo[];
  can_finalize: boolean;
  report_ready: boolean;
}

export const PHASE_META = [
  { num: 1, key: "riasec", title: "Intereses RIASEC", subtitle: "Inventario vocacional · escala Likert" },
  { num: 2, key: "profile", title: "Perfil Holland", subtitle: "Código RIASEC y carreras compatibles" },
  { num: 3, key: "sjt", title: "Simulación SJT", subtitle: "Juicio situacional · Big Five" },
  { num: 4, key: "cat", title: "Aptitudes CAT", subtitle: "30 ítems adaptativos · Rasch" },
] as const;

export function computeProgressFromSession(session: any | null): TestProgress {
  if (!session) {
    return {
      session_id: null,
      phases: PHASE_META.map((p) => ({
        ...p,
        status: p.num === 1 ? "available" : "locked",
        unlocked: p.num === 1,
      })),
      can_finalize: false,
      report_ready: false,
    };
  }

  const diag = session.diagnostic_answers ?? {};
  const sim = (session.simulation_results ?? []) as any[];
  const cog = session.cognitive_answers ?? {};
  const totalItems = diag.selected_items?.length ?? diag.riasec_length ?? 0;
  const answered = (diag.answers ?? []).length;

  const stage1Complete = !!diag.scores?.holland_code;
  const stage2Complete = (session.current_stage ?? 1) >= 3;
  const stage3Complete = sim.length > 0 && sim[0]?.sjt_total != null;
  const stage4Complete = !!cog.results;

  const phaseStatus = (num: number): PhaseStatus => {
    if (num === 1) {
      if (stage1Complete) return "complete";
      if (answered > 0 || (diag.selected_items?.length ?? 0) > 0) return "in_progress";
      return "available";
    }
    if (num === 2) {
      if (stage2Complete) return "complete";
      if (stage1Complete) return "available";
      return "locked";
    }
    if (num === 3) {
      if (stage3Complete) return "complete";
      if (stage2Complete) return sim.length ? "in_progress" : "available";
      return "locked";
    }
    if (num === 4) {
      if (stage4Complete) return "complete";
      if (stage3Complete) {
        const catIdx = cog.cat_state?.item_index ?? 0;
        return catIdx > 0 ? "in_progress" : "available";
      }
      return "locked";
    }
    return "locked";
  };

  const unlocked = (num: number) => {
    if (num === 1) return true;
    if (num === 2) return stage1Complete;
    if (num === 3) return stage2Complete;
    if (num === 4) return stage3Complete;
    return false;
  };

  return {
    session_id: session.id,
    riasec_length: diag.riasec_length,
    holland_code: diag.scores?.holland_code,
    phases: PHASE_META.map((p) => ({
      ...p,
      status: phaseStatus(p.num),
      unlocked: unlocked(p.num),
      progress_pct: p.num === 1 && totalItems ? Math.round((answered / totalItems) * 100) : undefined,
    })),
    can_finalize: stage4Complete,
    report_ready: session.status === "completed",
  };
}

export function sessionStageLabel(session: any): string {
  if (session.status === "completed") return "Completado — reporte disponible";

  const progress = computeProgressFromSession(session);
  const inProgress = progress.phases.find((p) => p.status === "in_progress");
  if (inProgress) return `En progreso: ${inProgress.title}`;

  const next = progress.phases.find((p) => p.unlocked && p.status !== "complete");
  if (next) return `Pendiente: ${next.title}`;

  if (progress.can_finalize) return "Listo para generar reporte";
  return "Sin iniciar";
}

export function sessionListItem(session: any, reportId?: string | null) {
  const progress = computeProgressFromSession(session);
  return {
    id: session.id,
    label: session.label ?? session.diagnostic_answers?.meta?.label ?? "Evaluación vocacional integral",
    price_pen: session.price_pen ?? session.diagnostic_answers?.meta?.price_pen ?? 35,
    status: session.status,
    started_at: session.started_at,
    completed_at: session.completed_at,
    holland_code: progress.holland_code,
    stage_label: sessionStageLabel(session),
    current_stage: session.current_stage,
    can_finalize: progress.can_finalize,
    report_id: reportId ?? null,
    phases_summary: progress.phases.map((p) => ({ num: p.num, status: p.status })),
  };
}

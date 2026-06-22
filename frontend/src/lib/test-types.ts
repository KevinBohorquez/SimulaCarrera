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
  report_id?: string | null;
  riasec_length?: number;
  holland_code?: string;
  phases: PhaseInfo[];
  can_finalize: boolean;
  report_ready: boolean;
}

export interface TestSessionItem {
  id: string;
  label: string;
  price_pen: number;
  status: string;
  started_at: string;
  completed_at?: string | null;
  holland_code?: string;
  stage_label: string;
  current_stage: number;
  can_finalize: boolean;
  report_id?: string | null;
  phases_summary: Array<{ num: number; status: PhaseStatus }>;
}

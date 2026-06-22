import { supabaseAdmin } from "../lib/supabase.js";
import { generateFinalReport } from "./ai.js";
import { buildOfflineReport } from "./report-builder.js";
import { attachLaborMarketToReport } from "./labor-market.js";
import { CAREER_HOLLAND } from "../data/career-holland-map.js";
import { matchCareersByHolland } from "./riasec-engine.js";

export async function finalizeSessionReport(session: any, studentId: string) {
  const { data: existingReport } = await supabaseAdmin
    .from("reports")
    .select("*")
    .eq("session_id", session.id)
    .maybeSingle();

  if (existingReport) {
    return { report: existingReport, ai_used: false, already_completed: true };
  }

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("full_name,institution_id")
    .eq("id", studentId)
    .single();

  const diag = session.diagnostic_answers as any;
  const cog = session.cognitive_answers as any;
  const cognitiveSummary: Record<string, number> = cog?.results?.percentiles ?? {};

  const { data: careers } = await supabaseAdmin.from("careers").select("*").eq("status", "active");

  let ranking = (session.ranking_preliminary as any[]) ?? [];
  if (diag?.scores?.holland_code && diag?.scores?.normalized) {
    ranking = matchCareersByHolland(
      diag.scores.holland_code,
      diag.scores.normalized,
      careers ?? [],
      CAREER_HOLLAND,
    );
    await supabaseAdmin.from("test_sessions").update({ ranking_preliminary: ranking }).eq("id", session.id);
  }

  let report: any;
  let ai_used = false;
  try {
    report = await generateFinalReport({
      ranking,
      cognitiveSummary,
      simulationResults: (session.simulation_results as any[]) ?? [],
      studentName: profile?.full_name ?? "Estudiante",
      careersData: careers ?? [],
      hollandCode: diag?.scores?.holland_code,
      riasecScores: diag?.scores?.normalized,
    });
    report.generated_with_ai = true;
    report.holland_code = diag?.scores?.holland_code;
    report.riasec_scores = diag?.scores?.normalized;
    report.sjt_summary = (session.simulation_results as any[])?.[0];
    report.cognitive_theta = cog?.results?.theta_by_field;
    ai_used = true;
  } catch (e: any) {
    console.error("IA report error:", e.message);
    report = buildOfflineReport({
      studentName: profile?.full_name ?? "Estudiante",
      ranking,
      cognitiveSummary,
      simulationResults: (session.simulation_results as any[]) ?? [],
      careers: careers ?? [],
      hollandCode: diag?.scores?.holland_code,
      riasecScores: diag?.scores?.normalized,
    });
  }

  report = attachLaborMarketToReport(report, ranking);

  let repRow: any = null;
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("reports")
    .insert({
      session_id: session.id,
      student_id: studentId,
      institution_id: profile?.institution_id ?? null,
      period_id: session.period_id,
      payload: report,
    })
    .select("*")
    .single();

  if (insertErr) {
    const { data: dup } = await supabaseAdmin
      .from("reports")
      .select("*")
      .eq("session_id", session.id)
      .maybeSingle();
    if (dup) {
      repRow = dup;
      await supabaseAdmin.from("reports").update({ payload: report }).eq("id", dup.id);
    } else {
      throw new Error(insertErr.message);
    }
  } else {
    repRow = inserted;
  }

  if (!repRow?.id) throw new Error("report_insert_failed");

  await supabaseAdmin
    .from("test_sessions")
    .update({
      final_report: report,
      status: "completed",
      completed_at: new Date().toISOString(),
      current_stage: 5,
    })
    .eq("id", session.id);

  return { report: { ...repRow, payload: report }, ai_used, already_completed: false };
}

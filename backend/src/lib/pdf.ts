import PDFDocument from "pdfkit";
import { CERTIFYING_PSYCHOLOGIST } from "../data/certifying-psychologist.js";

const PURPLE = "#7044BF";
const LILA = "#E7DAF6";
const DARK = "#1e293b";
const GRAY = "#64748b";
const MARGIN = 45;
const FOOTER_H = 36;

export interface ReportPayload {
  summary?: string;
  personality_profile?: string;
  top_career?: {
    slug?: string; name?: string; why?: string; match_score?: number;
    strengths?: string[]; challenges?: string[]; day_in_life?: string;
  };
  alternatives?: Array<{ slug?: string; name?: string; why?: string; match_score?: number }>;
  alternatives_insight?: string;
  decision_factors?: string[];
  academic_fit?: string;
  full_ranking?: Array<{ slug?: string; name?: string; score?: number; reasoning?: string }>;
  cognitive_insights?: string;
  cognitive_scores?: Array<{ capacity: string; score: number; level: string; tip: string }>;
  simulation_insights?: string;
  simulation_highlights?: string[];
  career_fichas?: Array<{
    slug?: string; name?: string; salary?: string; employability?: number;
    demand?: string; pros?: string[]; cons?: string[]; university_tip?: string;
  }>;
  generated_with_ai?: boolean;
  labor_market_summary?: string;
  labor_market?: Array<{
    career_slug: string;
    occupation_label: string;
    data_year: string;
    salary_pen: { average: number; p25?: number; p75?: number; period: string };
    employment: { employment_rate_pct: number; unemployment_rate_pct: number; sector?: string };
    demand: { level: string; vacancies_mtpe?: number; trend: string; projection_2026?: string };
    insights?: string[];
  }>;
}

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - MARGIN * 2;
}

function bottomLimit(doc: PDFKit.PDFDocument) {
  return doc.page.height - MARGIN - FOOTER_H;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > bottomLimit(doc)) {
    doc.addPage();
    doc.y = MARGIN;
  }
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  ensureSpace(doc, 32);
  doc.fillColor(PURPLE).fontSize(13).font("Helvetica-Bold").text(title, MARGIN, doc.y, { width: contentWidth(doc) });
  doc.moveDown(0.12);
  const lineY = doc.y;
  doc.rect(MARGIN, lineY, contentWidth(doc), 2).fill(PURPLE);
  doc.y = lineY + 8;
}

function paragraph(doc: PDFKit.PDFDocument, text: string, opts?: { size?: number; color?: string; indent?: number }) {
  const W = contentWidth(doc) - (opts?.indent ?? 0);
  const size = opts?.size ?? 10;
  doc.font("Helvetica").fontSize(size);
  const h = doc.heightOfString(text, { width: W, lineGap: 3 });
  ensureSpace(doc, h + 4);
  doc.fillColor(opts?.color ?? DARK).text(text, MARGIN + (opts?.indent ?? 0), doc.y, {
    width: W, align: "justify", lineGap: 3,
  });
}

function bullet(doc: PDFKit.PDFDocument, text: string, color = DARK) {
  const W = contentWidth(doc) - 8;
  doc.font("Helvetica").fontSize(10);
  const h = doc.heightOfString(`•  ${text}`, { width: W });
  ensureSpace(doc, h + 2);
  doc.fillColor(color).text(`•  ${text}`, MARGIN + 4, doc.y, { width: W });
}

function tintedBox(doc: PDFKit.PDFDocument, title: string | null, body: string, titleSize = 10) {
  const W = contentWidth(doc);
  const pad = 10;
  const innerW = W - pad * 2;
  doc.font("Helvetica-Bold").fontSize(titleSize);
  const titleH = title ? doc.heightOfString(title, { width: innerW }) + 6 : 0;
  doc.font("Helvetica").fontSize(9);
  const bodyH = doc.heightOfString(body, { width: innerW, lineGap: 3 });
  const boxH = pad * 2 + titleH + bodyH;
  ensureSpace(doc, boxH + 6);
  const boxY = doc.y;
  doc.rect(MARGIN, boxY, W, boxH).fill(LILA);
  let y = boxY + pad;
  if (title) {
    doc.fillColor(PURPLE).fontSize(titleSize).font("Helvetica-Bold").text(title, MARGIN + pad, y, { width: innerW });
    y = doc.y;
  }
  doc.fillColor(DARK).fontSize(9).font("Helvetica").text(body, MARGIN + pad, y, { width: innerW, lineGap: 3 });
  doc.y = boxY + boxH + 8;
}

function careerHighlightBox(doc: PDFKit.PDFDocument, career: NonNullable<ReportPayload["top_career"]>) {
  const W = contentWidth(doc);
  const pad = 10;
  const innerW = W - pad * 2;
  doc.font("Helvetica").fontSize(9);
  const whyH = career.why ? doc.heightOfString(career.why, { width: innerW, lineGap: 3 }) : 0;
  const boxH = 58 + whyH;
  ensureSpace(doc, boxH + 8);
  const boxY = doc.y;
  doc.rect(MARGIN, boxY, W, boxH).fill(LILA);
  doc.fillColor(PURPLE).fontSize(9).font("Helvetica-Bold").text("CARRERA MÁS COMPATIBLE", MARGIN + pad, boxY + pad);
  doc.fillColor(DARK).fontSize(17).font("Helvetica-Bold").text(career.name ?? "", MARGIN + pad, boxY + pad + 14, { width: innerW - 50 });
  if (career.match_score != null) {
    doc.fillColor(PURPLE).fontSize(22).font("Helvetica-Bold").text(
      `${career.match_score}%`, MARGIN + W - pad - 50, boxY + pad + 12, { width: 45, align: "right" },
    );
  }
  if (career.why) {
    doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(career.why, MARGIN + pad, boxY + pad + 38, { width: innerW, lineGap: 3 });
  }
  doc.y = boxY + boxH + 8;
}

function drawBar(doc: PDFKit.PDFDocument, score: number) {
  const w = contentWidth(doc) * 0.55;
  const h = 7;
  const y = doc.y + 2;
  doc.rect(MARGIN, y, w, h).fill("#e2e8f0");
  doc.rect(MARGIN, y, w * (Math.min(100, score) / 100), h).fill(PURPLE);
  doc.y = y + h + 4;
}

function drawHeader(doc: PDFKit.PDFDocument, studentName: string, institutionName: string | null | undefined, date: Date) {
  doc.rect(0, 0, doc.page.width, 88).fill(PURPLE);
  doc.fillColor("#fff").fontSize(20).font("Helvetica-Bold").text("SimulaCarrera", MARGIN, 24);
  doc.fontSize(10).font("Helvetica").text("Reporte Vocacional Integral", MARGIN, 50);
  doc.fontSize(9).text(date.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }), MARGIN, 66);
  doc.y = 100;
  doc.fillColor(DARK).fontSize(16).font("Helvetica-Bold").text(`Hola, ${studentName}`, MARGIN, doc.y);
  doc.moveDown(0.15);
  if (institutionName) {
    doc.fontSize(9).fillColor(GRAY).font("Helvetica").text(institutionName);
    doc.moveDown(0.15);
  }
  doc.moveDown(0.4);
}

function drawCertification(doc: PDFKit.PDFDocument, studentName: string, date: Date) {
  const W = contentWidth(doc);
  sectionTitle(doc, "Certificación profesional");
  paragraph(
    doc,
    "Este informe fue elaborado bajo supervisión metodológica de SimulaCarrera y certificado por el psicólogo educativo asesor de la plataforma.",
  );
  doc.moveDown(0.4);

  const boxH = 78;
  ensureSpace(doc, boxH + 20);
  const boxY = doc.y;
  doc.rect(MARGIN, boxY, W, boxH).lineWidth(0.8).strokeColor("#cbd5e1").stroke();

  doc.fillColor(PURPLE).fontSize(18).font("Helvetica-Oblique")
    .text(CERTIFYING_PSYCHOLOGIST.shortName, MARGIN + 14, boxY + 12, { width: 220 });
  doc.moveTo(MARGIN + 14, boxY + 36).lineTo(MARGIN + 200, boxY + 32).lineWidth(1).strokeColor(PURPLE).stroke();

  doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold")
    .text(CERTIFYING_PSYCHOLOGIST.name, MARGIN + 14, boxY + 42, { width: W - 28 });
  doc.fontSize(9).font("Helvetica").fillColor(GRAY)
    .text(`${CERTIFYING_PSYCHOLOGIST.title} · ${CERTIFYING_PSYCHOLOGIST.credential}`, MARGIN + 14, doc.y, { width: W - 28 });
  doc.text(CERTIFYING_PSYCHOLOGIST.cop, MARGIN + 14, doc.y, { width: W - 28 });

  doc.y = boxY + boxH + 10;
  paragraph(
    doc,
    `Documento emitido para ${studentName} el ${date.toLocaleDateString("es-PE")}. Válido como orientación vocacional con respaldo psicométrico (RIASEC, SJT, CAT).`,
    { size: 9, color: GRAY },
  );
}

export async function buildReportPdf(opts: {
  studentName: string;
  institutionName?: string | null;
  generatedAt: Date;
  report: ReportPayload;
}): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN, bufferPages: true, autoFirstPage: true });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
  const r = opts.report;

  drawHeader(doc, opts.studentName, opts.institutionName, opts.generatedAt);

  sectionTitle(doc, "Resumen ejecutivo");
  paragraph(doc, r.summary ?? "—");
  if (r.personality_profile) {
    doc.moveDown(0.25);
    tintedBox(doc, "Tu perfil vocacional", r.personality_profile);
  }

  if (r.top_career?.name) {
    doc.moveDown(0.15);
    careerHighlightBox(doc, r.top_career);
    if (r.top_career.day_in_life) {
      doc.fillColor(PURPLE).fontSize(10).font("Helvetica-Bold").text("Un día en esta carrera", MARGIN, doc.y);
      doc.moveDown(0.1);
      paragraph(doc, r.top_career.day_in_life);
    }
    if (r.top_career.strengths?.length) {
      doc.moveDown(0.15);
      doc.fillColor("#16a34a").fontSize(9).font("Helvetica-Bold").text("Fortalezas: ", MARGIN, doc.y, { continued: true });
      doc.fillColor(DARK).font("Helvetica").text(r.top_career.strengths.join(" · "));
    }
    if (r.top_career.challenges?.length) {
      doc.moveDown(0.1);
      doc.fillColor("#b45309").fontSize(9).font("Helvetica-Bold").text("Desafíos: ", MARGIN, doc.y, { continued: true });
      doc.fillColor(DARK).font("Helvetica").text(r.top_career.challenges.join(" · "));
    }
    doc.moveDown(0.3);
  }

  if (r.alternatives?.length) {
    sectionTitle(doc, "Alternativas vocacionales");
    if (r.alternatives_insight) {
      paragraph(doc, r.alternatives_insight);
      doc.moveDown(0.2);
    }
    for (const alt of r.alternatives) {
      ensureSpace(doc, 24);
      doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text(
        `${alt.name}${alt.match_score != null ? ` — ${alt.match_score}%` : ""}`, MARGIN, doc.y, { width: contentWidth(doc) },
      );
      if (alt.why) paragraph(doc, alt.why, { size: 9, color: GRAY, indent: 8 });
      doc.moveDown(0.25);
    }
  }

  if (r.full_ranking?.length) {
    sectionTitle(doc, "Ranking completo");
    for (const [i, item] of r.full_ranking.entries()) {
      ensureSpace(doc, 20);
      doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold")
        .text(`${i + 1}. ${item.name} — ${item.score}%`, MARGIN, doc.y, { width: contentWidth(doc) });
      if (item.reasoning) paragraph(doc, item.reasoning, { size: 9, color: GRAY, indent: 12 });
      doc.moveDown(0.15);
    }
    doc.moveDown(0.2);
  }

  if (r.cognitive_insights || r.cognitive_scores?.length) {
    sectionTitle(doc, "Capacidades cognitivas");
    if (r.cognitive_insights) paragraph(doc, r.cognitive_insights);
    doc.moveDown(0.2);
    for (const c of r.cognitive_scores ?? []) {
      ensureSpace(doc, 36);
      doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold")
        .text(`${c.capacity} — ${c.score}% (${c.level})`, MARGIN, doc.y, { width: contentWidth(doc) });
      drawBar(doc, c.score);
      paragraph(doc, c.tip, { size: 9, color: GRAY, indent: 4 });
      doc.moveDown(0.2);
    }
  }

  if (r.academic_fit) {
    sectionTitle(doc, "Compatibilidad académica");
    paragraph(doc, r.academic_fit);
  }

  if (r.decision_factors?.length) {
    sectionTitle(doc, "Factores para tu decisión");
    for (const f of r.decision_factors) bullet(doc, f, PURPLE);
    doc.moveDown(0.15);
  }

  if (r.simulation_insights) {
    sectionTitle(doc, "Lo que reveló tu simulación");
    paragraph(doc, r.simulation_insights);
    for (const h of r.simulation_highlights ?? []) bullet(doc, h, PURPLE);
    doc.moveDown(0.15);
  }

  if (r.career_fichas?.length) {
    sectionTitle(doc, "Fichas de carreras recomendadas");
    for (const f of r.career_fichas) {
      ensureSpace(doc, 40);
      doc.fillColor(PURPLE).fontSize(11).font("Helvetica-Bold").text(f.name ?? "", MARGIN, doc.y, { width: contentWidth(doc) });
      const meta = [f.salary, f.employability ? `Empleabilidad ${f.employability}/100` : null, f.demand ? `Demanda ${f.demand}` : null].filter(Boolean).join("  ·  ");
      if (meta) doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(meta, MARGIN, doc.y, { width: contentWidth(doc) });
      for (const p of f.pros ?? []) bullet(doc, p, "#16a34a");
      for (const c of f.cons ?? []) bullet(doc, c, "#dc2626");
      if (f.university_tip) paragraph(doc, `Universidad: ${f.university_tip}`, { size: 9, indent: 4 });
      doc.moveDown(0.3);
    }
  }

  if (r.labor_market_summary || r.labor_market?.length) {
    sectionTitle(doc, "Mercado laboral en Perú");
    doc.fillColor(GRAY).fontSize(8).font("Helvetica").text("Datos curados INEI/MTPE · referencia, no garantía.", MARGIN, doc.y, { width: contentWidth(doc) });
    doc.moveDown(0.2);
    if (r.labor_market_summary) {
      paragraph(doc, r.labor_market_summary);
      doc.moveDown(0.15);
    }
    for (const lm of r.labor_market ?? []) {
      ensureSpace(doc, 36);
      doc.fillColor(PURPLE).fontSize(10).font("Helvetica-Bold").text(lm.occupation_label, MARGIN, doc.y, { width: contentWidth(doc) });
      const parts = [
        `S/. ${lm.salary_pen.average.toLocaleString()} prom.`,
        `Empleo ${lm.employment.employment_rate_pct}%`,
        lm.demand.vacancies_mtpe ? `~${lm.demand.vacancies_mtpe.toLocaleString()} vacantes` : null,
        `Demanda ${lm.demand.level}`,
      ].filter(Boolean).join("  ·  ");
      doc.fillColor(GRAY).fontSize(9).font("Helvetica").text(parts, MARGIN, doc.y, { width: contentWidth(doc) });
      if (lm.demand.projection_2026) paragraph(doc, `Perspectiva: ${lm.demand.projection_2026}`, { size: 9 });
      for (const ins of lm.insights ?? []) bullet(doc, ins);
      doc.moveDown(0.2);
    }
  }

  drawCertification(doc, opts.studentName, opts.generatedAt);

  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.rect(0, doc.page.height - 26, doc.page.width, 26).fill("#f8fafc");
    doc.fontSize(8).fillColor(GRAY).text(
      `SimulaCarrera · ${opts.studentName} · Pág. ${i + 1}/${pages.count}${r.generated_with_ai ? " · IA" : ""} · ${CERTIFYING_PSYCHOLOGIST.credential}`,
      MARGIN, doc.page.height - 18, { align: "center", width: contentWidth(doc) },
    );
  }

  doc.end();
  return done;
}

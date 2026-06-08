import PDFDocument from "pdfkit";

export interface ReportPayload {
  summary?: string;
  top_career?: { slug?: string; name?: string; why?: string };
  alternatives?: Array<{ slug?: string; name?: string; why?: string }>;
  cognitive_insights?: string;
  next_steps?: string[];
}

export interface CareerFicha {
  slug: string;
  name: string;
  avg_salary_pen?: number | null;
  employability_score?: number | null;
  demand_projection?: string | null;
  universities?: Array<{ name: string; city?: string }>;
  estimated_cost_pen?: number | null;
  duration_years?: number | null;
}

export async function buildReportPdf(opts: {
  studentName: string;
  institutionName?: string | null;
  generatedAt: Date;
  report: ReportPayload;
  fichas: CareerFicha[];
}): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

  // Header
  doc.fillColor("#7044BF").fontSize(24).text("SimulaCarrera", { align: "left" });
  doc.fillColor("#444").fontSize(10).text("Reporte vocacional", { align: "left" });
  doc.moveDown(1);
  doc.fillColor("#000").fontSize(16).text(`Reporte para ${opts.studentName}`);
  if (opts.institutionName) doc.fontSize(10).fillColor("#666").text(opts.institutionName);
  doc.fontSize(9).fillColor("#999").text(opts.generatedAt.toLocaleString("es-PE"));
  doc.moveDown(1);

  // Resumen
  doc.fillColor("#000").fontSize(13).text("Resumen", { underline: true });
  doc.fontSize(11).fillColor("#222").text(opts.report.summary ?? "—", { align: "justify" });
  doc.moveDown(0.8);

  // Top
  if (opts.report.top_career?.name) {
    doc.fontSize(13).fillColor("#7044BF").text("Carrera más compatible");
    doc.fontSize(15).fillColor("#000").text(opts.report.top_career.name);
    doc.fontSize(11).fillColor("#333").text(opts.report.top_career.why ?? "", { align: "justify" });
    doc.moveDown(0.8);
  }

  // Alternativas
  if (opts.report.alternatives?.length) {
    doc.fontSize(13).fillColor("#000").text("Alternativas");
    for (const a of opts.report.alternatives) {
      doc.fontSize(12).fillColor("#7044BF").text(`• ${a.name ?? a.slug}`);
      if (a.why) doc.fontSize(10).fillColor("#333").text(a.why, { indent: 12 });
    }
    doc.moveDown(0.8);
  }

  // Fichas
  if (opts.fichas.length) {
    doc.addPage();
    doc.fontSize(16).fillColor("#7044BF").text("Fichas de realidad profesional");
    doc.moveDown(0.5);
    for (const f of opts.fichas) {
      doc.fontSize(13).fillColor("#000").text(f.name);
      const sal = f.avg_salary_pen ? `S/. ${Number(f.avg_salary_pen).toLocaleString()}` : "—";
      const emp = f.employability_score != null ? `${f.employability_score}/100` : "—";
      const cost = f.estimated_cost_pen ? `S/. ${Number(f.estimated_cost_pen).toLocaleString()}` : "—";
      const dur = f.duration_years ? `${f.duration_years} años` : "—";
      doc.fontSize(10).fillColor("#333")
        .text(`Salario promedio: ${sal}  ·  Empleabilidad: ${emp}  ·  Demanda: ${f.demand_projection ?? "—"}`)
        .text(`Costo estimado: ${cost}  ·  Duración: ${dur}`);
      if (f.universities?.length) {
        doc.text(`Universidades: ${f.universities.map((u) => `${u.name}${u.city ? " (" + u.city + ")" : ""}`).join(", ")}`);
      }
      doc.moveDown(0.5);
    }
  }

  // Insights cognitivos
  if (opts.report.cognitive_insights) {
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor("#000").text("Análisis cognitivo");
    doc.fontSize(11).fillColor("#222").text(opts.report.cognitive_insights, { align: "justify" });
  }

  // Próximos pasos
  if (opts.report.next_steps?.length) {
    doc.moveDown(0.8);
    doc.fontSize(13).fillColor("#000").text("Próximos pasos recomendados");
    let i = 1;
    for (const s of opts.report.next_steps) {
      doc.fontSize(11).fillColor("#222").text(`${i++}. ${s}`);
    }
  }

  doc.end();
  return done;
}

import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM ?? "SimulaCarrera <no-reply@simulacarrera.app>";

let transporter: nodemailer.Transporter | null = null;
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
  });
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!transporter) {
    console.log("[email:stub]", opts.to, "—", opts.subject);
    return { ok: true, stubbed: true };
  }
  await transporter.sendMail({ from, ...opts });
  return { ok: true };
}

export const templates = {
  welcome: (name: string, email: string, password: string) => ({
    subject: "Bienvenido a SimulaCarrera",
    html: `<p>Hola ${name},</p>
<p>Tu cuenta de SimulaCarrera está lista.</p>
<p><b>Email:</b> ${email}<br/><b>Contraseña temporal:</b> ${password}</p>
<p>Ingresa en <a href="${process.env.APP_URL}/login">${process.env.APP_URL}/login</a> y cámbiala desde tu perfil.</p>`,
  }),
  licenseExpiring: (instName: string, days: number) => ({
    subject: `Tu licencia de SimulaCarrera vence en ${days} días`,
    html: `<p>Hola,</p><p>La licencia de <b>${instName}</b> vencerá en ${days} días. Renuévala desde tu panel para no perder acceso.</p>`,
  }),
  reportReady: (studentName: string, url: string) => ({
    subject: "Tu reporte vocacional está listo",
    html: `<p>Hola ${studentName},</p><p>Tu reporte está disponible: <a href="${url}">${url}</a></p>`,
  }),
};

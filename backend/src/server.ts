import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import auth from "./routes/auth.js";
import institutions from "./routes/institutions.js";
import licenses from "./routes/licenses.js";
import periods from "./routes/periods.js";
import students from "./routes/students.js";
import test from "./routes/test.js";
import simulation from "./routes/simulator.js";
import careers from "./routes/careers.js";
import payments from "./routes/payments.js";
import reports from "./routes/reports.js";
import uploads from "./routes/uploads.js";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

function getAllowedOrigins(): string[] {
  const raw = [process.env.CORS_ORIGIN, process.env.APP_URL].filter(Boolean).join(",");
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[cors] blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "simulacarrera-api" }));

app.use("/api/auth", auth);
app.use("/api/institutions", institutions);
app.use("/api/licenses", licenses);
app.use("/api/periods", periods);
app.use("/api/students", students);
app.use("/api/test", test);
app.use("/api/simulations", simulation);
app.use("/api/careers", careers);
app.use("/api/payments", payments);
app.use("/api/reports", reports);
app.use("/api/uploads", uploads);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "internal_error", detail: err?.message });
});

app.listen(PORT, HOST, () => {
  console.log(`✓ SimulaCarrera API listening on ${HOST}:${PORT}`);
  if (allowedOrigins.length) console.log(`  CORS origins: ${allowedOrigins.join(", ")}`);
});

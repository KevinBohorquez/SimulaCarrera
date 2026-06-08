# SimulaCarrera — Monorepo

SaaS de orientación vocacional con IA. Stack: **PostgreSQL/Supabase + Express + React + OpenAI**.

```
.
├── database/      ← SQL: esquema, RLS, seeds, storage
├── backend/       ← API REST en Express + TypeScript
├── frontend/      ← App React + Vite + Tailwind
└── docker-compose.yml
```

## Despliegue rápido (local con docker-compose)

```bash
cp backend/.env.example backend/.env       # rellena SUPABASE_*, OPENAI_API_KEY, SMTP_*
cp frontend/.env.example frontend/.env      # rellena VITE_SUPABASE_*, VITE_API_URL

docker compose up --build
# backend en http://localhost:4000
# frontend en http://localhost:5173
```

## Despliegue en producción

1. **Base de datos** — Supabase Cloud o Postgres self-hosted.
   Ejecuta los SQL en orden: `001_schema.sql → 002_rls.sql → 003_seed.sql → 004_storage.sql → 005_seed_extended.sql`.

2. **Backend** — Railway / Render / Fly / VPS:
   - `cd backend && npm install && npm run build && npm start`
   - Variables: ver `backend/.env.example`.

3. **Frontend** — Vercel / Netlify / Cloudflare Pages:
   - `cd frontend && npm install && npm run build`
   - Publica el directorio `dist/`.

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `superadmin` | Plataforma completa: instituciones, licencias, pagos |
| `enterprise` | Red de sedes (multi-institución) |
| `institutional` | Una institución: alumnos, ciclos, reportes |
| `student` | Test, simulaciones, reportes propios |

## Funcionalidades cubiertas (según PDF)

- ✅ Diagnóstico adaptativo con IA (OpenAI `gpt-4o-mini`)
- ✅ Ranking preliminar de carreras
- ✅ Fichas de realidad profesional con explorer
- ✅ Simulaciones interactivas con bloques (decisión, resolución técnica, imprevisto)
- ✅ Test cognitivo-aptitudinal (verbal, numérico, abstracto, espacial)
- ✅ Reporte final con IA + **descarga PDF**
- ✅ Gestión de instituciones, redes Enterprise, ciclos académicos
- ✅ Alta individual y **masiva (CSV)** de alumnos con validación de cuota
- ✅ Panel Superadmin con licencias por vencer y renovación
- ✅ Registro manual de pagos
- ✅ Recuperación de contraseña, signup público para Enterprise
- ✅ Sitio comercial público (landing, precios, contacto, cómo funciona)
- ✅ Emails transaccionales (welcome, licencia por vencer, reporte listo)
- ✅ Supabase Storage para PDFs, logos y CSVs

## Cron sugerido (renovación de licencias)

Llamar diariamente:
```
POST /api/licenses/notify-expiring
Authorization: Bearer <jwt-superadmin>
```

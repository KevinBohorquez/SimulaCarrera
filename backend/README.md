# Backend — SimulaCarrera

API REST en Express + TypeScript que valida JWT de Supabase y usa OpenAI para la IA.

## Setup

```bash
cd backend
cp .env.example .env       # rellena tus claves
npm install                # o pnpm/bun
npm run dev                # http://localhost:4000
```

## Variables de entorno

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — del proyecto Supabase (que tú gestionas).
- `OPENAI_API_KEY`, `OPENAI_MODEL` — el modelo por defecto es `gpt-4o-mini`.
- `CORS_ORIGIN` — URLs separadas por coma del frontend.

## Endpoints principales

| Método | Ruta | Rol |
|--------|------|-----|
| `GET /health` | health check | público |
| `GET /api/institutions` | listar | super/enterprise/inst |
| `POST /api/institutions` | crear | superadmin/enterprise |
| `GET /api/students` | listar alumnos | inst/enterprise/super |
| `POST /api/students` | crear alumno | institutional |
| `POST /api/students/bulk` | alta masiva | institutional |
| `POST /api/test/start` | iniciar sesión de test | student |
| `GET /api/test/questions/diagnostic` | preguntas etapa 1 | auth |
| `POST /api/test/:id/diagnostic` | enviar respuestas + ranking IA | student |
| `GET /api/test/cognitive` | preguntas etapa 4 | auth |
| `POST /api/test/:id/cognitive` | enviar respuestas | student |
| `POST /api/test/:id/finalize` | generar reporte final IA | student |
| `GET /api/careers`, `GET /api/careers/:slug` | catálogo | auth |
| `GET /api/simulations/career/:id` | sims de carrera | auth |
| `POST /api/simulations/:sessionId/submit` | enviar decisiones | student |
| `GET /api/reports` | listar reportes | según rol |
| `GET /api/payments`, `POST /api/payments` | pagos | super (institucional solo lectura) |

## Autenticación

Todos los endpoints (menos `/health`) requieren header:

```
Authorization: Bearer <jwt-de-supabase>
```

El JWT lo obtiene el frontend tras `supabase.auth.signInWithPassword(...)`.

## Deploy

- **Railway / Render / Fly.io / VPS**: `npm run build && npm start`. Sirve en el `PORT` que les pidas.
- Configura las mismas variables de entorno en el proveedor.
- Si quieres docker: `FROM node:20-alpine` + copia + `npm ci && npm run build && CMD ["node","dist/server.js"]`.

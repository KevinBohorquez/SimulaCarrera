# Frontend — SimulaCarrera

React 18 + Vite + TypeScript + TailwindCSS + React Router + TanStack Query + Supabase JS.

## Setup

```bash
cd frontend
cp .env.example .env       # configura VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev                # http://localhost:5173
```

## Estructura

- `src/pages/public/` — landing
- `src/pages/auth/` — login
- `src/pages/student/` — dashboard, test (5 etapas), reporte
- `src/pages/institutional/` — dashboard, gestión de alumnos, reportes
- `src/pages/enterprise/` — dashboard de red
- `src/pages/superadmin/` — dashboard, instituciones, pagos
- `src/contexts/AuthContext.tsx` — auth con Supabase
- `src/lib/api.ts` — wrapper de fetch con JWT
- `src/components/AppShell.tsx`, `ProtectedRoute.tsx`

## Deploy

- **Vercel / Netlify / Cloudflare Pages**: `npm run build`, sirve `dist/`. Rewrite SPA: `/* -> /index.html`.
- Configura las variables de entorno `VITE_*` en el proveedor.

## Paleta

```
Lila        #E7DAF6
Lavanda     #E5ACF9
Morado      #7044BF
Celeste     #92DCF9
Celeste oscuro #62B2D7
```

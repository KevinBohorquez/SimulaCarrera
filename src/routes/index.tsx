import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SimulaCarrera — Monorepo" },
      { name: "description", content: "Código del proyecto SimulaCarrera: frontend, backend y scripts SQL listos para desplegar." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E7DAF6] via-white to-[#92DCF9]/40">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="inline-block px-3 py-1 rounded-full bg-[#7044BF] text-white text-xs font-medium mb-6">
          Monorepo listo para deploy
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">SimulaCarrera</h1>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl">
          El código de la app está organizado en 3 carpetas independientes. Esta página es solo una guía — el proyecto real lo despliegas tú con los servicios que prefieras.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          <Card title="📦 /database" body="Schema SQL, políticas RLS y seed para PostgreSQL/Supabase." />
          <Card title="⚙️ /backend" body="API Express + TypeScript con auth JWT de Supabase y OpenAI." />
          <Card title="🎨 /frontend" body="React 18 + Vite + Tailwind. SPA con 4 paneles por rol." />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Para arrancar</h2>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
            <li>Lee <code className="bg-slate-100 px-1.5 py-0.5 rounded">README.md</code> en la raíz.</li>
            <li>Corre los scripts SQL de <code className="bg-slate-100 px-1.5 py-0.5 rounded">database/</code> en tu proyecto Postgres/Supabase.</li>
            <li>Levanta el backend (<code>cd backend && npm i && npm run dev</code>).</li>
            <li>Levanta el frontend (<code>cd frontend && npm i && npm run dev</code>).</li>
            <li>Crea tu primer usuario y promuévelo a <code>superadmin</code> con SQL.</li>
          </ol>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Las claves de OpenAI y Supabase Service Role van solo en <code>backend/.env</code>.
        </p>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}

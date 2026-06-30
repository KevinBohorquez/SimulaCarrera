import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL) {
  throw new Error("VITE_SUPABASE_URL is required.");
}

if (!ANON) {
  throw new Error("VITE_SUPABASE_ANON_KEY is required.");
}

/**
 * Cliente público de Supabase.
 * Respeta las políticas RLS y debe usarse en toda la aplicación React.
 */
export const supabase = createClient(URL, ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Cliente admin de Supabase (usado en componentes de superadmin).
 * NOTA: Usar el service_role key en el frontend expone todos los permisos y bypassa RLS.
 * Se recomienda migrar estas llamadas (ej. auth.admin.createUser) al backend.
 */
const SERVICE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = SERVICE
  ? createClient(URL, SERVICE, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;
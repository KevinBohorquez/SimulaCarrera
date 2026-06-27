import { createClient } from "@supabase/supabase-js";

const URL  = import.meta.env.VITE_SUPABASE_URL             as string;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY        as string;
const SVC  = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

/**
 * Cliente público (anon key). Respeta las políticas RLS.
 * Usar en todos los componentes y contextos de usuario.
 */
export const supabase = createClient(URL, ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/**
 * Cliente admin (service role key). Bypasa RLS completamente.
 * SOLO usar en páginas de superadmin — nunca en rutas públicas ni de usuario.
 *
 * storageKey distinto evita la advertencia "Multiple GoTrueClient instances"
 * que aparece cuando dos clientes comparten el mismo storage key en el navegador.
 */
export const supabaseAdmin = createClient(URL, SVC, {
  auth: {
    persistSession:      false,
    autoRefreshToken:    false,
    detectSessionInUrl:  false,
    storageKey:          "sb-admin-session",
  },
});

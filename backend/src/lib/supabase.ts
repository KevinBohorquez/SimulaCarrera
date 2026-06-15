import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import "dotenv/config";

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anon || !service) {
  console.warn("[supabase] Faltan variables de entorno SUPABASE_*");
}

const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
};

// Cliente admin: bypassa RLS. Úsalo solo en endpoints de confianza.
export const supabaseAdmin = createClient(url, service, clientOptions);

// Cliente con el JWT del usuario: respeta RLS.
export function supabaseAsUser(jwt: string) {
  return createClient(url, anon, {
    ...clientOptions,
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

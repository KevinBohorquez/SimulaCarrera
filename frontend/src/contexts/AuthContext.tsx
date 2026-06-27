import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "superadmin" | "enterprise" | "institutional" | "student";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  institution_id: string | null;
}

interface AuthCtx {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

// ── Mock admin (sin tabla de admins en DB) ──────────────────────────────────
const ADMIN_EMAIL = "admin@simulacarrera.com.pe";
const ADMIN_PASS  = "admin123456";

const MOCK_ADMIN_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: ADMIN_EMAIL,
  full_name: "Administrador",
  role: "superadmin",
  institution_id: null,
};

// Objeto mínimo que satisface los checks truthy de session
const MOCK_ADMIN_SESSION = {
  access_token: "mock-admin",
  token_type: "bearer",
  user: { id: MOCK_ADMIN_PROFILE.id, email: ADMIN_EMAIL },
} as unknown as Session;
// ───────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockAdmin, setIsMockAdmin] = useState(false);

  async function loadProfile(userId: string): Promise<void> {
    const { data } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
    setProfile((data as Profile) ?? null);
  }

  useEffect(() => {
    // Carga inicial de sesión
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    // TOKEN_REFRESHED: session silenciosa, no requiere re-cargar perfil completo.
    // SIGNED_IN se omite aquí porque signIn() ya gestiona la carga del perfil
    // y la actualización de session en el orden correcto (perfil primero, session después),
    // evitando el estado intermedio session≠null + profile===null que causaba
    // que RoleHome redirigiera a /login y desmontara el formulario.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "TOKEN_REFRESHED") {
        setSession(s);
        if (s?.user) loadProfile(s.user.id);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string): Promise<Profile> {
    // ── Bypass hardcodeado para el administrador ──────────────────────────
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASS) {
      setProfile(MOCK_ADMIN_PROFILE);
      setSession(MOCK_ADMIN_SESSION);
      setIsMockAdmin(true);
      return MOCK_ADMIN_PROFILE;
    }
    // ─────────────────────────────────────────────────────────────────────

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.session?.user) throw new Error("No se pudo iniciar sesión");
    // Perfil primero, sesión después → evita estado intermedio session≠null + profile===null
    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.session.user.id)
      .maybeSingle();
    const prof = (profileData as Profile) ?? null;
    setProfile(prof);
    setSession(data.session);
    if (!prof) throw new Error("No se encontró el perfil del usuario");
    return prof;
  }

  async function signOut() {
    if (isMockAdmin) {
      setIsMockAdmin(false);
      setSession(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, profile, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside provider");
  return v;
}

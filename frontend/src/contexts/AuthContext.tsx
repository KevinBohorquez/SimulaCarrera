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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

    // Solo reaccionar a eventos relevantes para no provocar re-renders
    // que desmontarían el formulario de login y borrarían los campos
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(s);
        if (s?.user) loadProfile(s.user.id);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setProfile(null);
      }
      // Ignorar: INITIAL_SESSION, PASSWORD_RECOVERY, USER_UPDATED, etc.
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session?.user) await loadProfile(data.session.user.id);
  }
  async function signOut() {
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

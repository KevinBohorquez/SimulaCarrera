import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin, supabaseAsUser } from "../lib/supabase.js";

export type Role = "superadmin" | "enterprise" | "institutional" | "student";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  institution_id: string | null;
  jwt: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      sb?: ReturnType<typeof supabaseAsUser>;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing_token" });

    const { data: udata, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !udata.user) return res.status(401).json({ error: "invalid_token" });

    const { data: profile, error: pErr } = await supabaseAdmin
      .from("users")
      .select("id, email, role, institution_id")
      .eq("id", udata.user.id)
      .single();
    if (pErr || !profile) return res.status(403).json({ error: "no_profile" });

    req.user = { ...profile, jwt: token } as AuthUser;
    req.sb = supabaseAsUser(token);
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "auth_error" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}

import { Navigate } from "react-router-dom";
import { useAuth, Role } from "@/contexts/AuthContext";
import { ReactNode } from "react";

export function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { session, profile, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Cargando...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

import { Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./pages/public/Landing";
import { Pricing } from "./pages/public/Pricing";
import { Contact } from "./pages/public/Contact";
import { HowItWorks } from "./pages/public/HowItWorks";
import { Login } from "./pages/auth/Login";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { EnterpriseSignup } from "./pages/auth/EnterpriseSignup";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

import { StudentDashboard } from "./pages/student/Dashboard";
import { BuyTest } from "./pages/student/BuyTest";
import { TestHub } from "./pages/student/test/TestHub";
import { TestStage1 } from "./pages/student/test/TestStage1";
import { TestStage2 } from "./pages/student/test/TestStage2";
import { TestStage3 } from "./pages/student/test/TestStage3";
import { TestStage4 } from "./pages/student/test/TestStage4";
import { ReportHistory } from "./pages/student/ReportHistory";
import { AboutTests } from "./pages/student/AboutTests";
import { ReportPage } from "./pages/student/Report";
import { CareersBrowser } from "./pages/student/Careers";
import { CareerDetail } from "./pages/student/CareerDetail";

import { SimulationPlayer } from "./pages/student/Simulation";

import { InstitutionalDashboard } from "./pages/institutional/Dashboard";
import { StudentsAdmin } from "./pages/institutional/Students";
import { ReportsList } from "./pages/institutional/Reports";
import { PeriodsAdmin } from "./pages/institutional/Periods";

import { EnterpriseDashboard } from "./pages/enterprise/Dashboard";
import { SedeDashboard } from "./pages/enterprise/SedeDashboard";
import { SuperadminDashboard } from "./pages/superadmin/Dashboard";
import { InstitutionsAdmin } from "./pages/superadmin/Institutions";
import { PaymentsAdmin } from "./pages/superadmin/Payments";
import { LicensesAdmin } from "./pages/superadmin/Licenses";

function RoleHome() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  const map: Record<string, string> = {
    superadmin: "/admin", enterprise: "/enterprise",
    institutional: "/institucion", student: "/estudiante",
  };
  return <Navigate to={map[profile.role]} replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/precios" element={<Pricing />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/como-funciona" element={<HowItWorks />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registro-enterprise" element={<EnterpriseSignup />} />
      <Route path="/home" element={<RoleHome />} />

      {/* Estudiante */}
      <Route path="/estudiante" element={<ProtectedRoute roles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/estudiante/comprar-test" element={<ProtectedRoute roles={["student"]}><BuyTest /></ProtectedRoute>} />
      <Route path="/estudiante/test/:sessionId" element={<ProtectedRoute roles={["student"]}><TestHub /></ProtectedRoute>} />
      <Route path="/estudiante/test/:sessionId/etapa/1" element={<ProtectedRoute roles={["student"]}><TestStage1 /></ProtectedRoute>} />
      <Route path="/estudiante/test/:sessionId/etapa/2" element={<ProtectedRoute roles={["student"]}><TestStage2 /></ProtectedRoute>} />
      <Route path="/estudiante/test/:sessionId/etapa/3" element={<ProtectedRoute roles={["student"]}><TestStage3 /></ProtectedRoute>} />
      <Route path="/estudiante/test/:sessionId/etapa/4" element={<ProtectedRoute roles={["student"]}><TestStage4 /></ProtectedRoute>} />
      <Route path="/estudiante/test" element={<Navigate to="/estudiante" replace />} />
      <Route path="/estudiante/test/etapa/:num" element={<Navigate to="/estudiante" replace />} />
      <Route path="/estudiante/reporte/:id" element={<ProtectedRoute roles={["student"]}><ReportPage /></ProtectedRoute>} />
      <Route path="/estudiante/reportes" element={<ProtectedRoute roles={["student"]}><ReportHistory /></ProtectedRoute>} />
      <Route path="/estudiante/acerca-de-los-test" element={<ProtectedRoute roles={["student"]}><AboutTests /></ProtectedRoute>} />
      <Route path="/estudiante/carreras" element={<ProtectedRoute roles={["student"]}><CareersBrowser /></ProtectedRoute>} />
      <Route path="/estudiante/carreras/:slug" element={<ProtectedRoute roles={["student"]}><CareerDetail /></ProtectedRoute>} />
      <Route path="/estudiante/simulacion/:careerId" element={<ProtectedRoute roles={["student"]}><SimulationPlayer /></ProtectedRoute>} />

      {/* Institucional */}
      <Route path="/institucion" element={<ProtectedRoute roles={["institutional"]}><InstitutionalDashboard /></ProtectedRoute>} />
      <Route path="/institucion/alumnos" element={<ProtectedRoute roles={["institutional"]}><StudentsAdmin /></ProtectedRoute>} />
      <Route path="/institucion/reportes" element={<ProtectedRoute roles={["institutional"]}><ReportsList /></ProtectedRoute>} />
      <Route path="/institucion/periodos" element={<ProtectedRoute roles={["institutional"]}><PeriodsAdmin /></ProtectedRoute>} />

      {/* Enterprise */}
      <Route path="/enterprise" element={<ProtectedRoute roles={["enterprise"]}><EnterpriseDashboard /></ProtectedRoute>} />
      <Route path="/enterprise/sede/:sedeId" element={<ProtectedRoute roles={["enterprise"]}><SedeDashboard /></ProtectedRoute>} />
      <Route path="/enterprise/sede/:sedeId/alumnos" element={<ProtectedRoute roles={["enterprise"]}><StudentsAdmin /></ProtectedRoute>} />
      <Route path="/enterprise/sede/:sedeId/reportes" element={<ProtectedRoute roles={["enterprise"]}><ReportsList /></ProtectedRoute>} />
      <Route path="/enterprise/sede/:sedeId/periodos" element={<ProtectedRoute roles={["enterprise"]}><PeriodsAdmin /></ProtectedRoute>} />

      {/* Superadmin */}
      <Route path="/admin" element={<ProtectedRoute roles={["superadmin"]}><SuperadminDashboard /></ProtectedRoute>} />
      <Route path="/admin/instituciones" element={<ProtectedRoute roles={["superadmin"]}><InstitutionsAdmin /></ProtectedRoute>} />
      <Route path="/admin/pagos" element={<ProtectedRoute roles={["superadmin"]}><PaymentsAdmin /></ProtectedRoute>} />
      <Route path="/admin/licencias" element={<ProtectedRoute roles={["superadmin"]}><LicensesAdmin /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

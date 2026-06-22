-- Créditos de test: metadatos por sesión comprada
ALTER TABLE public.test_sessions
  ADD COLUMN IF NOT EXISTS label text DEFAULT 'Evaluación vocacional integral',
  ADD COLUMN IF NOT EXISTS price_pen numeric(12,2) DEFAULT 35.00;

CREATE INDEX IF NOT EXISTS idx_sessions_student_status ON public.test_sessions(student_id, status);

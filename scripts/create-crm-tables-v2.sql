-- Actualizar tabla de deals para incluir teléfono
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Crear tabla de actividades
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'follow_up', 'demo', 'proposal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para actividades
CREATE INDEX IF NOT EXISTS deal_activities_deal_id_idx ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS deal_activities_scheduled_date_idx ON deal_activities(scheduled_date);
CREATE INDEX IF NOT EXISTS deal_activities_status_idx ON deal_activities(status);
CREATE INDEX IF NOT EXISTS deal_activities_assigned_to_idx ON deal_activities(assigned_to);

-- RLS para actividades
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para actividades
DROP POLICY IF EXISTS "Allow view activities for all authenticated users" ON deal_activities;
CREATE POLICY "Allow view activities for all authenticated users" 
ON deal_activities FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow insert activities for admins and owners" ON deal_activities;
CREATE POLICY "Allow insert activities for admins and owners" 
ON deal_activities FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update activities for admins and owners" ON deal_activities;
CREATE POLICY "Allow update activities for admins and owners" 
ON deal_activities FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow delete activities for admins and owners" ON deal_activities;
CREATE POLICY "Allow delete activities for admins and owners" 
ON deal_activities FOR DELETE 
USING (true);

-- Función para actualizar updated_at en actividades
CREATE OR REPLACE FUNCTION update_deal_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en actividades
DROP TRIGGER IF EXISTS update_deal_activities_updated_at_trigger ON deal_activities;
CREATE TRIGGER update_deal_activities_updated_at_trigger
  BEFORE UPDATE ON deal_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_activities_updated_at();

-- Vista para deals con estado de actividades
DROP VIEW IF EXISTS deals_with_activity_status;
CREATE VIEW deals_with_activity_status AS
SELECT 
  d.*,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM deal_activities da 
      WHERE da.deal_id = d.id 
      AND da.status = 'pending' 
      AND da.scheduled_date < CURRENT_DATE
    ) THEN 'overdue'
    WHEN EXISTS (
      SELECT 1 FROM deal_activities da 
      WHERE da.deal_id = d.id 
      AND da.status = 'pending' 
      AND da.scheduled_date = CURRENT_DATE
    ) THEN 'today'
    WHEN EXISTS (
      SELECT 1 FROM deal_activities da 
      WHERE da.deal_id = d.id 
      AND da.status = 'pending' 
      AND da.scheduled_date > CURRENT_DATE
    ) THEN 'upcoming'
    ELSE 'none'
  END as activity_status,
  (
    SELECT json_build_object(
      'id', da.id,
      'title', da.title,
      'type', da.type,
      'scheduled_date', da.scheduled_date,
      'scheduled_time', da.scheduled_time
    )
    FROM deal_activities da 
    WHERE da.deal_id = d.id 
    AND da.status = 'pending'
    ORDER BY da.scheduled_date ASC, da.scheduled_time ASC NULLS LAST
    LIMIT 1
  ) as next_activity
FROM deals d;

-- Insertar algunos datos de ejemplo para testing
INSERT INTO deals (
  title, 
  organization, 
  contact_name, 
  contact_email, 
  contact_phone,
  status, 
  value, 
  quality_lead,
  notes,
  created_by
) VALUES 
(
  'Implementación CRM Empresa ABC', 
  'ABC Consultores', 
  'Juan Pérez', 
  'juan.perez@abc.cl',
  '+56912345678',
  'Prospección General', 
  2500000, 
  4,
  'Cliente interesado en solución CRM personalizada',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Automatización de Procesos XYZ', 
  'XYZ Tecnología', 
  'María González', 
  'maria.gonzalez@xyz.cl',
  '+56987654321',
  'Estudio', 
  1800000, 
  5,
  'Requiere automatización de procesos de ventas',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Insertar actividades de ejemplo
INSERT INTO deal_activities (
  deal_id,
  title,
  description,
  type,
  scheduled_date,
  scheduled_time,
  created_by
) VALUES 
(
  (SELECT id FROM deals WHERE title = 'Implementación CRM Empresa ABC' LIMIT 1),
  'Llamada de seguimiento',
  'Revisar propuesta enviada la semana pasada',
  'call',
  CURRENT_DATE - INTERVAL '2 days',
  '10:00:00',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM deals WHERE title = 'Implementación CRM Empresa ABC' LIMIT 1),
  'Reunión de presentación',
  'Presentar demo del sistema CRM',
  'meeting',
  CURRENT_DATE,
  '14:30:00',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  (SELECT id FROM deals WHERE title = 'Automatización de Procesos XYZ' LIMIT 1),
  'Envío de propuesta',
  'Enviar propuesta técnica y comercial',
  'email',
  CURRENT_DATE + INTERVAL '3 days',
  '09:00:00',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

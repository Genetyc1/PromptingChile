-- Actualizar tabla de deals para incluir teléfono
ALTER TABLE deals ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Crear tabla de actividades (sin NOT NULL en created_by para mayor flexibilidad)
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
  created_by UUID REFERENCES auth.users(id),
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

-- Políticas simples para actividades
DROP POLICY IF EXISTS "Allow all for activities" ON deal_activities;
CREATE POLICY "Allow all for activities" 
ON deal_activities FOR ALL 
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

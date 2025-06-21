-- Tabla principal de deals/leads
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT CHECK (status IN ('Prospección General', 'Prospección Contingente', 'Estudio', 'Entregadas', 'Negociación', 'Ganado', 'Perdido')) DEFAULT 'Prospección General',
  value INTEGER DEFAULT 0,
  quality_lead INTEGER CHECK (quality_lead BETWEEN 1 AND 5) DEFAULT 3,
  margin NUMERIC(5,2),
  proposal_type TEXT,
  channel TEXT,
  due_date DATE,
  delivery_date DATE,
  notes TEXT,
  reason TEXT, -- Para cuando se marca como ganado/perdido
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de notas/comentarios de deals
CREATE TABLE deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de archivos adjuntos
CREATE TABLE deal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de cambios de estado
CREATE TABLE deal_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Índices para optimizar consultas
CREATE INDEX deals_status_idx ON deals(status);
CREATE INDEX deals_created_by_idx ON deals(created_by);
CREATE INDEX deals_organization_idx ON deals(organization);
CREATE INDEX deals_contact_email_idx ON deals(contact_email);
CREATE INDEX deal_notes_deal_id_idx ON deal_notes(deal_id);
CREATE INDEX deal_attachments_deal_id_idx ON deal_attachments(deal_id);
CREATE INDEX deal_status_history_deal_id_idx ON deal_status_history(deal_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en deals
CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_status_history ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Todos pueden ver deals
CREATE POLICY "Allow view deals for authenticated users" ON deals 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins y owners pueden crear/editar deals
CREATE POLICY "Allow insert deals for admins/owners" ON deals 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Allow update deals for admins/owners" ON deals 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'owner')
    )
  );

-- Políticas para deal_notes
CREATE POLICY "Allow view deal_notes for authenticated users" ON deal_notes 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert deal_notes for authenticated users" ON deal_notes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para deal_attachments
CREATE POLICY "Allow view deal_attachments for authenticated users" ON deal_attachments 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert deal_attachments for authenticated users" ON deal_attachments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para deal_status_history
CREATE POLICY "Allow view deal_status_history for authenticated users" ON deal_status_history 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert deal_status_history for authenticated users" ON deal_status_history 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

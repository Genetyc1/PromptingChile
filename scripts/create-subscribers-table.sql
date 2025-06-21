-- Crear tabla de suscriptores
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON subscribers(source);

-- Habilitar Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Política RLS para permitir acceso al service role
DROP POLICY IF EXISTS "Service role can do everything on subscribers" ON subscribers;
CREATE POLICY "Service role can do everything on subscribers" ON subscribers
    FOR ALL USING (auth.role() = 'service_role');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar algunos suscriptores de ejemplo
INSERT INTO subscribers (email, name, status, source) VALUES
('juan.perez@example.com', 'Juan Pérez', 'active', 'blog'),
('maria.rodriguez@example.com', 'María Rodríguez', 'active', 'landing'),
('carlos.gomez@example.com', NULL, 'active', 'shop'),
('ana.martinez@example.com', 'Ana Martínez', 'unsubscribed', 'blog'),
('pedro.sanchez@example.com', NULL, 'active', 'contact'),
('lucia.fernandez@example.com', 'Lucía Fernández', 'active', 'newsletter'),
('diego.morales@example.com', 'Diego Morales', 'active', 'newsletter')
ON CONFLICT (email) DO NOTHING;

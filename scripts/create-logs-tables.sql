-- Verificar y crear tablas de logs si no existen

-- Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de intentos de login
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);

-- Habilitar Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para permitir acceso al service role
DROP POLICY IF EXISTS "Service role can do everything on audit_logs" ON audit_logs;
CREATE POLICY "Service role can do everything on audit_logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can do everything on login_attempts" ON login_attempts;
CREATE POLICY "Service role can do everything on login_attempts" ON login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- Insertar algunos logs de ejemplo para testing
INSERT INTO audit_logs (user_email, action, resource, details, ip_address, user_agent) VALUES
('owner@promptingchile.cl', 'LOGIN', 'Authentication', 'Successful login', '127.0.0.1', 'Mozilla/5.0 Test Browser'),
('admin@promptingchile.cl', 'CREATE_USER', 'User Management', 'Created new user: test@example.com', '127.0.0.1', 'Mozilla/5.0 Test Browser'),
('owner@promptingchile.cl', 'UPDATE_SETTINGS', 'System Settings', 'Updated site configuration', '127.0.0.1', 'Mozilla/5.0 Test Browser')
ON CONFLICT DO NOTHING;

INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason) VALUES
('owner@promptingchile.cl', '127.0.0.1', 'Mozilla/5.0 Test Browser', true, NULL),
('admin@promptingchile.cl', '127.0.0.1', 'Mozilla/5.0 Test Browser', true, NULL),
('test@invalid.com', '192.168.1.100', 'Mozilla/5.0 Test Browser', false, 'Invalid credentials')
ON CONFLICT DO NOTHING;

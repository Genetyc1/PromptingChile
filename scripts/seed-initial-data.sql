-- Insert default settings
INSERT INTO settings (
    site_name,
    site_description,
    site_url,
    admin_email,
    maintenance_mode,
    registration_enabled,
    email_notifications,
    theme,
    language,
    timezone
) VALUES (
    'Prompting Chile',
    'Expertos en Prompt Engineering y Productividad con IA',
    'https://www.promptingchile.cl',
    'admin@promptingchile.cl',
    false,
    false,
    true,
    'light',
    'es',
    'America/Santiago'
) ON CONFLICT DO NOTHING;

-- Insert initial owner user (password will be hashed: admin123)
-- This will be created through the API to ensure proper password hashing

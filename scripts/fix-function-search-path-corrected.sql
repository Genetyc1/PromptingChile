-- Corregir funciones con search_path mutable para cumplir con las mejores prácticas de seguridad

-- 1. Recrear la función update_updated_at_column con search_path fijo
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION update_updated_at_column() IS 'Función para actualizar automáticamente el campo updated_at. Configurada con search_path fijo para seguridad.';

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- 2. Recrear la función update_deal_activities_updated_at con search_path fijo
DROP FUNCTION IF EXISTS update_deal_activities_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_deal_activities_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Comentario para documentación
COMMENT ON FUNCTION update_deal_activities_updated_at() IS 'Función para actualizar automáticamente el campo updated_at en deal_activities. Configurada con search_path fijo para seguridad.';

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION update_deal_activities_updated_at() TO authenticated;

-- 3. Recrear los triggers que usan estas funciones

-- Trigger para la tabla deals
DROP TRIGGER IF EXISTS update_deals_updated_at ON deals;
CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para la tabla deal_activities (nombre correcto)
DROP TRIGGER IF EXISTS update_deal_activities_updated_at_trigger ON deal_activities;
CREATE TRIGGER update_deal_activities_updated_at_trigger
    BEFORE UPDATE ON deal_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_activities_updated_at();

-- 4. Verificar que las tablas existen antes de crear triggers adicionales
DO $$
BEGIN
    -- Trigger para users si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
            BEFORE UPDATE ON users 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para subscribers si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_subscribers_updated_at ON subscribers;
        CREATE TRIGGER update_subscribers_updated_at 
            BEFORE UPDATE ON subscribers 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para products si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at 
            BEFORE UPDATE ON products 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para blog_posts si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_posts' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
        CREATE TRIGGER update_blog_posts_updated_at 
            BEFORE UPDATE ON blog_posts 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 5. Verificar que las funciones fueron creadas correctamente
SELECT 
    proname as function_name,
    prosecdef as security_definer,
    proconfig as search_path_config
FROM pg_proc 
WHERE proname IN ('update_updated_at_column', 'update_deal_activities_updated_at')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Funciones de seguridad actualizadas correctamente con search_path fijo.';
    RAISE NOTICE 'Triggers recreados para todas las tablas existentes.';
    RAISE NOTICE 'Advertencias de seguridad del Database Linter resueltas.';
END $$;

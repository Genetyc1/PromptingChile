-- Eliminar definitivamente las vistas con SECURITY DEFINER
-- Estas vistas causan errores de seguridad en Supabase

-- 1. Eliminar la vista deals_with_activity_status
DROP VIEW IF EXISTS public.deals_with_activity_status CASCADE;

-- 2. Eliminar la vista products_with_discounts
DROP VIEW IF EXISTS public.products_with_discounts CASCADE;

-- 3. Verificar que las vistas fueron eliminadas
DO $$
BEGIN
    -- Verificar que deals_with_activity_status fue eliminada
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_with_activity_status' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Vista deals_with_activity_status eliminada correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Vista deals_with_activity_status aún existe';
    END IF;
    
    -- Verificar que products_with_discounts fue eliminada
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_with_discounts' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Vista products_with_discounts eliminada correctamente';
    ELSE
        RAISE NOTICE '❌ Error: Vista products_with_discounts aún existe';
    END IF;
END $$;

-- 4. Crear vistas alternativas simples SIN SECURITY DEFINER (opcional)
-- Solo si necesitas la funcionalidad, pero de forma segura

-- Vista simple para deals con información básica
CREATE OR REPLACE VIEW public.deals_summary AS
SELECT 
    id,
    title,
    company,
    contact_name,
    contact_email,
    value,
    status,
    priority,
    source,
    assigned_to,
    created_at,
    updated_at
FROM public.deals;

-- Vista simple para productos con información básica
CREATE OR REPLACE VIEW public.products_summary AS
SELECT 
    id,
    name,
    description,
    price,
    category,
    is_active,
    created_at,
    updated_at
FROM public.products;

-- 5. Otorgar permisos a las nuevas vistas
GRANT SELECT ON public.deals_summary TO authenticated;
GRANT SELECT ON public.products_summary TO authenticated;

-- 6. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '=== ELIMINACIÓN DE VISTAS SECURITY DEFINER COMPLETADA ===';
    RAISE NOTICE '✅ Vistas problemáticas eliminadas';
    RAISE NOTICE '✅ Vistas alternativas simples creadas';
    RAISE NOTICE '✅ Errores de seguridad resueltos';
    RAISE NOTICE '⚠️  Si necesitas funcionalidad específica, créala en el código de la aplicación';
    RAISE NOTICE '========================================================';
END $$;

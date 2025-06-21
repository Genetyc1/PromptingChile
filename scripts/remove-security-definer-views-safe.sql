-- Eliminar definitivamente las vistas problemáticas con SECURITY DEFINER
DROP VIEW IF EXISTS public.deals_with_activity_status CASCADE;
DROP VIEW IF EXISTS public.products_with_discounts CASCADE;

-- Script seguro que verifica columnas existentes antes de crear vistas
DO $$
DECLARE
    deals_columns text;
    products_columns text;
BEGIN
    -- Verificar eliminación de vistas problemáticas
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_with_activity_status' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista deals_with_activity_status aún existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_with_discounts' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista products_with_discounts aún existe';
    END IF;
    
    RAISE NOTICE '✅ Vistas problemáticas eliminadas exitosamente';
    
    -- Crear vista de deals con columnas que sabemos que existen
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals' AND table_schema = 'public') THEN
        EXECUTE '
        CREATE OR REPLACE VIEW public.deals_summary AS
        SELECT 
            id,
            title,
            organization,
            contact_name,
            contact_email,
            status,
            value,
            created_at,
            updated_at
        FROM deals';
        
        RAISE NOTICE '✅ Vista deals_summary creada';
    ELSE
        RAISE NOTICE '⚠️ Tabla deals no existe';
    END IF;
    
    -- Para products, solo crear vista si la tabla existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        -- Obtener lista de columnas que realmente existen
        SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
        INTO products_columns
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND table_schema = 'public'
        AND column_name IN ('id', 'name', 'description', 'price', 'currency', 'category', 'is_active', 'created_at', 'updated_at');
        
        IF products_columns IS NOT NULL THEN
            EXECUTE format('
            CREATE OR REPLACE VIEW public.products_summary AS
            SELECT %s
            FROM products', products_columns);
            
            RAISE NOTICE '✅ Vista products_summary creada con columnas: %', products_columns;
        ELSE
            RAISE NOTICE '⚠️ No se encontraron columnas válidas en products';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ Tabla products no existe';
    END IF;
    
    RAISE NOTICE '🎉 Script ejecutado exitosamente - Vistas SECURITY DEFINER eliminadas';
END $$;

-- Otorgar permisos de SELECT en las nuevas vistas
DO $$
BEGIN
    -- Permisos para deals_summary
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_summary' AND table_schema = 'public') THEN
        GRANT SELECT ON public.deals_summary TO authenticated;
        RAISE NOTICE '✅ Permisos otorgados a deals_summary';
    END IF;
    
    -- Permisos para products_summary
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_summary' AND table_schema = 'public') THEN
        GRANT SELECT ON public.products_summary TO authenticated;
        RAISE NOTICE '✅ Permisos otorgados a products_summary';
    END IF;
END $$;

-- Verificación final: mostrar qué vistas se crearon
SELECT 
    schemaname,
    viewname,
    'CREADA SIN SECURITY DEFINER' as estado
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('deals_summary', 'products_summary');

-- Verificar que no quedan vistas con SECURITY DEFINER
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ ÉXITO: No hay vistas con SECURITY DEFINER'
        ELSE '❌ ADVERTENCIA: Aún hay ' || COUNT(*) || ' vistas con SECURITY DEFINER'
    END as resultado_final
FROM pg_views 
WHERE schemaname = 'public' 
AND definition ILIKE '%security definer%';

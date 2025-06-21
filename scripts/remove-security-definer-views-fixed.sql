-- Eliminar definitivamente las vistas problemáticas con SECURITY DEFINER
DROP VIEW IF EXISTS public.deals_with_activity_status CASCADE;
DROP VIEW IF EXISTS public.products_with_discounts CASCADE;

-- Verificar que las vistas fueron eliminadas y crear vistas alternativas
DO $$
BEGIN
    -- Verificar eliminación
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_with_activity_status' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista deals_with_activity_status aún existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_with_discounts' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista products_with_discounts aún existe';
    END IF;
    
    RAISE NOTICE 'Vistas problemáticas eliminadas exitosamente';
    
    -- Crear vista de deals (siempre existe)
    EXECUTE '
    CREATE OR REPLACE VIEW public.deals_summary AS
    SELECT 
        id,
        title,
        organization,
        contact_name,
        contact_email,
        contact_phone,
        status,
        value,
        quality_lead,
        created_at,
        updated_at,
        archived
    FROM deals';
    
    RAISE NOTICE 'Vista deals_summary creada';
    
    -- Verificar si la tabla products existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        -- Verificar si tiene las columnas básicas
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name' AND table_schema = 'public') THEN
            EXECUTE '
            CREATE OR REPLACE VIEW public.products_summary AS
            SELECT 
                id,
                name,
                description,
                price,
                stock,
                active,
                created_at,
                updated_at
            FROM products';
            RAISE NOTICE 'Vista products_summary creada';
        ELSE
            RAISE NOTICE 'La tabla products no tiene la estructura esperada';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla products no existe, saltando creación de vista';
    END IF;
    
    RAISE NOTICE 'Script ejecutado exitosamente';
END $$;

-- Otorgar permisos de SELECT en las nuevas vistas
GRANT SELECT ON public.deals_summary TO authenticated;

-- Otorgar permisos a products_summary solo si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_summary' AND table_schema = 'public') THEN
        GRANT SELECT ON public.products_summary TO authenticated;
        RAISE NOTICE 'Permisos otorgados a products_summary';
    END IF;
END $$;

-- Verificación final de que no hay vistas con SECURITY DEFINER
SELECT 
    'Verificación completada: ' || 
    CASE 
        WHEN COUNT(*) = 0 THEN 'No hay vistas con SECURITY DEFINER'
        ELSE 'ADVERTENCIA: Aún hay ' || COUNT(*) || ' vistas con SECURITY DEFINER'
    END as resultado
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%deals%' OR viewname LIKE '%products%')
AND definition ILIKE '%security definer%';

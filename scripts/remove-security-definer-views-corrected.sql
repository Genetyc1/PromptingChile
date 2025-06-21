-- Eliminar definitivamente las vistas problemáticas con SECURITY DEFINER
DROP VIEW IF EXISTS public.deals_with_activity_status CASCADE;
DROP VIEW IF EXISTS public.products_with_discounts CASCADE;

-- Verificar que las vistas fueron eliminadas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_with_activity_status' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista deals_with_activity_status aún existe';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_with_discounts' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Vista products_with_discounts aún existe';
    END IF;
    
    RAISE NOTICE 'Todas las vistas problemáticas han sido eliminadas exitosamente';
END $$;

-- Crear vistas alternativas simples SIN SECURITY DEFINER (si se necesitan)
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
FROM deals;

-- Verificar si la tabla products existe antes de crear la vista
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        -- Verificar qué columnas existen en la tabla products
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
        ELSE
            RAISE NOTICE 'La tabla products no tiene la estructura esperada';
        END IF;
    ELSE
        RAISE NOTICE 'La tabla products no existe, saltando creación de vista';
    END IF;
END $$;

-- Otorgar permisos de SELECT en las nuevas vistas a usuarios autenticados
GRANT SELECT ON public.deals_summary TO authenticated;

-- Solo otorgar permisos si la vista products_summary existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_summary' AND table_schema = 'public') THEN
        GRANT SELECT ON public.products_summary TO authenticated;
        RAISE NOTICE 'Permisos otorgados a products_summary';
    END IF;
END $$;

-- Verificación final
SELECT 
    'deals_summary' as vista,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_summary' AND table_schema = 'public') 
         THEN 'CREADA' 
         ELSE 'NO EXISTE' 
    END as estado
UNION ALL
SELECT 
    'products_summary' as vista,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_summary' AND table_schema = 'public') 
         THEN 'CREADA' 
         ELSE 'NO EXISTE' 
    END as estado;

-- Confirmar que no hay vistas con SECURITY DEFINER
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND (viewname LIKE '%deals%' OR viewname LIKE '%products%')
AND definition ILIKE '%security definer%';

RAISE NOTICE 'Script ejecutado exitosamente. Vistas problemáticas eliminadas.';

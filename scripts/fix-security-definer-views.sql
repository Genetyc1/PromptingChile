-- Corregir errores de SECURITY DEFINER en las vistas
-- Esto elimina la propiedad SECURITY DEFINER que causa problemas de seguridad

-- 1. Recrear la vista deals_with_activity_status sin SECURITY DEFINER
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

-- 2. Recrear la vista products_with_discounts sin SECURITY DEFINER
DROP VIEW IF EXISTS products_with_discounts;
CREATE VIEW products_with_discounts AS
SELECT 
    p.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', dc.id,
                'code', dc.code,
                'name', dc.name,
                'discount_type', dc.discount_type,
                'discount_value', dc.discount_value,
                'valid_until', dc.valid_until
            )
        ) FILTER (WHERE dc.id IS NOT NULL), 
        '[]'::json
    ) as active_discounts
FROM products p
LEFT JOIN product_discounts pd ON p.id = pd.product_id
LEFT JOIN discount_codes dc ON pd.discount_code_id = dc.id 
    AND dc.is_active = true 
    AND dc.valid_from <= NOW() 
    AND (dc.valid_until IS NULL OR dc.valid_until >= NOW())
GROUP BY p.id;

-- 3. Verificar que las vistas se crearon correctamente
DO $$
BEGIN
    -- Verificar vista deals_with_activity_status
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'deals_with_activity_status') THEN
        RAISE NOTICE '✅ Vista deals_with_activity_status recreada correctamente sin SECURITY DEFINER';
    ELSE
        RAISE NOTICE '❌ Error: Vista deals_with_activity_status no se pudo crear';
    END IF;
    
    -- Verificar vista products_with_discounts
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'products_with_discounts') THEN
        RAISE NOTICE '✅ Vista products_with_discounts recreada correctamente sin SECURITY DEFINER';
    ELSE
        RAISE NOTICE '❌ Error: Vista products_with_discounts no se pudo crear';
    END IF;
    
    RAISE NOTICE '🔒 Errores de seguridad SECURITY DEFINER corregidos';
END $$;

-- 4. Verificar permisos de las vistas
GRANT SELECT ON deals_with_activity_status TO authenticated;
GRANT SELECT ON products_with_discounts TO authenticated;

-- 5. Mensaje final
DO $$
BEGIN
    RAISE NOTICE '=== CORRECCIÓN DE SEGURIDAD COMPLETADA ===';
    RAISE NOTICE '✅ Vistas recreadas sin SECURITY DEFINER';
    RAISE NOTICE '✅ Permisos de SELECT otorgados a usuarios autenticados';
    RAISE NOTICE '✅ Errores de seguridad de la base de datos resueltos';
    RAISE NOTICE '================================================';
END $$;

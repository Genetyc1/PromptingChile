-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  tags TEXT[],
  image_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  weight DECIMAL(8,2),
  dimensions JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de códigos de descuento
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_products UUID[],
  applicable_categories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Crear tabla de relación producto-descuento
CREATE TABLE IF NOT EXISTS product_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, discount_code_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid ON discount_codes(valid_from, valid_until);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_discount_codes_updated_at ON discount_codes;
CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_discounts ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para products
DROP POLICY IF EXISTS "Allow public read access to active products" ON products;
CREATE POLICY "Allow public read access to active products" ON products
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin/owner full access to products" ON products;
CREATE POLICY "Allow admin/owner full access to products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
    );

-- Crear políticas de seguridad para discount_codes
DROP POLICY IF EXISTS "Allow public read access to active discount codes" ON discount_codes;
CREATE POLICY "Allow public read access to active discount codes" ON discount_codes
    FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));

DROP POLICY IF EXISTS "Allow admin/owner full access to discount codes" ON discount_codes;
CREATE POLICY "Allow admin/owner full access to discount codes" ON discount_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
    );

-- Crear políticas de seguridad para product_discounts
DROP POLICY IF EXISTS "Allow public read access to product discounts" ON product_discounts;
CREATE POLICY "Allow public read access to product discounts" ON product_discounts
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin/owner full access to product discounts" ON product_discounts;
CREATE POLICY "Allow admin/owner full access to product discounts" ON product_discounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'owner')
        )
    );

-- Crear vista para productos con descuentos
CREATE OR REPLACE VIEW products_with_discounts AS
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

-- Insertar productos de ejemplo (solo si no existen)
INSERT INTO products (name, description, short_description, price, original_price, currency, category, image_url, external_url, is_active, is_featured, sku)
SELECT 
    'El Pack Definitivo de Prompts para Emprender con ChatGPT',
    'Pack completo de prompts en español para potenciar tu negocio con ChatGPT. Incluye plantillas para ventas, marketing, automatización y organización empresarial.',
    'Pack de prompts en español para emprendedores',
    19.99,
    29.99,
    'USD',
    'Prompts',
    '/spanish-pack-official.png',
    'https://promptingchile.gumroad.com/l/jmkpzq?layout=profile',
    true,
    true,
    'PACK-ES-001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PACK-ES-001');

INSERT INTO products (name, description, short_description, price, original_price, currency, category, image_url, external_url, is_active, is_featured, sku)
SELECT 
    'The Ultimate ChatGPT Prompt Pack for Entrepreneurs',
    'Complete prompt pack in English to boost your business with ChatGPT. Includes templates for sales, marketing, automation and business organization.',
    'English prompt pack for entrepreneurs',
    19.99,
    29.99,
    'USD',
    'Prompts',
    '/english-pack-official.png',
    'https://promptingchile.gumroad.com/l/mkioj?layout=profile',
    true,
    true,
    'PACK-EN-001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PACK-EN-001');

-- Insertar código de descuento de ejemplo
INSERT INTO discount_codes (code, name, description, discount_type, discount_value, usage_limit, is_active, valid_until)
SELECT 
    'LAUNCH20',
    'Descuento de Lanzamiento',
    '20% de descuento en todos los productos por tiempo limitado',
    'percentage',
    20.00,
    100,
    true,
    NOW() + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM discount_codes WHERE code = 'LAUNCH20');

-- Aplicar descuento a los productos de ejemplo
INSERT INTO product_discounts (product_id, discount_code_id)
SELECT p.id, dc.id
FROM products p, discount_codes dc
WHERE p.sku IN ('PACK-ES-001', 'PACK-EN-001')
AND dc.code = 'LAUNCH20'
AND NOT EXISTS (
    SELECT 1 FROM product_discounts pd2 
    WHERE pd2.product_id = p.id AND pd2.discount_code_id = dc.id
);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Shop tables created successfully!';
    RAISE NOTICE 'Created tables: products, discount_codes, product_discounts';
    RAISE NOTICE 'Created view: products_with_discounts';
    RAISE NOTICE 'Inserted sample products and discount codes';
END $$;

-- =============================================================================
-- ANTANA - SCRIPT DE CONEXIÓN RELACIONAL (FOREIGN KEYS) PARA SUPABASE
-- =============================================================================
-- Este script es 100% seguro (no borra tus datos ni rompe la web actual):
-- 1. Crea las tablas normalizadas (categories, extra_groups, extras,
--    category_extra_groups, order_items, order_item_extras).
-- 2. Conecta mediante FOREIGN KEYS todas las tablas existentes (menu_items,
--    neighborhoods, orders, settings, admin_users).
-- 3. Migra automáticamente tus datos actuales y deja triggers automáticos
--    para que cada nuevo pedido/producto mantenga las llaves foráneas al día.
-- =============================================================================

BEGIN;

-- 1. Crear tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  daily_limit int DEFAULT 10,
  limit_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Poblar categorías principales desde menu_items actuales (excluyendo "Extras - ...")
INSERT INTO public.categories (name, sort_order)
SELECT DISTINCT category, 0
FROM public.menu_items
WHERE category IS NOT NULL
  AND category NOT LIKE 'Extras - %'
ON CONFLICT (name) DO NOTHING;

-- Asegurar categorías base
INSERT INTO public.categories (name, sort_order)
VALUES
  ('Hamburguesas', 1),
  ('Salchipapas', 2),
  ('Perros Calientes', 3),
  ('Bebidas', 4),
  ('Postres', 5),
  ('Adicionales', 6)
ON CONFLICT (name) DO NOTHING;

-- 2. Conectar menu_items -> categories mediante FOREIGN KEY
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;

UPDATE public.menu_items m
SET category_id = c.id
FROM public.categories c
WHERE m.category = c.name
  AND m.category_id IS NULL;

-- 3. Crear tablas de Grupos de Extras y Extras individuales
CREATE TABLE IF NOT EXISTS public.extra_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.extra_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,0) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_out_of_stock boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabla puente Categorías <-> Grupos de Extras
CREATE TABLE IF NOT EXISTS public.category_extra_groups (
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  extra_group_id uuid NOT NULL REFERENCES public.extra_groups(id) ON DELETE CASCADE,
  tab_label text NOT NULL,
  PRIMARY KEY (category_id, extra_group_id)
);

-- Poblar grupos de extras desde los prefijos "Extras - " existentes en menu_items
INSERT INTO public.extra_groups (name)
SELECT DISTINCT replace(category, 'Extras - ', '')
FROM public.menu_items
WHERE category LIKE 'Extras - %'
ON CONFLICT (name) DO NOTHING;

-- Poblar extras individuales conservando el mismo UUID de menu_items para trazabilidad
INSERT INTO public.extras (id, group_id, name, price, is_out_of_stock, created_at)
SELECT
  m.id,
  eg.id,
  m.name,
  COALESCE(m.price, 0),
  COALESCE(m.is_out_of_stock, false),
  COALESCE(m.created_at, now())
FROM public.menu_items m
JOIN public.extra_groups eg ON eg.name = replace(m.category, 'Extras - ', '')
WHERE m.category LIKE 'Extras - %'
ON CONFLICT (id) DO NOTHING;

-- Poblar relación entre categorías y grupos de extras (regla QC-05 incluida)
INSERT INTO public.category_extra_groups (category_id, extra_group_id, tab_label)
SELECT c.id, eg.id, '+ Salsas'
FROM public.categories c
CROSS JOIN public.extra_groups eg
WHERE c.name IN ('Hamburguesas', 'Perros Calientes', 'Salchipapas')
  AND eg.name = 'Salsas'
ON CONFLICT DO NOTHING;

INSERT INTO public.category_extra_groups (category_id, extra_group_id, tab_label)
SELECT c.id, eg.id, '+ Ingredientes'
FROM public.categories c
JOIN public.extra_groups eg ON (
  (c.name = 'Hamburguesas' AND eg.name IN ('Ingredientes Hamburguesas', 'Ingredientes')) OR
  (c.name = 'Perros Calientes' AND eg.name = 'Ingredientes Perros') OR
  (c.name = 'Salchipapas' AND eg.name = 'Ingredientes Salchipapas')
)
ON CONFLICT DO NOTHING;

INSERT INTO public.category_extra_groups (category_id, extra_group_id, tab_label)
SELECT c.id, eg.id, '+ Michelados'
FROM public.categories c
CROSS JOIN public.extra_groups eg
WHERE c.name = 'Bebidas'
  AND eg.name IN ('Michelados', 'Opciones Bebidas')
ON CONFLICT DO NOTHING;

-- 4. Conectar orders -> neighborhoods mediante FOREIGN KEY y agregar columnas faltantes
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'delivery',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS housing_details text,
  ADD COLUMN IF NOT EXISTS neighborhood_id uuid REFERENCES public.neighborhoods(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Enlazar pedidos existentes con su barrio en neighborhoods
UPDATE public.orders o
SET neighborhood_id = n.id
FROM public.neighborhoods n
WHERE lower(trim(o.neighborhood)) = lower(trim(n.name))
  AND o.neighborhood_id IS NULL;

-- 5. Crear tablas de detalle de pedido (order_items y order_item_extras) conectadas por FK
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  unit_price numeric(10,0) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  comment text
);

CREATE TABLE IF NOT EXISTS public.order_item_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  extra_id uuid REFERENCES public.extras(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  unit_price numeric(10,0) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

-- Migrar items JSONB actuales de orders hacia order_items
INSERT INTO public.order_items (order_id, menu_item_id, name_snapshot, unit_price, quantity, comment)
SELECT
  o.id AS order_id,
  m.id AS menu_item_id,
  COALESCE(item->>'name', 'Producto') AS name_snapshot,
  COALESCE((item->>'price')::numeric, 0) AS unit_price,
  GREATEST(COALESCE((item->>'quantity')::int, 1), 1) AS quantity,
  NULLIF(item->>'comment', '') AS comment
FROM public.orders o
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(o.items) = 'array' THEN o.items ELSE '[]'::jsonb END
) AS item
LEFT JOIN public.menu_items m
  ON m.id::text = (item->>'id')
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id
);

-- 6. Conectar settings -> admin_users mediante FOREIGN KEY (último admin que editó ajustes)
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL;

-- 7. Triggers automáticos para mantener sincronizadas las llaves foráneas con la app actual
CREATE OR REPLACE FUNCTION public.fn_sync_menu_item_category()
RETURNS trigger AS $$
BEGIN
  IF NEW.category IS NOT NULL AND NEW.category NOT LIKE 'Extras - %' THEN
    INSERT INTO public.categories (name) VALUES (NEW.category) ON CONFLICT (name) DO NOTHING;
    SELECT id INTO NEW.category_id FROM public.categories WHERE name = NEW.category LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_menu_item_category ON public.menu_items;
CREATE TRIGGER trg_sync_menu_item_category
BEFORE INSERT OR UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_menu_item_category();

CREATE OR REPLACE FUNCTION public.fn_sync_order_relations()
RETURNS trigger AS $$
BEGIN
  IF NEW.neighborhood_id IS NULL AND NEW.neighborhood IS NOT NULL THEN
    SELECT id INTO NEW.neighborhood_id
    FROM public.neighborhoods
    WHERE lower(trim(name)) = lower(trim(NEW.neighborhood))
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_order_relations ON public.orders;
CREATE TRIGGER trg_sync_order_relations
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_order_relations();

-- Índices para rendimiento de las llaves foráneas
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_extras_group_id ON public.extras(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_neighborhood_id ON public.orders(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_extras_order_item_id ON public.order_item_extras(order_item_id);

COMMIT;

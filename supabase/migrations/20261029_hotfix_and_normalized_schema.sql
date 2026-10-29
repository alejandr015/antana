-- ============================================================================
-- MIGRACIÓN SUPABASE – ANTANA
-- Parte 1: Hotfix no destructivo sobre tablas actuales (order_type, status, RLS)
-- Parte 2: Creación de tablas normalizadas (3FN) y migración de datos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PARTE 1: HOTFIX INMEDIATO Y POLÍTICAS DE SEGURIDAD (RLS - QC-02)
-- ----------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'delivery'
    CHECK (order_type IN ('delivery', 'pickup')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'confirmado', 'entregado', 'cancelado'));

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at
  ON public.orders (status, created_at DESC);

-- Activar Row Level Security (RLS) en todas las tablas públicas
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar si el usuario autenticado es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Políticas para menu_items (Lectura pública, escritura solo Admin)
DROP POLICY IF EXISTS "Lectura pública de menu_items" ON public.menu_items;
CREATE POLICY "Lectura pública de menu_items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escritura admin en menu_items" ON public.menu_items;
CREATE POLICY "Escritura admin en menu_items"
  ON public.menu_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para neighborhoods (Lectura pública, escritura solo Admin)
DROP POLICY IF EXISTS "Lectura pública de neighborhoods" ON public.neighborhoods;
CREATE POLICY "Lectura pública de neighborhoods"
  ON public.neighborhoods FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escritura admin en neighborhoods" ON public.neighborhoods;
CREATE POLICY "Escritura admin en neighborhoods"
  ON public.neighborhoods FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para settings (Lectura pública, escritura solo Admin)
DROP POLICY IF EXISTS "Lectura pública de settings" ON public.settings;
CREATE POLICY "Lectura pública de settings"
  ON public.settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escritura admin en settings" ON public.settings;
CREATE POLICY "Escritura admin en settings"
  ON public.settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para orders (Inserción pública válida, lectura/actualización solo Admin - SE-03 / SE-04)
DROP POLICY IF EXISTS "Clientes pueden crear pedidos" ON public.orders;
CREATE POLICY "Clientes pueden crear pedidos"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(customer_name)) > 0
    AND customer_phone ~ '^[0-9]{10}$'
    AND total >= 0
  );

DROP POLICY IF EXISTS "Solo admin lee y actualiza orders" ON public.orders;
CREATE POLICY "Solo admin lee y actualiza orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Solo admin modifica orders" ON public.orders;
CREATE POLICY "Solo admin modifica orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para admin_users (Solo usuarios autenticados verifican, solo Admin modifica - SE-02)
DROP POLICY IF EXISTS "Lectura autenticada de admin_users" ON public.admin_users;
CREATE POLICY "Lectura autenticada de admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Solo admin modifica admin_users" ON public.admin_users;
CREATE POLICY "Solo admin modifica admin_users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Políticas para Storage bucket menu-images (SE-05: Lectura pública, subida/borrado solo Admin)
DROP POLICY IF EXISTS "Subida admin en menu-images" ON storage.objects;
CREATE POLICY "Subida admin en menu-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND public.is_admin());

DROP POLICY IF EXISTS "Actualizacion admin en menu-images" ON storage.objects;
CREATE POLICY "Actualizacion admin en menu-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-images' AND public.is_admin());

DROP POLICY IF EXISTS "Borrado admin en menu-images" ON storage.objects;
CREATE POLICY "Borrado admin en menu-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-images' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- PARTE 2: TABLAS COMPLEMENTARIAS DEL MODELO RELACIONAL NORMALIZADO (3FN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  daily_limit int,
  limit_active boolean NOT NULL DEFAULT false
);

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
  is_out_of_stock boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.category_extra_groups (
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  extra_group_id uuid REFERENCES public.extra_groups(id) ON DELETE CASCADE,
  tab_label text NOT NULL,
  PRIMARY KEY (category_id, extra_group_id)
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  name_snapshot text NOT NULL,
  unit_price numeric(10,0) NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  comment text
);

CREATE TABLE IF NOT EXISTS public.order_item_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  extra_id uuid REFERENCES public.extras(id) ON DELETE SET NULL,
  name_snapshot text NOT NULL,
  unit_price numeric(10,0) NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0)
);


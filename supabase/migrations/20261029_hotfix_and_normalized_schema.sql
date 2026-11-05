-- ============================================================================
-- LIMPIEZA FINAL DE POLÍTICAS ANTIGUAS EN MENU_ITEMS, NEIGHBORHOODS Y STORAGE
-- ============================================================================
-- Instrucciones: Copia todo este archivo, pégalo en el SQL Editor de Supabase
-- y presiona "Run".
--
-- ¿Por qué seguían abiertos SE-01 (menu_items), SE-02 (neighborhoods) y SE-05?
-- Porque en Supabase quedaron políticas antiguas creadas anteriormente (con
-- otros nombres) que daban permiso de escritura a "public/anon". Este script
-- borra automáticamente cualquier política antigua en esas tablas y deja
-- únicamente las políticas seguras.
-- ============================================================================

BEGIN;

-- 1. Eliminar automáticamente todas las políticas previas de las tablas públicas
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'menu_items', 'neighborhoods', 'settings', 'orders', 'admin_users',
        'categories', 'extra_groups', 'extras', 'category_extra_groups',
        'order_items', 'order_item_extras'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;

  -- Eliminar también políticas previas de escritura pública en storage.objects para menu-images
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 2. Recrear únicamente las políticas limpias y seguras
-- Catálogo público (Lectura para todos, Escritura solo Admin)
CREATE POLICY "Lectura pública de menu_items"
  ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en menu_items"
  ON public.menu_items FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de neighborhoods"
  ON public.neighborhoods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en neighborhoods"
  ON public.neighborhoods FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de settings"
  ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en settings"
  ON public.settings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de categories"
  ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en categories"
  ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de extra_groups"
  ON public.extra_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en extra_groups"
  ON public.extra_groups FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de extras"
  ON public.extras FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en extras"
  ON public.extras FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Lectura pública de category_extra_groups"
  ON public.category_extra_groups FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Escritura admin en category_extra_groups"
  ON public.category_extra_groups FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Pedidos (Inserción pública válida, Lectura/Modificación solo Admin)
CREATE POLICY "Clientes pueden crear pedidos"
  ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(trim(customer_name)) > 0
    AND customer_phone ~ '^[0-9]{10}$'
    AND total >= 0
  );
CREATE POLICY "Solo admin lee orders"
  ON public.orders FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Solo admin modifica orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Clientes pueden insertar order_items"
  ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (quantity > 0);
CREATE POLICY "Solo admin lee order_items"
  ON public.order_items FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Clientes pueden insertar order_item_extras"
  ON public.order_item_extras FOR INSERT TO anon, authenticated WITH CHECK (quantity > 0);
CREATE POLICY "Solo admin lee order_item_extras"
  ON public.order_item_extras FOR SELECT TO authenticated USING (public.is_admin());

-- Administradores
CREATE POLICY "Lectura autenticada de admin_users"
  ON public.admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin modifica admin_users"
  ON public.admin_users FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage bucket menu-images (Lectura pública, Subida/Edición/Borrado solo Admin)
CREATE POLICY "Lectura pública en menu-images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'menu-images');
CREATE POLICY "Subida admin en menu-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND public.is_admin());
CREATE POLICY "Actualizacion admin en menu-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-images' AND public.is_admin());
CREATE POLICY "Borrado admin en menu-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images' AND public.is_admin());

COMMIT;

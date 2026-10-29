/**
 * Script de verificación de seguridad RLS (Casos SE-01 a SE-06 del Plan de Pruebas)
 * Ejecución: node --env-file=.env tests/security/rls_security_check.js
 * Si una escritura anónima es permitida por falta de RLS, limpia el registro de prueba inmediatamente.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Ejecuta con: node --env-file=.env tests/security/rls_security_check.js');
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function runSecurityChecks() {
  console.log('=== Verificación de Políticas RLS (QC-02 / SE-01..SE-05) ===\n');

  // Limpieza preventiva de cualquier registro de prueba anterior
  await anonClient.from('neighborhoods').delete().eq('name', 'TEST_RLS_BARRIO');
  await anonClient.from('menu_items').delete().eq('name', 'TEST_RLS_INTRUSION');

  // SE-01: Escritura anónima en menu_items
  const { data: se01Data, error: se01Error } = await anonClient
    .from('menu_items')
    .insert([{ name: 'TEST_RLS_INTRUSION', category: 'Hamburguesas', price: 100 }])
    .select();
  if (!se01Error && se01Data?.length) {
    await anonClient.from('menu_items').delete().eq('id', se01Data[0].id);
  }
  console.log(`[SE-01] Insert anónimo en menu_items bloqueado:`, Boolean(se01Error), se01Error?.message || '⚠️ PERMITIDO (Aplicar migración RLS)');

  // SE-02: Escritura anónima en neighborhoods y admin_users
  const { data: se02NbData, error: se02NbError } = await anonClient
    .from('neighborhoods')
    .insert([{ name: 'TEST_RLS_BARRIO', price: 1000 }])
    .select();
  if (!se02NbError && se02NbData?.length) {
    await anonClient.from('neighborhoods').delete().eq('id', se02NbData[0].id);
  }
  const { error: se02AdminError } = await anonClient
    .from('admin_users')
    .insert([{ email: 'intruder@test.com' }]);
  console.log(`[SE-02] Insert anónimo en neighborhoods bloqueado:`, Boolean(se02NbError), se02NbError?.message || '⚠️ PERMITIDO (Aplicar migración RLS)');
  console.log(`[SE-02] Insert anónimo en admin_users bloqueado:`, Boolean(se02AdminError), se02AdminError?.message || '⚠️ PERMITIDO');

  // SE-03: Lectura anónima de orders (datos personales de clientes)
  const { data: ordersData, error: se03Error } = await anonClient
    .from('orders')
    .select('id, customer_name, customer_phone')
    .limit(1);
  const se03Blocked = Boolean(se03Error) || !ordersData || ordersData.length === 0;
  console.log(`[SE-03] Select anónimo en orders bloqueado/vacío:`, se03Blocked, se03Error?.message || `⚠️ Filas expuestas: ${ordersData?.length || 0} (Aplicar migración RLS)`);

  // SE-05: Subida sin sesión al bucket menu-images
  const testFileName = `rls_test_${Date.now()}.webp`;
  const dummyBlob = new Blob(['test'], { type: 'image/webp' });
  const { error: se05Error } = await anonClient.storage
    .from('menu-images')
    .upload(testFileName, dummyBlob);
  if (!se05Error) {
    await anonClient.storage.from('menu-images').remove([testFileName]);
  }
  console.log(`[SE-05] Upload anónimo a bucket menu-images bloqueado:`, Boolean(se05Error), se05Error?.message || '⚠️ PERMITIDO (Aplicar migración RLS de Storage)');
}

runSecurityChecks();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Ejecuta con: node --env-file=.env test_orders.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Orders found:", data.length);
    if (data.length > 0) {
      console.log("First order items type:", typeof data[0].items);
      console.log("Is array?", Array.isArray(data[0].items));
      console.log("First order raw items:", JSON.stringify(data[0].items).substring(0, 200));
    }
  }
}

test();

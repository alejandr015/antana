import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgngiijmfnjqqyynuqyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnbmdpaWptZm5qcXF5eW51cXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Nzc4MDgsImV4cCI6MjEwMzI1MzgwOH0.3XGigKzLst8e88x9y7CJD8CRiEbW2d00wnOlJzGufXw';
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

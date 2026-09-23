import { supabase } from './supabaseClient';

// Caché en memoria para evitar peticiones repetitivas
let menuCache = null;
let menuCacheTimestamp = 0;
let neighborhoodCache = null;
let neighborhoodCacheTimestamp = 0;
let settingsCache = null;
let settingsCacheTimestamp = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos de caché

export const getMenuItems = async (forceRefresh = false) => {
  if (!forceRefresh && menuCache && (Date.now() - menuCacheTimestamp < CACHE_DURATION)) {
    return menuCache;
  }

  const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
  const formattedData = data.map(item => ({
    id: item.id,
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.image_url,
    isOutofStock: item.is_out_of_stock
  }));
  
  menuCache = formattedData;
  menuCacheTimestamp = Date.now();
  return formattedData;
};

export const saveMenuItem = async (item) => {
  const payload = {
    category: item.category,
    name: item.name,
    description: item.description,
    price: item.price,
    image_url: item.imageUrl,
    is_out_of_stock: item.isOutofStock || false
  };

  if (item.id && item.id.includes('-')) {
    const { error } = await supabase.from('menu_items').update(payload).eq('id', item.id);
    if (error) console.error("Error updating menu item:", error);
  } else {
    const { error } = await supabase.from('menu_items').insert([payload]);
    if (error) console.error("Error inserting menu item:", error);
  }
  
  menuCache = null; // Invalida caché
  return await getMenuItems();
};

export const deleteMenuItem = async (id) => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) console.error("Error deleting menu item:", error);
  
  menuCache = null; // Invalida caché
  return await getMenuItems();
};

export const getNeighborhoods = async (forceRefresh = false) => {
  if (!forceRefresh && neighborhoodCache && (Date.now() - neighborhoodCacheTimestamp < CACHE_DURATION)) {
    return neighborhoodCache;
  }

  const { data, error } = await supabase.from('neighborhoods').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }
  
  neighborhoodCache = data;
  neighborhoodCacheTimestamp = Date.now();
  return data;
};

export const saveNeighborhood = async (neighborhood) => {
  const payload = { name: neighborhood.name, price: neighborhood.price };
  if (neighborhood.id && neighborhood.id.includes('-')) {
    await supabase.from('neighborhoods').update(payload).eq('id', neighborhood.id);
  } else {
    await supabase.from('neighborhoods').insert([payload]);
  }
  
  neighborhoodCache = null;
  return await getNeighborhoods();
};

export const deleteNeighborhood = async (id) => {
  await supabase.from('neighborhoods').delete().eq('id', id);
  neighborhoodCache = null;
  return await getNeighborhoods();
};

export const getSettings = async (forceRefresh = false) => {
  if (!forceRefresh && settingsCache && (Date.now() - settingsCacheTimestamp < CACHE_DURATION)) {
    return settingsCache;
  }

  const { data, error } = await supabase.from('settings').select('config').eq('id', 1).single();
  if (error) {
    console.error("Error fetching settings:", error);
    return {
      preOrderAlert: { active: false, title: '', message: '', allowContinue: true },
      whatsappTemplate: ''
    };
  }
  
  settingsCache = data.config;
  settingsCacheTimestamp = Date.now();
  return data.config;
};

export const saveSettings = async (settings) => {
  const { error } = await supabase.from('settings').update({ config: settings, updated_at: new Date() }).eq('id', 1);
  if (error) console.error("Error updating settings:", error);
  
  settingsCache = settings; // Update cache immediately
  settingsCacheTimestamp = Date.now();
  return settings;
};

// ---------------------- STORAGE (IMAGENES) ----------------------
export const uploadImage = async (fileBlob, fileName) => {
  // Limpiamos el nombre del archivo para evitar problemas en URLs
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `public/${Date.now()}_${safeName}`;

  const { data, error } = await supabase
    .storage
    .from('menu-images')
    .upload(filePath, fileBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/webp'
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase
    .storage
    .from('menu-images')
    .getPublicUrl(filePath);

  return publicUrl;
};

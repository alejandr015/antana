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

export const updateCategoryInAllItems = async (oldName, newName) => {
  const { error } = await supabase.from('menu_items').update({ category: newName }).eq('category', oldName);
  if (error) console.error("Error updating category in menu items:", error);
  menuCache = null;
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
  const payload = { 
    name: neighborhood.name, 
    price: neighborhood.price,
    isRestricted: neighborhood.isRestricted || false,
    meetingPointName: neighborhood.meetingPointName || '',
    meetingPointAddress: neighborhood.meetingPointAddress || '',
    customAlertMessage: neighborhood.customAlertMessage || ''
  };
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
  
  const defaultSettings = {
    branding: {
      logoUrl: '/antana-logo-oficial.png',
      logoGallery: [], // Almacena hasta 5 logos para festividades
      title: 'Sabor <span>Angus</span> Inigualable',
      description: 'Una mezcla perfecta entre lo industrial y lo retro. Disfruta de la mejor carne Angus certificada en el corazón de Neiva.'
    },
    customCategories: [
      'Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Postres', 
      'Adicionales', 'Extras - Salsas', 'Extras - Ingredientes Hamburguesas', 
      'Extras - Ingredientes Perros', 'Extras - Ingredientes Salchipapas', 'Extras - Opciones Bebidas'
    ],
    preOrderAlert: { active: false, title: '', message: '', allowContinue: true },
    whatsappTemplate: '',
    categoryLimits: {
      'Hamburguesas': { active: true, limit: 10 },
      'Salchipapas': { active: true, limit: 5 },
      'Perros Calientes': { active: true, limit: 10 },
      'Bebidas': { active: true, limit: 20 },
      'Postres': { active: true, limit: 10 },
      'Adicionales': { active: true, limit: 10 },
      'Extras - Salsas': { active: true, limit: 5 },
      'Extras - Ingredientes Hamburguesas': { active: true, limit: 5 },
      'Extras - Ingredientes Perros': { active: true, limit: 5 },
      'Extras - Ingredientes Salchipapas': { active: true, limit: 5 },
      'Extras - Opciones Bebidas': { active: true, limit: 5 }
    }
  };

  if (error) {
    console.error("Error fetching settings:", error);
    return defaultSettings;
  }
  
  let mergedCategories = data.config.customCategories || [];
  
  // Lista de categorías que siempre deben estar
  const requiredCats = [
    'Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Postres', 
    'Adicionales', 'Extras - Salsas', 'Extras - Ingredientes Hamburguesas', 
    'Extras - Ingredientes Perros', 'Extras - Ingredientes Salchipapas', 'Extras - Opciones Bebidas'
  ];

  // Identificar cuáles faltan
  const missingCats = requiredCats.filter(cat => !mergedCategories.includes(cat));

  if (missingCats.length > 0) {
    // Si falta alguna, la agregamos
    mergedCategories = [...mergedCategories, ...missingCats];
    
    // Auto-guardar la migración en la base de datos para que sea permanente
    supabase.from('settings').update({ 
      config: { ...data.config, customCategories: mergedCategories } 
    }).eq('id', 1).then(() => console.log('Migración de categorías guardada permanentemente.'));
  }

  const finalConfig = {
    ...defaultSettings,
    ...data.config,
    customCategories: mergedCategories,
    categoryLimits: {
      ...defaultSettings.categoryLimits,
      ...(data.config.categoryLimits || {})
    }
  };
  
  settingsCache = finalConfig;
  settingsCacheTimestamp = Date.now();
  return finalConfig;
};

export const saveSettings = async (settings) => {
  const { error } = await supabase.from('settings').update({ config: settings, updated_at: new Date() }).eq('id', 1);
  if (error) console.error("Error updating settings:", error);
  
  settingsCache = settings; // Update cache immediately
  settingsCacheTimestamp = Date.now();
  
  // Despachar evento para que componentes como Navbar se actualicen automáticamente
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
  }
  
  return settings;
};

// ---------------------- PEDIDOS / ESTADÍSTICAS ----------------------
export const saveOrder = async (orderData) => {
  const { error } = await supabase.from('orders').insert([orderData]);
  if (error) {
    console.error("Error inserting order:", error);
    throw error;
  }
};

export const getOrders = async (startDate, endDate) => {
  let query = supabase.from('orders').select('*');
  
  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data;
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

// ---------------------- ADMINISTRADORES (Seguridad) ----------------------
export const getAdminUsers = async () => {
  const { data, error } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
  return data;
};

export const addAdminUser = async (email) => {
  const { error } = await supabase.from('admin_users').insert([{ email: email.toLowerCase().trim() }]);
  if (error) {
    console.error("Error adding admin user:", error);
    throw error;
  }
};

export const deleteAdminUser = async (id) => {
  const { error } = await supabase.from('admin_users').delete().eq('id', id);
  if (error) {
    console.error("Error deleting admin user:", error);
    throw error;
  }
};


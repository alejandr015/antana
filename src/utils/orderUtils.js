/**
 * Calcula el total de extras para un producto considerando la regla de salsas gratis (primeras 2 gratis, luego $1.000 por cada par adicional).
 * Cumple con QC-03 (Consistencia de Precios).
 */
export const calculateExtrasTotal = (extras = []) => {
  return extras.reduce((sum, ext) => {
    const qty = ext.quantity || 1;
    if (ext.price === 0 && qty > 2) {
      const extraPackages = Math.ceil((qty - 2) / 2);
      return sum + extraPackages * 1000;
    }
    return sum + ext.price * qty;
  }, 0);
};

/**
 * Calcula el precio unitario y el subtotal de línea para un producto con extras y cantidad.
 * Cumple con QC-03 y CL-06.
 */
export const calculateItemTotal = (basePrice, quantity = 1, extras = []) => {
  const unitPrice = basePrice + calculateExtrasTotal(extras);
  return {
    unitPrice,
    lineTotal: unitPrice * quantity
  };
};

/**
 * Determina las pestañas y categorías de extras permitidas según la categoría del producto.
 * Cumple con QC-05 (Bebidas nunca muestra Salsas ni Ingredientes).
 */
export const getCustomizerConfigForCategory = (category) => {
  if (category === 'Bebidas') {
    return {
      tabs: [{ id: 'opciones_bebidas', label: '+ Opciones' }],
      extrasCategories: {
        opciones_bebidas: 'Extras - Opciones Bebidas'
      }
    };
  }
  if (category === 'Hamburguesas') {
    return {
      tabs: [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ],
      extrasCategories: {
        ingredientes: 'Extras - Ingredientes Hamburguesas',
        salsas: 'Extras - Salsas'
      }
    };
  }
  if (category === 'Perros Calientes') {
    return {
      tabs: [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ],
      extrasCategories: {
        ingredientes: 'Extras - Ingredientes Perros',
        salsas: 'Extras - Salsas'
      }
    };
  }
  if (category === 'Salchipapas') {
    return {
      tabs: [
        { id: 'ingredientes', label: '+ Ingredientes' },
        { id: 'salsas', label: '+ Salsas' }
      ],
      extrasCategories: {
        ingredientes: 'Extras - Ingredientes Salchipapas',
        salsas: 'Extras - Salsas'
      }
    };
  }
  return {
    tabs: [
      { id: 'ingredientes', label: '+ Ingredientes' },
      { id: 'salsas', label: '+ Salsas' }
    ],
    extrasCategories: {
      ingredientes: 'Extras - Ingredientes',
      salsas: 'Extras - Salsas'
    }
  };
};

/**
 * Sanitiza texto libre (nombre, dirección, conjunto, notas) eliminando etiquetas HTML/scripts
 * y caracteres de control, y limitando la longitud máxima.
 * Cumple con ISO/IEC 27002 Control A.8.28 (Codificación Segura - Prevención XSS/Inyección).
 */
export const sanitizeInputText = (value = '', maxLength = 120) => {
  return String(value)
    .replace(/[<>]/g, '') // Evita inyección de tags HTML/script
    .replace(/[\u0000-\u001F\u007F]/g, '') // Elimina caracteres de control invisibles
    .slice(0, maxLength);
};

/**
 * Opciones rápidas por defecto de preferencia de salsas para comidas.
 */
export const SAUCE_PREFERENCE_OPTIONS = ['Salsas aparte', 'Sin salsas'];

/**
 * Devuelve el título dinámico según la categoría del producto ("Recomendaciones para tu hamburguesa", etc.).
 */
export const getRecommendationTitleForCategory = (category = '') => {
  const map = {
    'Hamburguesas': 'Recomendaciones para tu hamburguesa:',
    'Perros Calientes': 'Recomendaciones para tu perro caliente:',
    'Salchipapas': 'Recomendaciones para tu salchipapa:',
    'Bebidas': 'Recomendaciones para tu bebida:',
    'Postres': 'Recomendaciones para tu postre:',
    'Adicionales': 'Recomendaciones para tu adicional:'
  };
  return map[category] || `Recomendaciones para tu ${category ? category.toLowerCase() : 'pedido'}:`;
};

/**
 * Separa las recomendaciones seleccionadas del comentario libre al editar un ítem del carrito.
 */
export const parseRecommendations = (fullComment = '', availableOptions = SAUCE_PREFERENCE_OPTIONS) => {
  const raw = String(fullComment || '').trim();
  if (!raw) return { selectedRecommendations: [], customComment: '' };

  const optionsSet = new Set([...SAUCE_PREFERENCE_OPTIONS, ...(availableOptions || [])]);
  if (raw.includes(' | ')) {
    const [prefixPart, ...restParts] = raw.split(' | ');
    const candidateTokens = prefixPart.split(',').map(s => s.trim()).filter(Boolean);
    if (candidateTokens.length > 0 && candidateTokens.every(t => optionsSet.has(t))) {
      return {
        selectedRecommendations: candidateTokens,
        customComment: restParts.join(' | ').trim()
      };
    }
  }

  const singleTokens = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (singleTokens.length > 0 && singleTokens.every(t => optionsSet.has(t))) {
    return {
      selectedRecommendations: singleTokens,
      customComment: ''
    };
  }

  return { selectedRecommendations: [], customComment: raw };
};

/**
 * Compatibilidad para extraer una sola preferencia de salsas.
 */
export const parseSaucePreference = (fullComment = '') => {
  const { selectedRecommendations, customComment } = parseRecommendations(fullComment, SAUCE_PREFERENCE_OPTIONS);
  return {
    saucePreference: selectedRecommendations[0] || '',
    customComment
  };
};

/**
 * Une las recomendaciones rápidas seleccionadas (array o string) con la nota escrita por el cliente
 * para que se refleje tanto en el Carrito como en el mensaje de WhatsApp.
 */
export const buildFinalComment = (recommendationsInput = '', customComment = '') => {
  const list = Array.isArray(recommendationsInput)
    ? recommendationsInput.map(r => sanitizeInputText(r, 60).trim()).filter(Boolean)
    : [sanitizeInputText(recommendationsInput, 60).trim()].filter(Boolean);

  const cleanRecs = list.join(', ');
  const cleanText = sanitizeInputText(customComment, 160).trim();
  if (cleanRecs && cleanText) {
    return `${cleanRecs} | ${cleanText}`;
  }
  return cleanRecs || cleanText || '';
};

/**
 * Sanitiza un input de celular dejando únicamente dígitos y máximo 10 caracteres (CL-10).
 */
export const sanitizePhoneInput = (rawValue = '') => {
  return String(rawValue).replace(/\D/g, '').slice(0, 10);
};

/**
 * Valida que el celular tenga exactamente 10 dígitos numéricos (CL-10, CL-11).
 */
export const isValidColombianPhone = (phone = '') => {
  return /^\d{10}$/.test(String(phone));
};

/**
 * Chips de indicación rápida (1 toque) para entregas a domicilio (Opción A: Formulario Ultra-Rápido).
 */
export const DELIVERY_QUICK_CHIPS = [
  'Dejar en portería',
  'Llamar al llegar',
  'Casa 1er piso',
  'Casa 2do piso',
  'Timbrar'
];

/**
 * Activa o desactiva un chip rápido dentro del campo de indicación/referencia de entrega.
 */
export const toggleDeliveryQuickChip = (currentText = '', chip = '') => {
  const cleanChip = sanitizeInputText(chip, 60).trim();
  if (!cleanChip) return sanitizeInputText(currentText, 120);

  const tokens = String(currentText || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const exists = tokens.some(t => t.toLowerCase() === cleanChip.toLowerCase());
  const nextTokens = exists
    ? tokens.filter(t => t.toLowerCase() !== cleanChip.toLowerCase())
    : [...tokens, cleanChip];

  return sanitizeInputText(nextTokens.join(', '), 120);
};

/**
 * Tipos de ubicación urbana disponibles para entregas a domicilio (compatibilidad).
 */
export const LOCATION_TYPES = [
  { id: 'barrio_casa', label: '🏠 Casa / Barrio', shortLabel: 'Casa en Barrio' },
  { id: 'conjunto', label: '🏢 Conjunto / Condominio', shortLabel: 'Conjunto Cerrado' },
  { id: 'edificio', label: '🏙️ Edificio / Unidad Res.', shortLabel: 'Edificio / Unidad Residencial' },
  { id: 'comercial', label: '🏬 Local / Oficina / Hotel', shortLabel: 'Local / Empresa / Hotel' }
];

/**
 * Construye el resumen estructurado de Barrio/Conjunto y Dirección Completa (Opción A Ultra-Rápido).
 */
export const formatStructuredDeliveryAddress = ({
  locationType = 'unificado',
  neighborhoodName = '',
  address = '',
  complexName = '',
  unitSubType = 'apto',
  towerOrBlock = '',
  unitNumber = '',
  housingDetails = ''
}) => {
  const cleanNb = sanitizeInputText(neighborhoodName, 80).trim();
  const cleanAddr = sanitizeInputText(address, 120).trim();
  const cleanComplex = sanitizeInputText(complexName, 90).trim();
  const cleanTower = sanitizeInputText(towerOrBlock, 60).trim();
  const cleanUnit = sanitizeInputText(unitNumber, 60).trim();
  const cleanDetails = sanitizeInputText(housingDetails, 120).trim();

  let formattedNeighborhood = cleanNb || 'Por confirmar';
  let detailsParts = [];

  if (locationType === 'unificado' || (!cleanComplex && !cleanTower && !cleanUnit)) {
    if (cleanDetails) detailsParts.push(`Indicación: ${cleanDetails}`);
  } else if (locationType === 'barrio_casa') {
    formattedNeighborhood = `${cleanNb} (Casa en Barrio)`;
    if (cleanUnit) detailsParts.push(`Casa/Piso: ${cleanUnit}`);
    if (cleanDetails) detailsParts.push(`Ref: ${cleanDetails}`);
  } else if (locationType === 'conjunto') {
    formattedNeighborhood = `${cleanNb} (Conjunto: ${cleanComplex})`;
    detailsParts.push(`Conjunto ${cleanComplex}`);
    if (unitSubType === 'casa') {
      if (cleanTower) detailsParts.push(`Manzana/Interior: ${cleanTower}`);
      if (cleanUnit) detailsParts.push(`Casa: ${cleanUnit}`);
    } else {
      if (cleanTower) detailsParts.push(`Torre/Bloque: ${cleanTower}`);
      if (cleanUnit) detailsParts.push(`Apto: ${cleanUnit}`);
    }
    if (cleanDetails) detailsParts.push(`Ref: ${cleanDetails}`);
  } else if (locationType === 'edificio') {
    formattedNeighborhood = `${cleanNb} (Edificio: ${cleanComplex})`;
    detailsParts.push(`Edificio/Unidad ${cleanComplex}`);
    if (cleanTower) detailsParts.push(`Piso/Interior: ${cleanTower}`);
    if (cleanUnit) detailsParts.push(`Apto: ${cleanUnit}`);
    if (cleanDetails) detailsParts.push(`Ref: ${cleanDetails}`);
  } else if (locationType === 'comercial') {
    formattedNeighborhood = `${cleanNb} (${cleanComplex})`;
    detailsParts.push(`Lugar: ${cleanComplex}`);
    if (cleanUnit) detailsParts.push(`Oficina/Local/Hab: ${cleanUnit}`);
    if (cleanDetails) detailsParts.push(`Ref: ${cleanDetails}`);
  }

  const fullAddress = detailsParts.length > 0
    ? `${cleanAddr} | ${detailsParts.join(', ')}`
    : cleanAddr;

  return {
    formattedNeighborhood,
    fullAddress
  };
};

/**
 * Valida los datos del formulario de Checkout según el tipo de pedido (CL-11..CL-15).
 */
export const validateCheckoutForm = ({
  customerName = '',
  customerPhone = '',
  orderType = 'delivery',
  locationType = 'unificado',
  neighborhoodName = '',
  selectedNeighborhood = null,
  address = '',
  complexName = '',
  unitSubType = 'apto',
  towerOrBlock = '',
  unitNumber = '',
  housingDetails = ''
}) => {
  if (!customerName.trim()) {
    return { valid: false, error: 'Por favor, ingresa el nombre de quien recibe el pedido.' };
  }
  if (!customerPhone.trim()) {
    return { valid: false, error: 'Por favor, ingresa tu número de celular.' };
  }
  if (!isValidColombianPhone(customerPhone)) {
    return { valid: false, error: 'El número de celular debe tener exactamente 10 dígitos, solo números.' };
  }
  if (orderType === 'delivery') {
    const effectiveNb = neighborhoodName.trim() || selectedNeighborhood?.name || '';
    if (!effectiveNb) {
      return { valid: false, error: 'Por favor, escribe el nombre de tu barrio o conjunto.' };
    }
    if (!address.trim()) {
      return { valid: false, error: 'Por favor, escribe la dirección exacta o Torre y Apto.' };
    }

    if (locationType === 'conjunto') {
      if (!complexName.trim()) {
        return { valid: false, error: 'Por favor, escribe el nombre del conjunto o condominio.' };
      }
      if (unitSubType === 'apto' && !towerOrBlock.trim()) {
        return { valid: false, error: 'Por favor, indica el número o letra de la Torre / Bloque / Interior.' };
      }
      if (!unitNumber.trim()) {
        return {
          valid: false,
          error: unitSubType === 'casa'
            ? 'Por favor, indica el número de la casa dentro del conjunto.'
            : 'Por favor, indica el número del apartamento.'
        };
      }
    } else if (locationType === 'edificio') {
      if (!complexName.trim()) {
        return { valid: false, error: 'Por favor, escribe el nombre del edificio o unidad residencial.' };
      }
      if (!unitNumber.trim()) {
        return { valid: false, error: 'Por favor, indica el número del apartamento.' };
      }
    } else if (locationType === 'comercial') {
      if (!complexName.trim()) {
        return { valid: false, error: 'Por favor, escribe el nombre del local, empresa, clínica u hotel.' };
      }
      if (!unitNumber.trim() && !housingDetails.trim()) {
        return { valid: false, error: 'Por favor, indica el número de local, oficina, habitación o recepción donde se entrega.' };
      }
    } else if (locationType === 'barrio_casa') {
      if (!housingDetails.trim() && !unitNumber.trim()) {
        return { valid: false, error: 'Por favor, indica un detalle de la casa o referencia (ej: Casa 1 piso, Piso 2, color de fachada).' };
      }
    }
  }
  return { valid: true, error: null };
};


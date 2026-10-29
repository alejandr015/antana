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
 * Valida los datos del formulario de Checkout según el tipo de pedido (CL-11..CL-15).
 */
export const validateCheckoutForm = ({
  customerName = '',
  customerPhone = '',
  orderType = 'delivery',
  selectedNeighborhood = null,
  address = '',
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
    if (!selectedNeighborhood) {
      return { valid: false, error: 'Por favor, selecciona tu barrio de la lista.' };
    }
    if (!address.trim()) {
      return { valid: false, error: 'Por favor, escribe tu dirección exacta.' };
    }
    if (!selectedNeighborhood.isRestricted && !housingDetails.trim()) {
      return { valid: false, error: 'Por favor, indica el conjunto, edificio, torre y apartamento, o escribe "Casa".' };
    }
  }
  return { valid: true, error: null };
};


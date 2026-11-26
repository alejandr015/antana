import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateExtrasTotal,
  calculateItemTotal,
  getCustomizerConfigForCategory,
  sanitizeInputText,
  getRecommendationTitleForCategory,
  parseRecommendations,
  parseSaucePreference,
  buildFinalComment,
  sanitizePhoneInput,
  isValidColombianPhone,
  DELIVERY_QUICK_CHIPS,
  toggleDeliveryQuickChip,
  formatStructuredDeliveryAddress,
  validateCheckoutForm
} from '../../src/utils/orderUtils.js';
import { normalizeText, formatHighlightedHtml, stripHighlightMarkup } from '../../src/utils/stringUtils.js';

describe('1. Pruebas Unitarias – Precios, Filtros y Validaciones (CL-02..CL-15, QC-03, QC-05)', () => {
  it('CL-01b: formatHighlightedHtml y stripHighlightMarkup evitan etiquetas crudas (<span...>) y XSS en el título inicial', () => {
    assert.equal(formatHighlightedHtml('Sabor *Angus* Inigualable'), 'Sabor <span>Angus</span> Inigualable');
    assert.equal(formatHighlightedHtml('ANT<span>ANA</span>'), 'ANT<span>ANA</span>');
    assert.equal(formatHighlightedHtml('<script>alert(1)</script> *Burger*'), '&lt;script&gt;alert(1)&lt;/script&gt; <span>Burger</span>');
    assert.equal(stripHighlightMarkup('Sabor <span>Angus</span> *Inigualable*'), 'Sabor Angus Inigualable');
  });
  it('CL-02: normalizeText normaliza tildes y mayúsculas para búsqueda', () => {
    assert.equal(normalizeText('  Clásica Súper  '), 'clasica super');
    assert.equal(normalizeText(''), '');
  });

  it('CL-04 & CL-05 (QC-05): Bebidas nunca renderiza pestañas de Salsas ni Ingredientes', () => {
    const bebidasCfg = getCustomizerConfigForCategory('Bebidas');
    assert.equal(bebidasCfg.tabs.length, 1);
    assert.equal(bebidasCfg.tabs[0].id, 'opciones_bebidas');
    assert.equal(bebidasCfg.tabs.some(t => t.id === 'salsas' || t.id === 'ingredientes'), false);

    const burgerCfg = getCustomizerConfigForCategory('Hamburguesas');
    assert.deepEqual(burgerCfg.tabs.map(t => t.id), ['ingredientes', 'salsas']);

    const perroCfg = getCustomizerConfigForCategory('Perros Calientes');
    assert.equal(perroCfg.extrasCategories.ingredientes, 'Extras - Ingredientes Perros');
    assert.equal(perroCfg.extrasCategories.salsas, 'Extras - Salsas');

    const salchipapaCfg = getCustomizerConfigForCategory('Salchipapas');
    assert.equal(salchipapaCfg.extrasCategories.ingredientes, 'Extras - Ingredientes Salchipapas');
    assert.equal(salchipapaCfg.extrasCategories.salsas, 'Extras - Salsas');

    const otherCfg = getCustomizerConfigForCategory('Adicionales');
    assert.equal(otherCfg.extrasCategories.ingredientes, 'Extras - Ingredientes');
    assert.equal(otherCfg.extrasCategories.salsas, 'Extras - Salsas');
  });

  it('CL-06 (QC-03): Calcula correctamente (base + extras) * cantidad', () => {
    const extras = [
      { id: '1', name: 'Tocineta', price: 3000, quantity: 1 },
      { id: '2', name: 'Salsa BBQ', price: 0, quantity: 2 } // 2 salsas gratis = $0
    ];
    const { unitPrice, lineTotal } = calculateItemTotal(20000, 3, extras);
    assert.equal(unitPrice, 23000);
    assert.equal(lineTotal, 69000);
  });

  it('QC-03: Cobra $1.000 por cada par adicional de salsas gratuitas después de 2 unidades', () => {
    const extras = [{ id: 's1', name: 'Salsa de Ajo', price: 0, quantity: 3 }];
    assert.equal(calculateExtrasTotal(extras), 1000);
  });

  it('CL-10 & CL-11: Sanitiza y valida celular colombiano de 10 dígitos', () => {
    assert.equal(sanitizePhoneInput('320-444-9987abc99'), '3204449987');
    assert.equal(isValidColombianPhone('3204449987'), true);
    assert.equal(isValidColombianPhone('320444998'), false);
    assert.equal(isValidColombianPhone('320444998a'), false);
  });

  it('CL-12, CL-13, CL-14, CL-15: Valida campos obligatorios en domicilio y recoger en local', () => {
    // Domicilio sin dirección -> falla (CL-13)
    const missingAddress = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'delivery',
      neighborhoodName: 'Conjunto Ipanema',
      address: ''
    });
    assert.equal(missingAddress.valid, false);

    // Domicilio completo (Opción A: solo Barrio/Conjunto + Dirección exacta/Torre y Apto) -> aprueba
    const validDelivery = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'delivery',
      neighborhoodName: 'Conjunto Ipanema',
      address: 'Cra 16 #34a-10, Torre 3 Apto 402'
    });
    assert.equal(validDelivery.valid, true);

    // Recoger en local -> no exige barrio ni dirección (CL-15)
    const validPickup = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'pickup'
    });
    assert.equal(validPickup.valid, true);

    // Ramas de error obligatorias (CL-11, CL-12)
    assert.equal(validateCheckoutForm({ customerName: '', customerPhone: '3204449987' }).valid, false);
    assert.equal(validateCheckoutForm({ customerName: 'Juan', customerPhone: '' }).valid, false);
    assert.equal(validateCheckoutForm({ customerName: 'Juan', customerPhone: '320123' }).valid, false);
    assert.equal(
      validateCheckoutForm({
        customerName: 'Juan',
        customerPhone: '3204449987',
        orderType: 'delivery',
        selectedNeighborhood: null
      }).valid,
      false
    );
    assert.equal(
      validateCheckoutForm({
        customerName: 'Juan',
        customerPhone: '3204449987',
        orderType: 'delivery',
        selectedNeighborhood: { id: '1', name: 'Centro', price: 5000, isRestricted: false },
        address: ''
      }).valid,
      false
    );

    // Opción A: chips rápidos de indicación y formato unificado de dirección
    assert.equal(DELIVERY_QUICK_CHIPS.includes('Dejar en portería'), true);
    const addedOne = toggleDeliveryQuickChip('', 'Dejar en portería');
    assert.equal(addedOne, 'Dejar en portería');
    const addedTwo = toggleDeliveryQuickChip(addedOne, 'Llamar al llegar');
    assert.equal(addedTwo, 'Dejar en portería, Llamar al llegar');
    const removedOne = toggleDeliveryQuickChip(addedTwo, 'Dejar en portería');
    assert.equal(removedOne, 'Llamar al llegar');

    const formattedA = formatStructuredDeliveryAddress({
      locationType: 'unificado',
      neighborhoodName: 'Conjunto Ipanema',
      address: 'Cra 16 #34a-10, Torre 3 Apto 402',
      housingDetails: 'Dejar en portería'
    });
    assert.equal(formattedA.formattedNeighborhood, 'Conjunto Ipanema');
    assert.equal(formattedA.fullAddress, 'Cra 16 #34a-10, Torre 3 Apto 402 | Indicación: Dejar en portería');
  });
});

describe('2. Pruebas de Integración de Componentes, Seguridad de Código y No Funcionales', () => {
  const rootDir = process.cwd();

  it('CL-19: CheckoutModal abre WhatsApp antes de guardar el pedido (evita pedidos fantasma)', () => {
    const checkoutCode = fs.readFileSync(path.join(rootDir, 'src/components/CheckoutModal.jsx'), 'utf8');
    const windowOpenPos = checkoutCode.indexOf("window.open(url, '_blank')");
    const saveOrderPos = checkoutCode.indexOf('await saveOrder(orderData)');
    assert.ok(windowOpenPos > 0 && saveOrderPos > windowOpenPos, 'window.open debe ejecutarse antes de saveOrder');
  });

  it('CL-24 & NF-05: Footer no contiene enlaces rotos href="#" y mantiene el contacto 320 444 9987', () => {
    const footerCode = fs.readFileSync(path.join(rootDir, 'src/components/Footer.jsx'), 'utf8');
    assert.equal(footerCode.includes('href="#"'), false);
    assert.equal(footerCode.includes('320 444 9987'), true);
  });

  it('QC-01: db.js implementa caché en memoria de 5 minutos para menú, barrios y settings', () => {
    const dbCode = fs.readFileSync(path.join(rootDir, 'src/services/db.js'), 'utf8');
    assert.equal(dbCode.includes('CACHE_DURATION = 1000 * 60 * 5'), true);
    assert.equal(dbCode.includes('menuCache'), true);
  });

  it('QC-04 (AD-07): El módulo Admin usa AlertModal y Sonner en lugar de window.confirm', () => {
    const adminMenuCode = fs.readFileSync(path.join(rootDir, 'src/components/admin/AdminMenuTab.jsx'), 'utf8');
    assert.equal(adminMenuCode.includes('window.confirm'), false);
    assert.equal(adminMenuCode.includes('AlertModal'), true);
  });

  it('SE-06: test_orders.js no expone tokens JWT ni llaves hardcodeadas', () => {
    const testOrdersCode = fs.readFileSync(path.join(rootDir, 'test_orders.js'), 'utf8');
    assert.equal(testOrdersCode.includes('eyJhbGci'), false);
    assert.equal(testOrdersCode.includes('process.env.VITE_SUPABASE_ANON_KEY'), true);
  });

  it('ISO/IEC 27002 A.8.28: sanitizeInputText elimina etiquetas HTML/XSS y respeta longitud máxima', () => {
    const dirty = '<script>alert(1)</script>Juan Pérez\u0000';
    assert.equal(sanitizeInputText(dirty, 80), 'scriptalert(1)/scriptJuan Pérez');
    assert.equal(sanitizeInputText('A'.repeat(200), 50).length, 50);
  });

  it('ISO/IEC 27002 A.8.20 / A.8.26: vercel.json incluye cabeceras de seguridad HTTP (HSTS, X-Frame-Options, nosniff)', () => {
    const vercelCfg = JSON.parse(fs.readFileSync(path.join(rootDir, 'vercel.json'), 'utf8'));
    const headerKeys = vercelCfg.headers[0].headers.map(h => h.key);
    assert.ok(headerKeys.includes('X-Content-Type-Options'));
    assert.ok(headerKeys.includes('X-Frame-Options'));
    assert.ok(headerKeys.includes('Strict-Transport-Security'));
  });

  it('ISO/IEC 25010 Fiabilidad: App.jsx integra ErrorBoundary para tolerancia a fallos', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
    assert.equal(appCode.includes('ErrorBoundary'), true);
  });

  it('CL-07: Preferencias "Salsas aparte" y "Sin salsas" se combinan y se recuperan correctamente para Carrito y WhatsApp', () => {
    assert.equal(buildFinalComment('Salsas aparte', ''), 'Salsas aparte');
    assert.equal(buildFinalComment('Sin salsas', 'Sin cebolla'), 'Sin salsas | Sin cebolla');
    assert.deepEqual(parseSaucePreference('Salsas aparte | Sin cebolla'), {
      saucePreference: 'Salsas aparte',
      customComment: 'Sin cebolla'
    });
    assert.deepEqual(parseSaucePreference('Sin salsas'), {
      saucePreference: 'Sin salsas',
      customComment: ''
    });

    // Títulos dinámicos por categoría y múltiples recomendaciones del CRUD Admin
    assert.equal(getRecommendationTitleForCategory('Hamburguesas'), 'Recomendaciones para tu hamburguesa:');
    assert.equal(getRecommendationTitleForCategory('Perros Calientes'), 'Recomendaciones para tu perro caliente:');
    assert.equal(getRecommendationTitleForCategory('Salchipapas'), 'Recomendaciones para tu salchipapa:');
    assert.equal(getRecommendationTitleForCategory('Bebidas'), 'Recomendaciones para tu bebida:');
    assert.equal(getRecommendationTitleForCategory('Postres'), 'Recomendaciones para tu postre:');
    assert.equal(getRecommendationTitleForCategory('Adicionales'), 'Recomendaciones para tu adicional:');
    assert.equal(getRecommendationTitleForCategory('Combos'), 'Recomendaciones para tu combos:');
    assert.equal(getRecommendationTitleForCategory(''), 'Recomendaciones para tu pedido:');

    const customRecs = ['Salsas aparte', 'Sin salsas', 'Papas bien crocantes'];
    const combined = buildFinalComment(['Salsas aparte', 'Papas bien crocantes'], 'Partir a la mitad');
    assert.equal(combined, 'Salsas aparte, Papas bien crocantes | Partir a la mitad');
    assert.deepEqual(parseRecommendations(combined, customRecs), {
      selectedRecommendations: ['Salsas aparte', 'Papas bien crocantes'],
      customComment: 'Partir a la mitad'
    });
    assert.deepEqual(parseRecommendations('Bien asada sin sal', customRecs), {
      selectedRecommendations: [],
      customComment: 'Bien asada sin sal'
    });
    assert.deepEqual(parseRecommendations('', customRecs), {
      selectedRecommendations: [],
      customComment: ''
    });
    assert.equal(buildFinalComment([], ''), '');
  });
});

describe('3. Verificación de Flujos E2E Cliente, Admin y No Funcionales (CL-01..CL-24, AD-01..AD-18, NF-01..NF-05)', () => {
  const rootDir = process.cwd();

  it('AD-01..AD-04: App.jsx protege /admin con ProtectedRoute y Login.jsx persiste bloqueo anti-fuerza bruta', () => {
    const appCode = fs.readFileSync(path.join(rootDir, 'src/App.jsx'), 'utf8');
    const loginCode = fs.readFileSync(path.join(rootDir, 'src/pages/Login.jsx'), 'utf8');
    assert.equal(appCode.includes('ProtectedRoute'), true);
    assert.equal(appCode.includes('<Navigate to="/login" replace />'), true);
    assert.equal(loginCode.includes('antana_login_lockout'), true);
  });

  it('AD-12..AD-15: AdminAnalyticsTab y db.js gestionan estados de pedido (pendiente, confirmado, entregado, cancelado)', () => {
    const analyticsCode = fs.readFileSync(path.join(rootDir, 'src/components/admin/AdminAnalyticsTab.jsx'), 'utf8');
    const dbCode = fs.readFileSync(path.join(rootDir, 'src/services/db.js'), 'utf8');
    for (const status of ['pendiente', 'confirmado', 'entregado', 'cancelado']) {
      assert.equal(analyticsCode.includes(`'${status}'`), true, `Falta estado ${status}`);
    }
    assert.equal(analyticsCode.includes('updateOrderStatus'), true);
    assert.equal(dbCode.includes('export const updateOrderStatus'), true);
  });

  it('NF-02 & CL-22: El build de producción genera Service Worker PWA y chunk separado para Admin', () => {
    assert.equal(fs.existsSync(path.join(rootDir, 'dist/sw.js')), true);
    assert.equal(fs.existsSync(path.join(rootDir, 'dist/manifest.webmanifest')), true);
    const assetFiles = fs.readdirSync(path.join(rootDir, 'dist/assets'));
    assert.equal(assetFiles.some(f => f.startsWith('Admin-') && f.endsWith('.js')), true);
    assert.equal(assetFiles.some(f => f.startsWith('Menu-') && f.endsWith('.js')), true);
    assert.equal(assetFiles.some(f => f.startsWith('Home-') && f.endsWith('.js')), true);
  });

  it('NF-03 & NF-04: Accesibilidad (aria-label, role="alert") y estilos responsivos móviles presentes', () => {
    const navbarCode = fs.readFileSync(path.join(rootDir, 'src/components/Navbar.jsx'), 'utf8');
    const ebCode = fs.readFileSync(path.join(rootDir, 'src/components/ErrorBoundary.jsx'), 'utf8');
    const styleCode = fs.readFileSync(path.join(rootDir, 'src/style.css'), 'utf8');
    const adminCssCode = fs.readFileSync(path.join(rootDir, 'src/admin.css'), 'utf8');
    const cartContextCode = fs.readFileSync(path.join(rootDir, 'src/context/CartContext.jsx'), 'utf8');
    assert.equal(navbarCode.includes('aria-label='), true);
    assert.equal(ebCode.includes('role="alert"'), true);
    assert.equal(styleCode.includes('@media (max-width: 768px)'), true);
    assert.equal(styleCode.includes('@media (max-width: 580px)'), true);
    assert.equal(adminCssCode.includes('grid-template-columns: repeat(2, 1fr)'), true);
    assert.equal(cartContextCode.includes('calculateExtrasTotal'), true);
  });
});

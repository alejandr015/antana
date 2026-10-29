import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateExtrasTotal,
  calculateItemTotal,
  getCustomizerConfigForCategory,
  sanitizePhoneInput,
  isValidColombianPhone,
  validateCheckoutForm
} from '../../src/utils/orderUtils.js';
import { normalizeText } from '../../src/utils/stringUtils.js';

describe('1. Pruebas Unitarias – Precios, Filtros y Validaciones (CL-02..CL-15, QC-03, QC-05)', () => {
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
    // Domicilio sin conjunto/casa -> falla (CL-13)
    const missingHousing = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'delivery',
      selectedNeighborhood: { id: '1', name: 'Centro', price: 5000, isRestricted: false },
      address: 'Cra 5 #10-20',
      housingDetails: ''
    });
    assert.equal(missingHousing.valid, false);

    // Domicilio completo -> aprueba
    const validDelivery = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'delivery',
      selectedNeighborhood: { id: '1', name: 'Centro', price: 5000, isRestricted: false },
      address: 'Cra 5 #10-20',
      housingDetails: 'Casa 1 piso'
    });
    assert.equal(validDelivery.valid, true);

    // Recoger en local -> no exige barrio ni dirección (CL-15)
    const validPickup = validateCheckoutForm({
      customerName: 'Juan Pérez',
      customerPhone: '3204449987',
      orderType: 'pickup'
    });
    assert.equal(validPickup.valid, true);
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
});

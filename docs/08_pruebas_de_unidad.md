# Pruebas de Unidad – Antana
**Fecha:** 16/11/2026 | **Suite:** `tests/unit/orderUtils.test.js` | **Resultado:** **19 / 19 Aprobadas (0 fallos, 219.30 ms)**

## Casos Ejecutados
| ID | Caso | Prueba | Archivo | Estado | Duración |
|---|---|---|---|---|---|
| UT-01 | CL-02 | normalizeText('  Clásica Súper  ') | `stringUtils.js` | **Aprobado** | 0.99 ms |
| UT-02 | CL-04 / CL-05 | getCustomizerConfigForCategory('Bebidas'|'Hamburguesas'|'Perros Calientes'|'Salchipapas'|'Adicionales') | `orderUtils.js` | **Aprobado** | 1.03 ms |
| UT-03 | CL-06 | calculateItemTotal(20000, 3, [Tocineta $3.000, Salsa $0 x2]) | `orderUtils.js` | **Aprobado** | 0.27 ms |
| UT-04 | QC-03 | calculateExtrasTotal([{ price: 0, quantity: 3 }]) | `orderUtils.js` | **Aprobado** | 0.16 ms |
| UT-05 | CL-10 / CL-11 | sanitizePhoneInput & isValidColombianPhone | `orderUtils.js` | **Aprobado** | 0.23 ms |
| UT-06 | CL-12..CL-15 | validateCheckoutForm (Domicilio, Pickup, campos vacíos) | `orderUtils.js` | **Aprobado** | 0.24 ms |
| UT-07 | CL-19 | Orden window.open -> saveOrder en CheckoutModal.jsx | `CheckoutModal.jsx` | **Aprobado** | 4.39 ms |
| UT-08 | CL-24 / NF-05 | Footer sin href='#' y teléfono oficial 320 444 9987 | `Footer.jsx` | **Aprobado** | 2.07 ms |
| UT-09 | QC-01 | CACHE_DURATION = 5 min y menuCache en db.js | `db.js` | **Aprobado** | 0.95 ms |
| UT-10 | QC-04 / AD-07 | Uso de AlertModal y ausencia de window.confirm | `AdminMenuTab.jsx` | **Aprobado** | 1.69 ms |
| UT-11 | SE-06 | Ausencia de tokens eyJhbGci en test_orders.js | `test_orders.js` | **Aprobado** | 1.47 ms |
| UT-12 | ISO A.8.28 | sanitizeInputText('<script>alert(1)</script>...', 80) | `orderUtils.js` | **Aprobado** | 0.39 ms |
| UT-13 | ISO A.8.20/26 | Cabeceras HTTP en vercel.json | `vercel.json` | **Aprobado** | 1.70 ms |
| UT-14 | ISO 25010 | ErrorBoundary en App.jsx | `App.jsx` | **Aprobado** | 0.77 ms |
| UT-15 | CL-07 / CL-25 | buildFinalComment, parseSaucePreference, parseRecommendations, getRecommendationTitleForCategory | `orderUtils.js` | **Aprobado** | 0.70 ms |
| UT-16 | AD-01..AD-04 | ProtectedRoute y bloqueo anti-fuerza bruta antana_login_lockout | `App.jsx / Login.jsx` | **Aprobado** | 1.04 ms |
| UT-17 | AD-12..AD-15 | Estados de pedido y updateOrderStatus | `AdminAnalyticsTab.jsx / db.js` | **Aprobado** | 1.34 ms |
| UT-18 | NF-02 / CL-22 | Artefactos PWA (sw.js, manifest) y chunk separado Admin | `dist/` | **Aprobado** | 2.18 ms |
| UT-19 | NF-03 / NF-04 | aria-label, role='alert' y media queries 768px/580px | `Navbar / ErrorBoundary / style.css` | **Aprobado** | 1.10 ms |

## Salida Real de Consola
```text
$ node --test --experimental-test-coverage tests/unit/orderUtils.test.js
▶ 1. Pruebas Unitarias – Precios, Filtros y Validaciones (CL-02..CL-15, QC-03, QC-05)
  ✔ CL-02: normalizeText normaliza tildes y mayúsculas para búsqueda (0.9854ms)
  ✔ CL-04 & CL-05 (QC-05): Bebidas nunca renderiza pestañas de Salsas ni Ingredientes (1.0277ms)
  ✔ CL-06 (QC-03): Calcula correctamente (base + extras) * cantidad (0.2705ms)
  ✔ QC-03: Cobra $1.000 por cada par adicional de salsas gratuitas después de 2 unidades (0.1578ms)
  ✔ CL-10 & CL-11: Sanitiza y valida celular colombiano de 10 dígitos (0.228ms)
  ✔ CL-12, CL-13, CL-14, CL-15: Valida campos obligatorios en domicilio y recoger en local (0.2387ms)
✔ 1. Pruebas Unitarias – Precios, Filtros y Validaciones (CL-02..CL-15, QC-03, QC-05) (4.189ms)
▶ 2. Pruebas de Integración de Componentes, Seguridad de Código y No Funcionales
  ✔ CL-19: CheckoutModal abre WhatsApp antes de guardar el pedido (evita pedidos fantasma) (4.3934ms)
  ✔ CL-24 & NF-05: Footer no contiene enlaces rotos href="#" y mantiene el contacto 320 444 9987 (2.0665ms)
  ✔ QC-01: db.js implementa caché en memoria de 5 minutos para menú, barrios y settings (0.9495ms)
  ✔ QC-04 (AD-07): El módulo Admin usa AlertModal y Sonner en lugar de window.confirm (1.6919ms)
  ✔ SE-06: test_orders.js no expone tokens JWT ni llaves hardcodeadas (1.4738ms)
  ✔ ISO/IEC 27002 A.8.28: sanitizeInputText elimina etiquetas HTML/XSS y respeta longitud máxima (0.3897ms)
  ✔ ISO/IEC 27002 A.8.20 / A.8.26: vercel.json incluye cabeceras de seguridad HTTP (HSTS, X-Frame-Options, nosniff) (1.7007ms)
  ✔ ISO/IEC 25010 Fiabilidad: App.jsx integra ErrorBoundary para tolerancia a fallos (0.7702ms)
  ✔ CL-07: Preferencias "Salsas aparte" y "Sin salsas" se combinan y se recuperan correctamente para Carrito y WhatsApp (0.7005ms)
✔ 2. Pruebas de Integración de Componentes, Seguridad de Código y No Funcionales (14.6625ms)
▶ 3. Verificación de Flujos E2E Cliente, Admin y No Funcionales (CL-01..CL-24, AD-01..AD-18, NF-01..NF-05)
  ✔ AD-01..AD-04: App.jsx protege /admin con ProtectedRoute y Login.jsx persiste bloqueo anti-fuerza bruta (1.0432ms)
  ✔ AD-12..AD-15: AdminAnalyticsTab y db.js gestionan estados de pedido (pendiente, confirmado, entregado, cancelado) (1.3382ms)
  ✔ NF-02 & CL-22: El build de producción genera Service Worker PWA y chunk separado para Admin (2.1834ms)
  ✔ NF-03 & NF-04: Accesibilidad (aria-label, role="alert") y estilos responsivos móviles presentes (1.1047ms)
✔ 3. Verificación de Flujos E2E Cliente, Admin y No Funcionales (CL-01..CL-24, AD-01..AD-18, NF-01..NF-05) (5.9327ms)
ℹ tests 19 | suites 3 | pass 19 | fail 0 | cancelled 0 | skipped 0 | duration_ms 219.2989
-----------------------------------------------------------------
file             | line % | branch % | funcs % | uncovered lines
src/utils/orderUtils.js  | 100.00 | 94.83 | 100.00 | (ninguna)
src/utils/stringUtils.js | 100.00 | 100.00 | 100.00 | (ninguna)
all files                | 100.00 | 95.08 | 100.00 | (ninguna)
-----------------------------------------------------------------
```

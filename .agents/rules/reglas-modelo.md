---
trigger: always_on
description: Reglas obligatorias del modelo para el proyecto Antana (pruebas automáticas, calidad, seguridad y despliegue)
---

# Reglas del Modelo – Proyecto Antana

Estas reglas son **obligatorias y predeterminadas (`always_on`)** para cualquier agente o modelo que trabaje en este repositorio.

## 1. Verificación, Pruebas y Build Automático en Cada Cambio
- **Ejecución interna obligatoria (`npm test`):** Cada vez que modifiques cualquier archivo en `src/`, `tests/`, `vite.config.js` o `vercel.json`, **DEBES ejecutar automáticamente `npm test`** por interno antes de responder al usuario o hacer commit.
- **Verificación de Build antes de Producción:** Antes de desplegar a Vercel (`npx vercel --prod --yes`), verifica que el build de Vite compile sin errores ni referencias a recursos inexistentes y que `/admin` se mantenga separado mediante `React.lazy`.
- **Cambios en Base de Datos / Supabase:** Si modificas `src/services/db.js`, `src/context/AuthContext.jsx` o `supabase/`, ejecuta también `npm run test:security` para comprobar que las políticas RLS (`SE-01` a `SE-05`) sigan bloqueando accesos no autorizados.
- **Cero regresiones:** Si alguna prueba falla tras un cambio, corrige la causa de inmediato y vuelve a ejecutar `npm test` hasta que el 100% de las pruebas aprueben (`fail 0`). Nunca entregues ni hagas commit de código con pruebas fallidas.
- **Nuevas funcionalidades:** Si agregas o cambias una regla de negocio (precios, validaciones de checkout, filtros de categorías, recomendaciones), actualiza o añade la prueba unitaria correspondiente en `tests/unit/orderUtils.test.js`.

## 2. Reglas de Negocio Inquebrantables (Antana)
1. **Consistencia de Precios (`QC-03`):**
   - Usa siempre `calculateExtrasTotal` y `calculateItemTotal` de `src/utils/orderUtils.js` (tanto en el personalizador como en `CartContext`, `CartSidebar` y `CheckoutModal`).
   - Las primeras 2 unidades de una salsa gratuita (`price === 0`) son gratis; a partir de la 3.ª unidad se cobran **$1.000 COP por cada par adicional** (`Math.ceil((qty - 2) / 2) * 1000`).
2. **Filtros de Personalización (`QC-05`):**
   - La categoría `Bebidas` **NUNCA** debe mostrar pestañas de `+ Salsas` ni `+ Ingredientes` (solo `+ Opciones` / `Extras - Opciones Bebidas`).
3. **Checkout y Anti-Pedidos Fantasma (`CL-10..CL-19`):**
   - Teléfono celular colombiano obligatorio de exactamente **10 dígitos numéricos**.
   - El pedido **solo se guarda en Supabase (`saveOrder`) después** de abrir WhatsApp y que el cliente confirme en el modal que envió el mensaje.
   - El único número oficial de WhatsApp y contacto es **320 444 9987** (`+573204449987`).
4. **Diseño, UI y Experiencia Móvil Nativa (`NF-04`):**
   - Tanto el menú principal de clientes (`.burger-grid` en `src/style.css`) como la gestión de menú en Admin (`.admin-products-grid` en `src/admin.css`) deben mantener la distribución de **2 columnas en móvil** (`grid-template-columns: repeat(2, 1fr)`).
   - Todo modal orientado al cliente debe integrar `useHardwareBack` (`src/hooks/useHardwareBack.js`) para que el botón "Atrás" del celular cierre el modal en vez de salir de la app, y los formularios críticos deben usar `useSessionState` (`src/hooks/useSessionState.js`).
   - No usar `window.confirm` ni `window.alert`; usar siempre `AlertModal.jsx` para confirmaciones y `toast` (`sonner`) para notificaciones.
   - No dejar `console.log` de depuración ni referencias a imágenes inexistentes en código de producción.

## 3. Base de Datos, Caché, Imágenes y Seguridad
- **Compatibilidad con Supabase y Anti-Pérdida de Datos:**
  - Prohibido ejecutar `DROP TABLE`, `TRUNCATE` o eliminar columnas en producción sin consentimiento explícito del usuario.
  - Si se agrega un campo nuevo a `orders` o `settings` en `src/services/db.js`, incluir siempre un *fallback* seguro (como el manejo del código PostgreSQL `42703` en `saveOrder`) para que ningún pedido real falle si una migración SQL aún no se ha aplicado.
- **Sincronización de Caché (`QC-01`):**
  - Toda mutación en `src/services/db.js` sobre productos o ajustes debe invalidar/actualizar la caché en memoria de 5 minutos (`menuCache = null` / `settingsCache`) y despachar el evento `settingsUpdated`.
- **Optimización de Imágenes:**
  - Toda imagen de producto subida desde Admin debe pasar por `resizeAndCropImage` (`src/utils/imageOptimizer.js`, recorte cuadrado 1:1 en `WebP`) y renderizarse con `loading="lazy" decoding="async"`.
- **Sanitización y Variables Sensibles (`ISO/IEC 27002 A.8.28` / `SE-06`):**
  - Todo campo de texto libre del usuario debe pasar por `sanitizeInputText`.
  - Nunca hardcodear llaves JWT ni credenciales de Supabase en el código; usar siempre variables de entorno (`.env`).
- **Rama principal y despliegue:** Todos los commits validados deben integrarse en la rama `main`, subirse a `origin/main` en GitHub y desplegarse a producción en Vercel (`npx vercel --prod --yes`) cuando el usuario lo solicite.

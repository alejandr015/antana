# Reglas del Modelo – Proyecto Antana (`AGENTS.md`)

Este archivo define el comportamiento predeterminado y obligatorio del agente en el repositorio **Antana**.
Las reglas detalladas también se encuentran en `.agents/rules/reglas-modelo.md` y el hook automático de verificación en `.agents/hooks.json`.

## Regla Principal: Auto-Test Interno en Cada Cambio
1. **Siempre que edites código** (`src/`, `tests/`, configuración), **ejecuta automáticamente `npm test`** por interno en el mismo flujo antes de finalizar tu respuesta.
2. **Antes de desplegar a Vercel** (`npx vercel --prod --yes`), verifica que el build de Vite compile sin errores ni archivos faltantes y que `/admin` siga separado con `React.lazy`.
3. **Si modificas `src/services/db.js` o `supabase/`**, ejecuta además `npm run test:security`.
4. **Nunca hagas commit ni despliegues a Vercel** si alguna prueba falla (`fail > 0`). Si un cambio rompe una prueba, corrígelo automáticamente antes de terminar.
5. **Mantén las reglas críticas de Antana:**
   - Cálculo unificado de extras y salsas gratis (`calculateExtrasTotal` en `src/utils/orderUtils.js`: primeras 2 salsas gratis, luego +$1.000 por cada par adicional).
   - `Bebidas` nunca renderiza pestañas de Salsas ni Ingredientes.
   - Cuadrícula de **2 columnas en móvil** tanto en el menú de compras (`.burger-grid`) como en Gestión de Menú del Admin (`.admin-products-grid`).
   - Experiencia móvil nativa: modales del cliente con `useHardwareBack` y formularios persistentes con `useSessionState`.
   - Compatibilidad y caché en `db.js`: fallback seguro en `saveOrder` ante columnas nuevas, invalidación de caché (`menuCache = null` / `settingsCache` + evento `settingsUpdated`) y prohibición de `DROP`/`TRUNCATE` sin permiso explícito.
   - Imágenes optimizadas a `WebP` cuadrado (`resizeAndCropImage`) con `loading="lazy" decoding="async"`.
   - Confirmación anti-pedidos fantasma antes de `saveOrder` y número único de contacto `320 444 9987`.
   - Cero `window.confirm` (usar `AlertModal.jsx` y `sonner`), cero credenciales hardcodeadas y cero `console.log` de depuración.

# Pendientes de Antana

Última actualización: 2026-10-29

## Ya hecho
- Celular del checkout: solo números, máximo 10 dígitos, validación de 10 dígitos al enviar (`CheckoutModal.jsx`).
- Mensaje de "Operación Normal" ahora se muestra en el checkout antes de enviar (el tiempo se informa por WhatsApp tras el pago). Texto por defecto en `db.js`, editable en Admin → Mensajes.
- Etiqueta `{tiempo_espera}` cambiada de "Tiempo estimado" a "Aviso".
- Verificado: dirección exacta obligatoria con `*`, sin tarjeta como método de pago, y barra de inicio con horario, ubicación, redes y pedidos.
- Verificado: en el código solo existe el número 320 444 9987.
- **Conjunto / edificio / casa / torre / apto obligatorio (`*`)** en domicilios (`CheckoutModal.jsx`).
- **Guardar el pedido solo después de abrir WhatsApp y confirmar envío** para evitar pedidos fantasma (`executeWhatsAppOrder` en `CheckoutModal.jsx`) + fallback seguro en `saveOrder` (`db.js`) si faltan columnas en BD.
- **Link de Facebook del Footer** corregido: se oculta si no hay `facebookUrl` real configurada, eliminando el enlace roto `href="#"` (`Footer.jsx`).
- **`RESUMEN_PROYECTO.md` actualizado:** versiones corregidas a React 18.3 y React Router DOM v6.
- **Seguridad en `test_orders.js`:** credenciales hardcodeadas eliminadas; ahora usa `process.env.VITE_SUPABASE_URL` y `process.env.VITE_SUPABASE_ANON_KEY`.
- **Estado del pedido (`pendiente / confirmado / entregado / cancelado`):** agregado soporte en `db.js` (`updateOrderStatus`) y tabla de gestión de estados en `AdminAnalyticsTab.jsx`.
- **Migración SQL, Modelo Relacional (3FN) y Políticas RLS en Supabase:** 100% ejecutado y verificado en vivo (`SE-01` a `SE-06` todos en `true` / bloqueados para intrusos, y tablas `categories`, `extra_groups`, `extras`, `category_extra_groups`, `order_items`, `order_item_extras` activas).
- **Suite de pruebas automatizadas configurada:**
  - [x] Vitest / Node Test Runner + pruebas unitarias (`tests/unit/orderUtils.test.js` — 11/11 aprobadas)
  - [x] Playwright + pruebas E2E cliente y admin (`playwright.config.js`, `tests/e2e/client.spec.js`, `tests/e2e/admin.spec.js`)
  - [x] Script de verificación de seguridad RLS y esquema (`tests/security/rls_security_check.js` — 100% aprobado)

## Pendiente (próximos pasos)
1. **Pasarela de pagos** (Wompi recomendado: PSE, Nequi y tarjeta). Necesita backend (Edge Function de Supabase) para firmar transacciones y recibir el webhook.
2. **Despliegue a Vercel:** recordar usar `npx vercel --prod --yes` (o conectar el repo con `npx vercel git connect`).

## A revisar fuera del código
- El número viejo que no funcionaba puede seguir en Instagram, en la ficha de Google Maps o en una versión anterior desplegada en Vercel.
- Si aún se ve el número viejo en la app, probar Ctrl+F5 o reinstalar la PWA (caché).

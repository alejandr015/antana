# Informe de Errores de Software – Antana
**Fecha:** 16/11/2026 | **Elaborado por:** Joseph Gómez y César Gómez | **Total Hallazgos:** 6 (6 Cerrados / 0 Abiertos)

## Resumen por Severidad y Tipo
- **Crítico:** 1 (`INC-001` – Pedidos fantasma antes de WhatsApp)
- **Alto:** 3 (`INC-002` credenciales en `test_orders.js`, `INC-005` bloqueo anti-fuerza bruta evadible con F5, `INC-006` resolución `react-is` en build Vite 8)
- **Medio:** 2 (`INC-003` enlace roto `href="#"` en Footer, `INC-004` conjunto/apto y celular de 10 dígitos)

## Detalle de Incidencias
### INC-001 – Registro de pedidos 'fantasma' antes de confirmar envío por WhatsApp
- **Área / CP:** Checkout / Pedidos (src/components/CheckoutModal.jsx) (`CL-19`)
- **Severidad / Prioridad:** Crítico / Crítico | **Estado:** **Cerrado (QA)**
- **Causa:** Al presionar enviar pedido, la aplicación ejecutaba saveOrder() en Supabase antes de abrir la ventana de WhatsApp. Si el usuario cancelaba el envío en WhatsApp o cerraba la pestaña, el pedido quedaba registrado en la base de datos y estadísticas como válido.
- **Solución:** Corregido en executeWhatsAppOrder(): primero se ejecuta window.open(url, '_blank') y se solicita confirmación explícita al cliente antes de invocar await saveOrder(orderData). Validado con prueba de integración automatizada CL-19.

### INC-002 – Credenciales/llaves de Supabase hardcodeadas en script de prueba test_orders.js
- **Área / CP:** Seguridad / Scripts de prueba (test_orders.js) (`SE-06`)
- **Severidad / Prioridad:** Alto / Alto | **Estado:** **Cerrado (QA)**
- **Causa:** El archivo test_orders.js contenía URL y token JWT (anon key) escritos directamente en el código fuente versionado, incumpliendo prácticas ISO/IEC 27002 de gestión segura de secretos.
- **Solución:** Se eliminaron las credenciales hardcodeadas y se migró a lectura desde process.env.VITE_SUPABASE_URL y process.env.VITE_SUPABASE_ANON_KEY. Verificado mediante aserción automatizada SE-06 (sin tokens eyJhbGci).

### INC-003 – Enlace roto href='#' en botón de Facebook dentro del pie de página (Footer)
- **Área / CP:** Interfaz Cliente (src/components/Footer.jsx) (`CL-24`)
- **Severidad / Prioridad:** Medio / Bajo | **Estado:** **Cerrado (QA)**
- **Causa:** Cuando no estaba configurada la URL de Facebook en la tabla settings, el componente Footer.jsx renderizaba un enlace con href='#', causando desplazamiento inesperado al inicio de la página al hacer clic.
- **Solución:** Se condicionó el renderizado del enlace de Facebook a la existencia real de facebookUrl, eliminando todo href='#'. Confirmado por prueba automatizada CL-24 & NF-05.

### INC-004 – Falta de obligatoriedad en Conjunto/Apto para domicilios y validación estricta de celular
- **Área / CP:** Validación de Formularios (src/components/CheckoutModal.jsx) (`CL-10 / CL-13`)
- **Severidad / Prioridad:** Medio / Alto | **Estado:** **Cerrado (QA)**
- **Causa:** En pedidos a domicilio los usuarios podían enviar el formulario omitiendo torre/apto/casa y el campo de celular permitía formatos inconsistentes distintos a 10 dígitos numéricos colombianos.
- **Solución:** Se implementaron sanitizePhoneInput(), isValidColombianPhone() y obligatoriedad (*) del campo conjunto/edificio/casa en validateCheckoutForm() para domicilios no restringidos. Verificado con 100% de éxito en pruebas unitarias.

### INC-005 – Temporizador de bloqueo anti-fuerza bruta en Login podía evadirse recargando (F5)
- **Área / CP:** Autenticación Admin (src/pages/Login.jsx) (`AD-02`)
- **Severidad / Prioridad:** Alto / Alto | **Estado:** **Cerrado (QA)**
- **Causa:** El conteo de intentos fallidos residía únicamente en memoria de estado React, permitiendo que un atacante reiniciara los 5 intentos simplemente recargando la pestaña del navegador.
- **Solución:** Se persistió la marca temporal de bloqueo en localStorage ('antana_login_lockout') cumpliendo ISO/IEC 27002 A.8.5, junto con ErrorBoundary y cabeceras HTTP en vercel.json. Verificado en test AD-01..AD-04.

### INC-006 – Error de compilación Rolldown/Vite 8 al resolver dependencia 'react-is' desde Recharts
- **Área / CP:** Build de Producción / Bundler (vite.config.js) (`NF-02`)
- **Severidad / Prioridad:** Alto / Crítico | **Estado:** **Cerrado (QA)**
- **Causa:** Al ejecutar npm run build con Vite 8.0.10 (Rolldown), la librería recharts importaba 'isFragment' de 'react-is' y fallaba el empaquetado de producción por no estar resuelto explícitamente en el grafo ESM.
- **Solución:** Se creó el shim ESM src/utils/reactIsShim.js exportando Fragment, typeOf, isFragment, isElement e isValidElementType, y se configuró el alias en vite.config.js. Re-ejecutado npm run build con éxito total en 2.42 s.
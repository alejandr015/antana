# Estándares de Calidad y Seguridad ISO Aplicados en Antana

Este documento detalla cómo el código fuente, la arquitectura y la base de datos de **Antana** implementan las principales normas **ISO/IEC** de seguridad de la información, calidad de software, privacidad y pruebas.

---

## 1. ISO/IEC 27001 e ISO/IEC 27002:2022 (Seguridad de la Información y Controles de Ciberseguridad)

| Control ISO 27002 | Nombre del Control | Implementación en el Código de Antana | Archivo(s) de Evidencia |
|---|---|---|---|
| **A.8.2 / A.8.3** | Gestión de privilegios y restricción de acceso a la información | Políticas **Row Level Security (RLS)** activas en las 11 tablas de Supabase y en el bucket `menu-images`. Validación mediante función `public.is_admin()` (`SECURITY DEFINER`) contra la lista blanca `admin_users`. | [`20261029_hotfix_and_normalized_schema.sql`](file:///c:/Users/Joseph/Desktop/antana/supabase/migrations/20261029_hotfix_and_normalized_schema.sql), [`AuthContext.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/context/AuthContext.jsx) |
| **A.8.5** | Autenticación segura | Bloqueo temporal anti-fuerza bruta tras 5 intentos fallidos **persistido en `localStorage`** (`antana_login_lockout`) para que no se pueda evadir recargando la página (`F5`). Mensajes genéricos de error para evitar enumeración de cuentas y medidor de fortaleza de contraseñas (`PasswordStrengthMeter`). | [`Login.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/pages/Login.jsx) |
| **A.8.20 / A.8.26** | Seguridad en redes y requisitos de seguridad en aplicaciones web | Cabeceras de seguridad HTTP en producción: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN` (anti-Clickjacking), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y `Strict-Transport-Security` (HSTS / HTTPS forzado). | [`vercel.json`](file:///c:/Users/Joseph/Desktop/antana/vercel.json) |
| **A.8.28** | Codificación segura (Prevención de XSS e Inyección) | Función `sanitizeInputText()` que elimina etiquetas `<script>`/`< >`, caracteres de control invisibles y aplica límites de longitud (`maxLength`) en formularios. Escape de HTML en `renderWithHighlights()`. Variables de entorno aisladas en `.env`. | [`orderUtils.js`](file:///c:/Users/Joseph/Desktop/antana/src/utils/orderUtils.js), [`CheckoutModal.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/CheckoutModal.jsx), [`Home.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/pages/Home.jsx) |

---

## 2. ISO/IEC 25010 (Calidad de Producto de Software)

| Característica ISO 25010 | Subcaracterística | Implementación en el Código de Antana | Archivo(s) de Evidencia |
|---|---|---|---|
| **Seguridad** | Confidencialidad e Integridad | Los pedidos (`orders`) no son legibles por usuarios anónimos (`0 filas expuestas`). `CartContext` sincroniza los precios reales desde Supabase al cargar el carrito para impedir manipulación de precios en el cliente. | [`CartContext.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/context/CartContext.jsx), [`rls_security_check.js`](file:///c:/Users/Joseph/Desktop/antana/tests/security/rls_security_check.js) |
| **Fiabilidad** | Tolerancia a fallos y Capacidad de recuperación | Componente `ErrorBoundary` que captura fallos de renderizado o cortes de red durante la carga de módulos (`React.lazy`), evitando pantallas en blanco y conservando el carrito. Monitor de red en vivo (`NetworkStatus`). | [`ErrorBoundary.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/ErrorBoundary.jsx), [`App.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/App.jsx) |
| **Eficiencia de Desempeño** | Comportamiento temporal y utilización de recursos | Caché en memoria de 5 minutos (`CACHE_DURATION`) en `db.js` (`QC-01`), *Code Splitting* por ruta (`React.lazy` + `Suspense`), conversión automática de imágenes a `WebP` (máx. 500×500 px) y `loading="lazy"`. | [`db.js`](file:///c:/Users/Joseph/Desktop/antana/src/services/db.js), [`App.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/App.jsx), [`vite.config.js`](file:///c:/Users/Joseph/Desktop/antana/vite.config.js) |
| **Mantenibilidad** | Modularidad y Capacidad de ser probado | Separación de lógica de negocio pura en `src/utils/orderUtils.js` y `src/utils/stringUtils.js`, permitiendo pruebas unitarias determinísticas sin acoplamiento a la interfaz. | [`orderUtils.js`](file:///c:/Users/Joseph/Desktop/antana/src/utils/orderUtils.js), [`orderUtils.test.js`](file:///c:/Users/Joseph/Desktop/antana/tests/unit/orderUtils.test.js) |

---

## 3. ISO/IEC 27701 (Privacidad de la Información — Ley 1581 de 2012 Habeas Data)
- **Minimización de datos:** Solo se solicitan los datos estrictamente necesarios para la entrega del pedido (Nombre, Celular de 10 dígitos y Dirección en caso de domicilio).
- **Consentimiento y control del usuario:** En [`CheckoutModal.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/CheckoutModal.jsx), el usuario decide explícitamente mediante casilla de verificación si desea recordar sus datos localmente en su dispositivo (`antana_saved_profile`), acompañado del aviso de finalidad del tratamiento de datos personales.

---

## 4. ISO/IEC 40500 (W3C WCAG 2.1 – Accesibilidad Web)
- Atributos `aria-label` descriptivos en botones de acción representados por iconos ([`Navbar.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/Navbar.jsx), [`CheckoutModal.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/CheckoutModal.jsx)) y `role="alert"` en pantallas de recuperación de fallos ([`ErrorBoundary.jsx`](file:///c:/Users/Joseph/Desktop/antana/src/components/ErrorBoundary.jsx)).

---

## 5. ISO/IEC/IEEE 29119 (Pruebas de Software)
- Plan maestro de pruebas ([`04_plan_de_pruebas_formal.md`](file:///c:/Users/Joseph/Desktop/antana/docs/04_plan_de_pruebas_formal.md)), catálogo de casos de prueba ([`03_plan_de_pruebas.md`](file:///c:/Users/Joseph/Desktop/antana/docs/03_plan_de_pruebas.md)), pruebas unitarias automatizadas (`npm test`) y auditoría automatizada de seguridad RLS (`npm run test:security`).


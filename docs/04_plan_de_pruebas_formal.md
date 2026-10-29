# Plan de Pruebas de Software
## Antana – Aplicación web (PWA) de pedidos de comida rápida

**Fecha:** 23/10/2026

---

## Historial de Versiones
| Fecha | Versión | Autor | Organización | Descripción |
|---|---|---|---|---|
| 23/10/2026 | 1.0 | [Por completar] | [Por completar] | Versión inicial del plan de pruebas |

## Información del Proyecto
| Campo | Valor |
|---|---|
| Empresa / Organización | [Por completar] |
| Proyecto | Antana – App de cliente y Panel de Administración |
| Fecha de preparación | 23/10/2026 |
| Cliente | Antana (Neiva, Huila) |
| Patrocinador principal | [Por completar] |
| Gerente / Líder de Proyecto | [Por completar] |
| Gerente / Líder de Pruebas de Software | [Por completar] |

## Aprobaciones
| Nombre y Apellido | Cargo | Departamento u Organización | Fecha | Firma |
|---|---|---|---|---|
| [Por completar] | | | | |
| [Por completar] | | | | |

---

## 1. Resumen Ejecutivo
Este documento es un **plan de pruebas maestro** para el proyecto Antana, una PWA de comercio electrónico para la venta de hamburguesas, salchipapas, perros calientes y bebidas. El sistema tiene dos módulos:

1. **App de cliente:** menú, personalización de productos, carrito y checkout con pedido por WhatsApp.
2. **Panel de administración:** gestión de menú, barrios, ajustes operativos, límites, estadísticas, seguridad y perfil.

**Propósito:** definir cómo se verificará que el sistema cumple los requisitos de negocio y los criterios de aceptación QC-01 a QC-05 (`RESUMEN_PROYECTO.md`).

**Estado actual:** hasta hoy solo se han hecho **pruebas manuales** (ver sección 5.2). No hay pruebas automatizadas. Este plan formaliza lo ya hecho y define lo que falta.

**Restricciones:**
- Equipo reducido y sin presupuesto específico para QA.
- Un único entorno de datos (Supabase); se recomienda crear uno de pruebas.
- La pasarela de pagos (Wompi) aún no está implementada.

## 2. Alcance de las Pruebas

### 2.1 Elementos de Pruebas
| Área | Componentes |
|---|---|
| Navegación y marca | `Navbar`, `Home`, `Footer`, `LoadingScreen` |
| Catálogo | `Menu`, búsqueda, categorías, estado AGOTADO |
| Personalización | `ProductCustomizerModal` (salsas, ingredientes, michelados, notas) |
| Carrito | `CartSidebar`, `CartContext` |
| Checkout | `CheckoutModal` (domicilio/recoger, validaciones, WhatsApp, `saveOrder`) |
| Acceso admin | `Login`, `Admin` |
| Administración | `AdminMenuTab`, `AdminProductModal`, `ImageCropperModal`, `AdminNeighborhoodsTab`, `AdminSettingsTab`, `AdminLimitsTab`, `AdminAnalyticsTab`, `AdminSecurityTab`, `AdminProfileTab` |
| Datos y servicios | `services/db.js`, Supabase (BD, Auth, Storage, RLS) |
| PWA | Instalación y caché offline (`vite-plugin-pwa`) |

### 2.2 Nuevas Funcionalidades a Probar
Desde el punto de vista del usuario:
- Selector **Domicilio / Recoger en el local** en el checkout.
- Celular de 10 dígitos (solo números).
- Mensaje de "Operación Normal" visible antes de enviar el pedido.
- Dirección exacta obligatoria.
- Conjunto / edificio / casa / apto obligatorio en domicilios (`CheckoutModal.jsx`).
- Barrios restringidos con punto de encuentro y alerta personalizada.
- Límites diarios por categoría.
- Barra de inicio con horario, ubicación, redes sociales y pedidos.
- Estadísticas y gestión de estado de pedidos (`pendiente`, `confirmado`, `entregado`, `cancelado`) en el panel admin (`AdminAnalyticsTab.jsx`).
- Autorización de correos admin y mejoras de seguridad del login.
- Galería de logos y personalización de marca.
- Guardar el pedido solo después de abrir WhatsApp y confirmar el envío (`executeWhatsAppOrder`).

### 2.3 Pruebas de Regresión
Funcionalidades que no cambian directamente pero pueden verse afectadas:
- Ver el menú, buscar y filtrar por categoría.
- Agregar al carrito con extras y notas, y cálculo de precios por cantidad (QC-03).
- Animación de agregar al carrito.
- Generación del mensaje de WhatsApp con el desglose completo.
- CRUD de productos y barrios, y toggle de stock.
- Subida y recorte de imágenes.
- Estado del local (Normal / Demora / Cerrado).
- Caché del menú (QC-01) y filtros de extras por categoría (QC-05).

### 2.4 Funcionalidades a No Probar
| Funcionalidad | Razón | Riesgo asumido |
|---|---|---|
| Pasarela de pagos (Wompi: PSE, Nequi, tarjeta) | No está implementada; se hará al final | Ninguno por ahora; deberá planificarse una fase propia |
| Infraestructura de Supabase y Vercel | Es responsabilidad del proveedor | Caídas del servicio externo |
| App de WhatsApp en sí | Es de terceros; solo se prueba la generación del enlace | Cambios de formato del enlace `wa.me` |
| Pruebas de carga masiva | El volumen esperado es bajo (negocio local) | Lentitud en picos no previstos |
| Navegadores antiguos (IE, versiones muy viejas) | Fuera del público objetivo | Fallos de visualización en esos navegadores |

## 3. Enfoque de Pruebas (Estrategia)

| Tipo | Descripción | Herramienta | Estado |
|---|---|---|---|
| Funcional manual | Ejecución de casos en el navegador (cliente y admin) | Navegador | **Realizado parcialmente** |
| Aceptación | Validar QC-01 a QC-05 | Manual | Parcial |
| Integración | Frontend ↔ Supabase (menú, pedidos, settings) | Script `test_orders.js` / Vitest | Parcial |
| Seguridad | RLS, login, acceso no autorizado | Manual + anon key | Parcial (login) |
| Compatibilidad / responsive | Android, iPhone, escritorio | Dispositivos reales / DevTools | Parcial |
| Usabilidad | Flujo de pedido completo | Manual | Realizado informalmente |
| Rendimiento | LCP, tamaño del bundle | Lighthouse | Pendiente |
| Accesibilidad | Contraste, foco, etiquetas | Lighthouse / axe | Pendiente |
| Unitarias | Precios, filtros, validaciones | Vitest | Pendiente |
| E2E automatizadas | Flujos completos cliente y admin | Playwright | Pendiente |
| Regresión | Repetir casos críticos en cada versión | Manual → Playwright | Pendiente |

**Configuraciones a probar:** Chrome (Windows/Android), Safari (iOS); pantallas de 360px, 768px y 1440px; PWA instalada y en navegador.
**Datos de prueba:** productos de cada categoría (uno agotado), barrios con y sin restricción, y los tres estados del local.

## 4. Criterios de Aceptación o Rechazo

### 4.1 Criterios de Aceptación
- 100% de los casos de prioridad P1 aprobados.
- Mínimo 90% de los casos P2 aprobados.
- QC-01 a QC-05 cumplidos.
- Sin defectos abiertos de severidad crítica o alta.
- Pedido por WhatsApp correcto (producto, extras, notas, envío y total).
- `npm run build` sin errores.
- Las escrituras sin sesión devuelven 401/403 (RLS).

### 4.2 Criterios de Suspensión
- No se puede completar un pedido (bloqueo en el checkout).
- No se puede iniciar sesión en el admin.
- Supabase no está disponible o el build no compila.
- Más de 20% de los casos P1 fallidos en un ciclo.

### 4.3 Criterios de Reanudación
- El defecto bloqueante está corregido y verificado.
- El entorno está disponible de nuevo.
- Se repiten los casos que fallaron y los de humo (smoke) del flujo de pedido.

## 5. Entregables
- Este Plan de Pruebas.
- Casos de prueba (`docs/03_plan_de_pruebas.md`: CL, AD, SE, NF).
- Registro de resultados de ejecución.
- Reporte de defectos (en ClickUp), con pasos y evidencia.
- Capturas o videos de evidencia.
- Reportes de Lighthouse.
- Informe final de pruebas.

### 5.1 Resumen de pruebas ya realizadas
> Basado en el repositorio y lo confirmado por el equipo. Todas son **manuales**.

| Tipo | Qué se probó | Cómo | Evidencia |
|---|---|---|---|
| Funcional manual – checkout | Celular solo números y 10 dígitos; dirección obligatoria; sin tarjeta; mensaje de Operación Normal | Uso directo en el navegador | `PENDIENTES.md` ("Ya hecho") |
| Pedidos por WhatsApp | Pedidos reales o de prueba con el desglose generado | Envío real a WhatsApp | Pedidos en la tabla `orders` |
| Móvil | La app en celular (Android/iPhone) | Dispositivos reales | Commits "optimizaciones móviles", "mejoras en checkout" |
| Panel admin | Crear, editar y eliminar productos, barrios y ajustes | Uso directo del panel | Commits del panel admin |
| Login y seguridad | Acceso admin y autorización de correos | Pruebas manuales de login | Commit "seguridad login" |
| Verificación de contenido | Solo existe el número 320 444 9987 en el código | Búsqueda en el código | `PENDIENTES.md` |
| Unitarias y de componentes | Ejecución automatizada de precios, filtros, validaciones y reglas QC-01..QC-05 | `npm test` (`tests/unit/orderUtils.test.js`) | **11 / 11 aprobadas (0 fallos)** |
| Seguridad RLS | Verificación automatizada con `anon key` (SE-01..SE-06) | `npm run test:security` (`tests/security/rls_security_check.js`) | `SE-01`, `SE-02 (admin_users)` y `SE-06` aprobados; `SE-02 (neighborhoods)`, `SE-03` y `SE-05` listos en script SQL |
| Build, Code-Splitting y PWA | Compilación de producción, chunks separados (`NF-02`) y generación de Service Worker (`CL-22`) | `npm run build` | **Aprobado (`dist/sw.js`, `Admin` en chunk separado)** |

> [!NOTE]
> No hay registro formal (casos, resultados o capturas) de estas pruebas. Se documentan como pruebas exploratorias de aceptación informal.

## 6. Recursos

### 6.1 Requerimientos de Entornos – Hardware
- PC o portátil con acceso a internet estable.
- Celular Android y celular iPhone (o emuladores).
- No se requieren servidores propios (nube).

### 6.2 Requerimientos de Entornos – Software
- Node.js y npm; `npm run dev` para entorno local.
- Navegadores: Chrome, Edge, Safari (iOS) y Firefox.
- Proyecto Supabase de pruebas (BD, Auth, Storage) con datos de ejemplo.
- Cuenta de administrador de pruebas.
- WhatsApp instalado para validar el enlace del pedido.
- Despliegue de prueba en Vercel (preview).

### 6.3 Herramientas de Pruebas Requeridas
| Herramienta | Uso |
|---|---|
| Vitest + Testing Library | Pruebas unitarias y de componentes |
| Playwright | Pruebas E2E |
| Lighthouse | Rendimiento, accesibilidad y PWA |
| Chrome DevTools | Responsive, red y consola |
| ClickUp | Gestión de tareas y defectos |
| Git | Control de versiones |

### 6.4 Personal
| Rol | Cantidad |
|---|---|
| Líder de pruebas | 1 |
| Tester / analista de QA | 1–2 |
| Desarrollador (corrección de defectos) | 1 |
| Cliente / dueño del negocio (aceptación) | 1 |

### 6.5 Entrenamiento
- Conocer el flujo de pedido y el panel de administración.
- Uso de Playwright/Vitest (si se automatiza).
- Uso de ClickUp para registrar defectos.

## 7. Planificación y Organización

### 7.1 Procedimientos para las Pruebas
1. Preparar el entorno de pruebas y los datos.
2. Ejecutar pruebas de humo (menú → carrito → checkout → WhatsApp).
3. Ejecutar los casos por módulo (cliente, admin, seguridad, no funcionales).
4. Registrar el resultado de cada caso (Aprobado / Fallido / Bloqueado).
5. Reportar defectos en ClickUp con severidad, pasos y evidencia.
6. Reprobar tras la corrección y ejecutar la regresión.
7. Emitir el informe final.

### 7.2 Matriz de Responsabilidades (RACI)
| Actividad | Líder de pruebas | Tester | Desarrollador | Cliente |
|---|---|---|---|---|
| Elaborar el plan | R | C | C | I |
| Aprobar el plan | A | I | I | A |
| Diseñar casos | A | R | C | I |
| Ejecutar pruebas | A | R | I | I |
| Reportar defectos | A | R | I | I |
| Corregir defectos | I | I | R | I |
| Aceptación final | R | C | I | A |

### 7.3 Cronograma (propuesto)
| Fase | Duración | Predecesora |
|---|---|---|
| Preparación del entorno y datos | 1 día | – |
| Diseño y revisión de casos | 2 días | Preparación |
| Pruebas funcionales cliente | 3 días | Casos |
| Pruebas funcionales admin | 2 días | Casos |
| Pruebas de seguridad (RLS) | 1 día | Casos |
| Pruebas no funcionales | 2 días | Funcionales |
| Corrección y reprueba | 3 días | Reporte de defectos |
| Regresión e informe final | 2 días | Corrección |

## 8. Premisas
- Los requisitos de `RESUMEN_PROYECTO.md` son la referencia vigente.
- Habrá un entorno de pruebas estable de Supabase.
- El equipo estará disponible durante el cronograma.
- Las pruebas serán manuales mientras no se configure la automatización.

## 9. Dependencias y Riesgos
| # | Riesgo | Prob. | Impacto | Mitigación / Contingencia |
|---|---|---|---|---|
| R1 | Pedido guardado antes de abrir WhatsApp (pedidos fantasma) | Alta | Alto | Corregir `executeWhatsAppOrder` antes de las pruebas finales |
| R2 | Credenciales expuestas (`test_orders.js`) | Alta | Alto | Usar variables de entorno y rotar la clave si es necesario |
| R3 | Pruebas en producción alteran datos reales | Media | Alto | Crear un proyecto Supabase de pruebas |
| R4 | Falta de pruebas automatizadas: regresiones | Alta | Medio | Automatizar los flujos críticos con Playwright |
| R5 | Caché de 5 min muestra datos desactualizados | Media | Bajo | Forzar refresco en los casos de prueba |
| R6 | Caída de Supabase o Vercel | Baja | Alto | Reintentar y reprogramar las pruebas |
| R7 | Cambio del modelo de datos (migración) | Media | Alto | Repetir las pruebas de regresión tras migrar |
| R8 | Poca disponibilidad del equipo | Media | Medio | Priorizar los casos P1 |

## 10. Referencias
- `RESUMEN_PROYECTO.md` – especificación, reglas de negocio y criterios QC-01..QC-05.
- `PENDIENTES.md` – tareas hechas y pendientes.
- `docs/01_prototipo_componentes.md` – prototipo de baja fidelidad.
- `docs/02_modelo_relacional.md` – modelo de datos.
- `docs/03_plan_de_pruebas.md` – casos de prueba detallados.
- `docs/clickup_tareas.csv` – tareas para ClickUp.
- ISO/IEC/IEEE 29119 y estándar IEEE 829 (referencia general).

## 11. Glosario
| Término | Definición |
|---|---|
| PWA | Aplicación web progresiva instalable en el celular |
| RLS | Row Level Security: reglas de seguridad por fila en Supabase |
| E2E | Pruebas de extremo a extremo (flujo completo del usuario) |
| Regresión | Repetir pruebas para comprobar que lo existente sigue funcionando |
| Smoke test | Prueba rápida de los flujos esenciales |
| Caso de prueba | Pasos, datos y resultado esperado para verificar una funcionalidad |
| Severidad | Impacto de un defecto: crítica, alta, media o baja |
| QC-01..QC-05 | Criterios de aceptación clave del proyecto |
| WhatsApp (wa.me) | Enlace que abre un chat con el mensaje del pedido ya armado |
| Supabase | Plataforma de base de datos, autenticación y almacenamiento del proyecto |

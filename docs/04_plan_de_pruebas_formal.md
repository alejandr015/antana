# Plan de Pruebas de Software
## Antana – Aplicación web (PWA) de pedidos de comida rápida

**Fecha de actualización:** 16/11/2026 | **Versión:** 2.0 (Final)

---

## Historial de Versiones
| Fecha | Versión | Autor | Organización | Descripción |
|---|---|---|---|---|
| 23/10/2026 | 1.0 | Joseph Gómez y César Gómez | Universidad Surcolombiana – Ingeniería de Software I (2026-2) | Versión inicial del plan de pruebas |
| 16/11/2026 | 2.0 | Joseph Gómez y César Gómez | Universidad Surcolombiana – Ingeniería de Software I (2026-2) | Ejecución final: 19/19 unitarias (100% líneas), RLS en vivo, build PWA y matriz PMO completa |

## Información del Proyecto
| Campo | Valor |
|---|---|
| Empresa / Organización | Universidad Surcolombiana – Ingeniería de Software I (2026-2) |
| Proyecto | Antana – Aplicación web (PWA) de pedidos de comida rápida y Panel POS/Admin |
| Fecha de preparación | 16/11/2026 |
| Cliente | Antana Hamburguesería (Neiva, Huila) |
| Patrocinador principal | Ing. Eduardo Martínez Vidal |
| Gerente / Líder de Proyecto | Joseph Gómez y César Gómez (Equipo Antana) |
| Gerente / Líder de Pruebas de Software | Joseph Gómez y César Gómez |

## Aprobaciones
| Nombre y Apellido | Cargo | Departamento u Organización | Fecha | Estado |
|---|---|---|---|---|
| Joseph Gómez y César Gómez | Líder de Proyecto y QA | Equipo Antana / Ingeniería de Software I | 16/11/2026 | Aprobado |
| Ing. Eduardo Martínez Vidal | Docente / Patrocinador | Universidad Surcolombiana | 16/11/2026 | Revisión Final |

---

## 1. Resumen Ejecutivo
Este documento constituye el **plan de pruebas maestro** para el proyecto Antana, una PWA de comercio electrónico para la venta de hamburguesas, salchipapas, perros calientes y bebidas. El sistema cuenta con:
1. **App de cliente:** menú, personalización de productos con recomendaciones por categoría, carrito y checkout con pedido por WhatsApp.
2. **Panel de administración:** gestión de menú, recomendaciones rápidas, barrios, ajustes operativos, límites, estadísticas con estados de pedido, seguridad y perfil.

**Propósito:** verificar el cumplimiento de los requisitos de negocio, los criterios de aceptación `QC-01` a `QC-05` (`RESUMEN_PROYECTO.md`) y los controles de calidad/seguridad ISO (`05_estandar_calidad_y_seguridad_iso.md`).

**Estado actual:** Plan ejecutado y verificado al 100%. Se ejecutaron **19 pruebas automatizadas** unitarias y de integración (`node --test --experimental-test-coverage`, 100.00% líneas y funciones), **auditoría de seguridad RLS en vivo** contra Supabase (`SE-01..SE-06` bloqueados para anónimos, 10 tablas normalizadas activas), **compilación de producción PWA** (`vite build` en 2.42 s) y **validación funcional completa** de los 55 casos (`CL-01..CL-25`, `AD-01..AD-19`, `SE-01..SE-06`, `NF-01..NF-05`).

## 2. Alcance de las Pruebas
- **Incluye:** Navegación (`Navbar`, `Home`, `Footer`, `ErrorBoundary`), Catálogo (`Menu`), Personalizador (`ProductCustomizerModal` y recomendaciones por categoría), Carrito (`CartSidebar`, `CartContext`), Checkout (`CheckoutModal`), Acceso y panel Admin (`Login`, `Admin*Tab`), Servicios (`db.js`, Supabase RLS/Storage) y PWA (`vite-plugin-pwa`).
- **Excluye:** Pasarela de pagos externa (Wompi), disponibilidad interna de servidores terceros (Supabase/Vercel/WhatsApp) y pruebas de estrés masivo.

## 3. Enfoque de Pruebas (Estrategia)
| Tipo | Descripción | Herramienta | Estado |
|---|---|---|---|
| Unitarias y Cobertura | Precios, filtros, recomendaciones, sanitización XSS, validaciones | `node --test --experimental-test-coverage` | **Aprobado (19/19 · 100% líneas)** |
| Integración Código/Componentes | `window.open -> saveOrder`, caché 5 min, `AlertModal`, cabeceras HTTP | Suite automatizada `orderUtils.test.js` | **Aprobado (100%)** |
| Seguridad RLS y Esquema BD | Bloqueo de mutaciones/lectura anónima en Supabase y Storage | `npm run test:security` (`rls_security_check.js`) | **Aprobado (SE-01..SE-06 en vivo)** |
| Build, Code-Splitting y PWA | Compilación Vite 8, chunk separado `Admin`, `sw.js`, ahorro imágenes | `npm run build` | **Aprobado (2.42 s · 66% ahorro)** |
| Funcional Manual y UX | Flujos completos en navegador Desktop y móvil, morphing, WhatsApp | Navegador Chrome / Android / iOS | **Aprobado (100%)** |
| E2E Especificados | Casos cliente y admin automatizados definidos en `tests/e2e/` | Playwright (`client.spec.js`, `admin.spec.js`) | **Definidos y verificados vía suite + manual** |

## 4. Criterios de Aceptación Cumplidos
- 100% de casos críticos P1, medios P2 y bajos P3 aprobados (55/55 casos).
- Criterios `QC-01` a `QC-05` cumplidos y verificados.
- 0 defectos abiertos (`INC-001` a `INC-006` cerrados en QA).
- `npm run build` limpio sin errores y escrituras anónimas bloqueadas por RLS.

## 5. Entregables de Pruebas Generados (Rúbrica Puntos 11–17)
1. **Plan de Pruebas:** `docs/PMO-Plan de Pruebas de Software - Antana.docx` (`04_plan_de_pruebas_formal.md`)
2. **Informe de Pruebas:** `docs/Informe-Pruebas-SW - Antana.docx` (`06_informe_pruebas_sw.md`)
3. **Casos de Prueba:** `docs/PMO- Casos de Prueba - Antana.xlsx` (`03_plan_de_pruebas.md`)
4. **Informe de Errores:** `docs/Informe_de_Errores - Antana.docx` (`07_informe_de_errores.md`)
5. **Pruebas de Unidad:** `docs/Pruebas_de_Unidad - Antana.docx` (`08_pruebas_de_unidad.md`)
6. **Informe de Cobertura:** `docs/Informe_Cobertura_Pruebas - Antana.docx` (`09_informe_cobertura_pruebas.md`)
7. **Reporte de Errores:** `docs/Reporte_Errores_SW - Antana.xlsx`

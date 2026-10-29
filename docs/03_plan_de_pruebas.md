# Plan de Pruebas – Antana

## 1. Alcance
- **Cliente:** menú, personalización, carrito, checkout, pedido por WhatsApp, PWA.
- **Admin:** login, menú, barrios, ajustes, límites, estadísticas, seguridad, perfil.
- **Fuera de alcance (por ahora):** pasarela de pagos (Wompi).

## 2. Estrategia
| Nivel | Herramienta sugerida | Qué cubre |
|---|---|---|
| Unitarias | Vitest | Cálculo de precios, filtros de extras, validación de celular |
| Integración | Vitest + Testing Library | Customizer → Carrito → Checkout |
| E2E | Playwright | Flujos cliente y admin completos |
| Seguridad | Manual + scripts (RLS) | Políticas de Supabase |
| Manual / exploratoria | Checklist | Animaciones, PWA, responsive |

**Entornos:** Chrome, Safari iOS, Chrome Android; viewports 360px, 768px, 1440px.
**Datos:** proyecto Supabase de pruebas (no producción).

## 3. Criterios de entrada / salida
- Entrada: build sin errores (`npm run build`), BD de pruebas poblada.
- Salida: 100% casos críticos (P1) aprobados, sin defectos abiertos de severidad alta.

## 4. Casos de prueba

### 4.1 Cliente
| ID | Caso | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| CL-01 | Caché del menú (QC-01) | Abrir menú → ir a Home → volver | Sin nuevo fetch a Supabase | P2 |
| CL-02 | Búsqueda | Escribir "sal" | Solo productos coincidentes | P2 |
| CL-03 | Producto agotado | Ver ítem con `is_out_of_stock` | Etiqueta AGOTADO y no se puede agregar | P1 |
| CL-04 | Pestañas Hamburguesa | Abrir hamburguesa | `+ Salsas` y `+ Ingredientes` | P1 |
| CL-05 | Pestañas Bebida (QC-05) | Abrir bebida | Solo `+ Michelados`; sin Salsas/Ingredientes | P1 |
| CL-06 | Precio con cantidad (QC-03) | Cantidad 3 + extra $3.000 | Total = (base+extras)×3 en modal y carrito | P1 |
| CL-07 | Nota | Agregar comentario | Aparece en carrito y WhatsApp | P2 |
| CL-08 | Animación morphing | Agregar al carrito | Modal se transforma y viaja al carrito; contador +1 | P3 |
| CL-09 | Editar/eliminar en carrito | Quitar ítem | Subtotal se recalcula | P1 |
| CL-10 | Celular válido | Escribir letras / >10 dígitos | Solo números, máx. 10 | P1 |
| CL-11 | Celular incompleto | 9 dígitos y enviar | Bloquea con mensaje | P1 |
| CL-12 | Campos obligatorios | Dejar nombre/barrio/dirección vacíos | No permite enviar; marcados con `*` | P1 |
| CL-13 | Conjunto/apto (pendiente #1) | Domicilio sin torre/apto | Según decisión: bloquea o permite | P2 |
| CL-14 | Costo de domicilio | Elegir barrio | Se suma `delivery_cost` al total | P1 |
| CL-15 | Recoger en local | Seleccionar pickup | Sin costo de envío; dirección del local | P1 |
| CL-16 | Local cerrado | Admin pone "Cerrado" | Botón de enviar bloqueado + aviso | P1 |
| CL-17 | Alerta de demora | Admin activa demora | Aviso visible; continuar si `allowContinue` | P2 |
| CL-18 | Mensaje WhatsApp | Enviar pedido | Link con plato, cantidad, extras, subtotal, envío, total | P1 |
| CL-19 | Pedido fantasma | Cerrar WhatsApp sin enviar | Según corrección: no debe quedar pedido (hoy falla) | P1 |
| CL-20 | Pago sin tarjeta | Ver métodos | No existe tarjeta | P2 |
| CL-21 | Perfil recordado | 2º pedido | Nombre/celular/dirección precargados | P3 |
| CL-22 | PWA | Instalar y abrir offline | Carga shell; menú en caché | P2 |
| CL-23 | Límite de categoría | Superar límite diario | Se bloquea agregar según `categoryLimits` | P2 |
| CL-24 | Footer | Click en redes | Links correctos (Facebook no `#`) | P3 |

### 4.2 Admin
| ID | Caso | Pasos | Resultado esperado | Prioridad |
|---|---|---|---|---|
| AD-01 | Login válido | Credenciales correctas | Acceso a `/admin` | P1 |
| AD-02 | Login inválido | Clave errónea | Mensaje de error | P1 |
| AD-03 | Acceso sin sesión | Ir a `/admin` directo | Redirige a `/login` | P1 |
| AD-04 | Correo no autorizado | Login con correo fuera de `admin_users` | Acceso denegado | P1 |
| AD-05 | Crear producto | Formulario completo | Aparece en menú cliente | P1 |
| AD-06 | Editar producto | Cambiar precio | Se refleja tras invalidar caché | P1 |
| AD-07 | Eliminar producto | Eliminar + confirmar en `AlertModal` | Producto borrado; sin `window.confirm` (QC-04) | P1 |
| AD-08 | Toggle stock | Alternar agotado | Cliente lo ve bloqueado | P1 |
| AD-09 | Subir imagen | Recortar 1:1 | WebP ≤500×500 en bucket `menu-images` | P2 |
| AD-10 | CRUD barrios | Crear/editar/eliminar | Se refleja en checkout | P1 |
| AD-11 | Barrio restringido | Marcar restringido | Muestra punto de encuentro/alerta al elegirlo | P2 |
| AD-12 | Estado del local | Cambiar entre 3 estados | Efecto inmediato en checkout | P1 |
| AD-13 | Plantilla WhatsApp | Usar chips `{pedido}` `{total}` | Variables reemplazadas en el mensaje | P2 |
| AD-14 | Límites | Editar límite por categoría | Se guarda y aplica | P2 |
| AD-15 | Estadísticas | Filtrar por fechas | Totales coinciden con pedidos | P2 |
| AD-16 | Agregar/quitar admin | Alta y baja de correo | Lista actualizada | P2 |
| AD-17 | Perfil/branding | Cambiar logo y título | Navbar/Home se actualizan (`settingsUpdated`) | P3 |
| AD-18 | Alertas informativas (QC-04) | Guardar cambio | Toast de Sonner | P3 |

### 4.3 Seguridad (QC-02)
| ID | Caso | Resultado esperado |
|---|---|---|
| SE-01 | `insert/update/delete` en `menu_items` con anon key | 401/403 (RLS) |
| SE-02 | Idem en `neighborhoods`, `settings`, `admin_users` | 401/403 |
| SE-03 | `select` en `orders` con anon key | Denegado (datos de clientes) |
| SE-04 | `insert` en `orders` con anon key | Permitido solo con campos válidos |
| SE-05 | Subida a bucket `menu-images` sin sesión | Denegado |
| SE-06 | Revisar repo: no hay llaves/secretos expuestos | `.env` en `.gitignore`; sacar claves de `test_orders.js` |

### 4.4 No funcionales
| ID | Caso | Criterio |
|---|---|---|
| NF-01 | Rendimiento | LCP < 2.5 s en 4G simulado |
| NF-02 | Bundle | Admin en chunk separado (lazy) |
| NF-03 | Accesibilidad | Contraste AA, foco visible, labels en formularios |
| NF-04 | Responsive | Sin scroll horizontal en 360px |
| NF-05 | Número de contacto | Solo aparece 320 444 9987 |

## 5. Gestión de defectos
Severidad: **Crítica** (bloquea pedido/seguridad) · **Alta** · **Media** · **Baja**. Cada defecto se registra en ClickUp con pasos, evidencia y caso asociado.

## 6. Riesgos
- Pedido guardado antes de abrir WhatsApp (CL-19).
- Credenciales en archivos del repositorio (SE-06).
- Dependencia del caché de 5 min puede mostrar datos obsoletos tras cambios en admin.

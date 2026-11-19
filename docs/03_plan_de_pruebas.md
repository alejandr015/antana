# Catálogo y Matriz de Casos de Prueba – Antana

**Última ejecución:** 16/11/2026 | **Total casos:** 55 | **Aprobados:** 55 (100%)

## 1. Casos de Prueba – Módulo Cliente (25 casos)
| ID | Módulo | Caso | Pasos resumidos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| CL-01 | Catálogo / Caché (db.js) | Caché del menú (QC-01) | 1. Abrir /menu. 2. Navegar a /. 3. Volver a /menu antes de 5 minutos. | Sin nuevo fetch a Supabase; carga instantánea desde menuCache. | Media | **Aprobado** |
| CL-02 | Catálogo (Menu.jsx) | Búsqueda de productos | 1. Ir a /menu. 2. Escribir término en barra de búsqueda. 3. Revisar resultados. | Normaliza a 'clasica super' y filtra solo coincidentes. | Media | **Aprobado** |
| CL-03 | Catálogo (Menu.jsx) | Producto agotado | 1. Abrir /menu. 2. Ubicar producto agotado. 3. Intentar abrir personalizador. | Muestra etiqueta AGOTADO y bloquea la adición al carrito. | Alta | **Aprobado** |
| CL-04 | Personalizador | Pestañas para Hamburguesa | 1. Seleccionar hamburguesa. 2. Revisar pestañas de ProductCustomizerModal. | Renderiza pestañas '+ Ingredientes' y '+ Salsas'. | Alta | **Aprobado** |
| CL-05 | Personalizador | Pestañas para Bebida (QC-05) | 1. Seleccionar bebida. 2. Inspeccionar pestañas disponibles. | Solo muestra '+ Opciones' (Michelados); sin Salsas ni Ingredientes. | Alta | **Aprobado** |
| CL-06 | Personalizador / Carrito | Cálculo de precio con cantidad y extras (QC-03) | 1. Agregar extra $3.000 y 2 salsas gratis. 2. Fijar cantidad = 3. 3. Validar subtotal. | unitPrice=$23.000, lineTotal=$69.000; 3ra salsa gratis cobra $1.000. | Alta | **Aprobado** |
| CL-07 | Personalizador / Carrito | Notas y recomendaciones rápidas | 1. Marcar recomendaciones rápidas. 2. Escribir comentario. 3. Editar desde carrito. | Se serializa como 'Recs | Nota' y se recupera al editar. | Media | **Aprobado** |
| CL-08 | Interfaz / UX (Menu.jsx) | Animación morphing al carrito | 1. Presionar Agregar al carrito. 2. Observar animación y contador. | Modal se contrae hacia el ícono del carrito y contador suma +1. | Baja | **Aprobado** |
| CL-09 | Carrito (CartSidebar.jsx) | Editar y eliminar ítem en carrito | 1. Abrir CartSidebar. 2. Eliminar un producto. 3. Revisar subtotal. | Subtotal general se recalcula inmediatamente. | Alta | **Aprobado** |
| CL-10 | Checkout (CheckoutModal.jsx) | Sanitización de celular | 1. Ingresar texto con guiones, letras y >10 dígitos. | Devuelve '3204449987' (10 dígitos numéricos). | Alta | **Aprobado** |
| CL-11 | Checkout (CheckoutModal.jsx) | Validación celular incompleto | 1. Ingresar '320444998' (9 dígitos). 2. Enviar pedido. | isValidColombianPhone retorna false y bloquea con alerta. | Alta | **Aprobado** |
| CL-12 | Checkout (CheckoutModal.jsx) | Campos obligatorios (*) | 1. Dejar nombre, barrio o dirección vacíos. 2. Enviar pedido. | validateCheckoutForm retorna valid=false y mensaje específico. | Alta | **Aprobado** |
| CL-13 | Checkout (CheckoutModal.jsx) | Conjunto/Edificio/Apto obligatorio en domicilios | 1. Seleccionar barrio normal y dirección. 2. Dejar conjunto/apto vacío. 3. Enviar. | Bloquea si está vacío; aprueba al indicar conjunto o 'Casa'. | Media | **Aprobado** |
| CL-14 | Checkout (CheckoutModal.jsx) | Suma automática de costo de domicilio | 1. Elegir barrio con costo $5.000. 2. Verificar total. | Total muestra $47.000 y desglose correcto. | Alta | **Aprobado** |
| CL-15 | Checkout (CheckoutModal.jsx) | Modalidad Recoger en el local | 1. Seleccionar 'Recoger en local'. 2. Ingresar nombre y celular. 3. Enviar. | validateCheckoutForm retorna valid=true y envío = $0. | Alta | **Aprobado** |
| CL-16 | Checkout / Operación | Local cerrado temporalmente | 1. Abrir checkout con local cerrado. 2. Intentar enviar. | Botón de envío deshabilitado y aviso visible. | Alta | **Aprobado** |
| CL-17 | Checkout / Operación | Alerta de Operación Normal / Demora | 1. Abrir checkout. 2. Revisar etiqueta 'Aviso' antes de enviar. | Muestra mensaje operativo; permite continuar según allowContinue. | Media | **Aprobado** |
| CL-18 | Checkout / WhatsApp | Generación del mensaje WhatsApp | 1. Completar checkout. 2. Presionar enviar. 3. Inspeccionar URL wa.me. | Link wa.me incluye cliente, tipo entrega, platos, extras, notas y total. | Alta | **Aprobado** |
| CL-19 | Checkout (CheckoutModal.jsx) | Prevención de pedidos fantasma | 1. Enviar pedido. 2. Cancelar confirmación tras abrir WhatsApp. | window.open(url,'_blank') ocurre antes de saveOrder(orderData). | Alta | **Aprobado** |
| CL-20 | Checkout (CheckoutModal.jsx) | Métodos de pago sin tarjeta | 1. Inspeccionar selector de método de pago. | No aparece opción de tarjeta; solo Efectivo / Transferencia. | Media | **Aprobado** |
| CL-21 | Checkout / Privacidad | Perfil recordado con consentimiento (ISO 27701) | 1. Marcar 'Recordar mis datos'. 2. Reabrir checkout. | Precarga nombre, celular y dirección con aviso Habeas Data. | Baja | **Aprobado** |
| CL-22 | PWA / Build (vite-plugin-pwa) | Generación Service Worker y soporte offline | 1. Ejecutar npm run build. 2. Verificar dist/sw.js y manifest.webmanifest. | dist/sw.js (1,533 B) y dist/manifest.webmanifest (450 B) generados. | Media | **Aprobado** |
| CL-23 | Catálogo / Límites | Límite diario por categoría | 1. Superar límite configurado. 2. Intentar agregar otro ítem. | Se bloquea agregar nuevos ítems al alcanzar el límite. | Media | **Aprobado** |
| CL-24 | Footer (Footer.jsx) | Enlaces sociales sin href='#' | 1. Renderizar Footer sin facebookUrl. 2. Verificar links. | No existen enlaces href='#'; icono oculto si no hay URL. | Baja | **Aprobado** |
| CL-25 | Personalizador (ProductCustomizerModal.jsx) | Título dinámico de recomendaciones por categoría | 1. Abrir Hamburguesa, Perro, Salchipapa, Bebida, Postre y Adicional. | Muestra 'Recomendaciones para tu <categoría>:' correctamente. | Media | **Aprobado** |

## 2. Casos de Prueba – Módulo Administración (19 casos)
| ID | Módulo | Caso | Pasos resumidos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| AD-01 | Autenticación (Login.jsx) | Login válido de administrador | 1. Ir a /login. 2. Ingresar credenciales. 3. Enviar. | Redirige a /admin con sesión activa. | Alta | **Aprobado** |
| AD-02 | Autenticación (Login.jsx) | Login inválido y bloqueo anti-fuerza bruta | 1. Fallar 5 intentos de login. 2. Recargar con F5. | Persiste antana_login_lockout en localStorage impidiendo evasión con F5. | Alta | **Aprobado** |
| AD-03 | Rutas Protegidas (App.jsx) | Acceso sin sesión a /admin | 1. Navegar directamente a /admin. | ProtectedRoute renderiza <Navigate to='/login' replace />. | Alta | **Aprobado** |
| AD-04 | Autorización (App.jsx) | Correo autenticado fuera de admin_users | 1. Iniciar sesión con correo no listado en admin_users. 2. Ir a /admin. | Muestra pantalla 'Acceso Denegado' con botón de regreso. | Alta | **Aprobado** |
| AD-05 | Admin Menú (AdminMenuTab.jsx) | Crear producto nuevo | 1. Clic en '+ Nuevo'. 2. Completar formulario y guardar. | Producto insertado en Supabase y listado en tabla. | Alta | **Aprobado** |
| AD-06 | Admin Menú (AdminProductModal.jsx) | Editar precio/datos de producto | 1. Editar precio. 2. Guardar y validar en /menu. | Precio actualizado en BD y reflejado en cliente. | Alta | **Aprobado** |
| AD-07 | Admin Menú (AdminMenuTab.jsx) | Eliminar producto con AlertModal (QC-04) | 1. Clic en eliminar. 2. Confirmar en AlertModal. | No usa window.confirm; usa AlertModal y borra tras confirmar. | Alta | **Aprobado** |
| AD-08 | Admin Menú (AdminMenuTab.jsx) | Toggle rápido de stock (agotado) | 1. Pulsar switch is_out_of_stock. 2. Verificar en /menu. | Estado alternado en Supabase y bloqueado en tienda. | Alta | **Aprobado** |
| AD-09 | Admin Imágenes (ImageCropperModal.jsx) | Recorte 1:1 y compresión WebP | 1. Seleccionar imagen. 2. Encuadrar 1:1 y guardar. | Imagen WebP <=500x500 subida al bucket menu-images. | Media | **Aprobado** |
| AD-10 | Admin Barrios (AdminNeighborhoodsTab.jsx) | CRUD completo de barrios y tarifas | 1. Crear barrio con tarifa. 2. Editar tarifa. 3. Verificar checkout. | Cambios reflejados en el selector de CheckoutModal. | Alta | **Aprobado** |
| AD-11 | Admin Barrios (AdminNeighborhoodModal.jsx) | Barrio restringido y punto de encuentro | 1. Activar is_restricted. 2. Guardar punto de encuentro y alerta. | Checkout muestra punto de encuentro y alerta personalizada. | Media | **Aprobado** |
| AD-12 | Admin Ajustes (AdminSettingsTab.jsx) | Cambio de estado del local | 1. Seleccionar tarjeta de estado. 2. Guardar. | Checkout aplica de inmediato avisos o bloqueo. | Alta | **Aprobado** |
| AD-13 | Admin Ajustes (AdminSettingsTab.jsx) | Plantilla WhatsApp con variables dinámicas | 1. Insertar variables. 2. Realizar pedido de prueba. | Variables reemplazadas fielmente en enlace wa.me. | Media | **Aprobado** |
| AD-14 | Admin Límites (AdminLimitsTab.jsx) | Configuración de límites por categoría | 1. Activar toggle y fijar número. 2. Guardar. | Se guarda en settings/categories y limita compras. | Media | **Aprobado** |
| AD-15 | Admin Estadísticas (AdminAnalyticsTab.jsx) | Gestión de estados de pedidos y KPIs | 1. Filtrar fechas. 2. Cambiar estado con updateOrderStatus. 3. Revisar totales. | Estado persiste vía updateOrderStatus; cancelados excluidos de ingresos. | Media | **Aprobado** |
| AD-16 | Admin Seguridad (AdminSecurityTab.jsx) | Gestión de correos autorizados | 1. Agregar correo. 2. Verificar lista. | Lista de admin_users actualizada en Supabase. | Media | **Aprobado** |
| AD-17 | Admin Perfil (AdminProfileTab.jsx) | Personalización de marca y logos | 1. Cambiar logo/título. 2. Guardar y ver Home/Navbar. | Navbar y Home se actualizan mediante settingsUpdated. | Baja | **Aprobado** |
| AD-18 | Interfaz Admin (QC-04) | Notificaciones toast informativas | 1. Guardar producto/barrio/ajuste. | Muestra notificación toast sin interrumpir flujo. | Baja | **Aprobado** |
| AD-19 | Admin Menú (AdminMenuTab.jsx) | Gestión de recomendaciones rápidas por categoría | 1. Configurar opciones de recomendación. 2. Abrir producto en tienda. | Opciones guardadas se muestran como chips seleccionables en el modal. | Media | **Aprobado** |

## 3. Casos de Prueba – Seguridad RLS y Código (6 casos)
| ID | Módulo | Caso | Pasos resumidos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| SE-01 | Seguridad RLS (Supabase) | Bloqueo de escritura anónima en menu_items (QC-02) | 1. Ejecutar npm run test:security. 2. Intentar INSERT en menu_items sin sesión. | Error RLS: new row violates row-level security policy. | Alta | **Aprobado** |
| SE-02 | Seguridad RLS (Supabase) | Bloqueo anónimo en neighborhoods y admin_users | 1. Ejecutar rls_security_check.js. 2. Intentar INSERT en neighborhoods y admin_users. | Ambos inserts rechazados por política RLS (401/403). | Alta | **Aprobado** |
| SE-03 | Seguridad RLS / Privacidad | Bloqueo de lectura anónima en orders (ISO 27701) | 1. Ejecutar SELECT id, customer_name, customer_phone con anon key. | 0 filas expuestas para rol anónimo. | Alta | **Aprobado** |
| SE-04 | Seguridad RLS (Supabase) | Inserción pública controlada de pedidos válidos | 1. Enviar pedido desde CheckoutModal. 2. Consultar en Admin. | Pedido insertado correctamente y visible solo para admin. | Alta | **Aprobado** |
| SE-05 | Seguridad Storage (Supabase) | Bloqueo de subida anónima a bucket menu-images | 1. Intentar upload de archivo WebP de prueba al bucket menu-images. | Rechazado por RLS de Storage. | Alta | **Aprobado** |
| SE-06 | Seguridad Código / Repo | Ausencia de secretos/JWT hardcodeados | 1. Inspeccionar test_orders.js y .gitignore. 2. Correr test unitario SE-06. | Sin tokens eyJhbGci; lee process.env.VITE_SUPABASE_ANON_KEY. | Alta | **Aprobado** |

## 4. Casos de Prueba – No Funcionales (5 casos)
| ID | Módulo | Caso | Pasos resumidos | Resultado esperado | Prioridad | Estado |
|---|---|---|---|---|---|---|
| NF-01 | Rendimiento / Build (Vite) | Optimización de bundle e imágenes | 1. Ejecutar npm run build. 2. Revisar tamaños generados y ahorro de imágenes. | Build exitoso <5s; ahorro de imágenes >=50%; entry chunk ligero. | Media | **Aprobado** |
| NF-02 | Arquitectura / Code-Splitting | Separación de bundle Admin mediante React.lazy | 1. Inspeccionar App.jsx y dist/assets/. | Existe chunk independiente Admin-*.js separado de Home/Menu. | Media | **Aprobado** |
| NF-03 | Accesibilidad (ISO 40500) | Etiquetas ARIA y alertas accesibles | 1. Inspeccionar atributos ARIA. 2. Ejecutar test NF-03. | Botones con aria-label descriptivo y fallback con role='alert'. | Media | **Aprobado** |
| NF-04 | Compatibilidad / Responsive | Adaptación móvil sin desbordamiento (360px / 580px / 768px) | 1. Verificar breakpoints en src/style.css. 2. Probar viewport 360px. | Estilos responsivos activos sin scroll horizontal. | Media | **Aprobado** |
| NF-05 | Contenido / Integridad | Unificación del número oficial 320 444 9987 | 1. Buscar teléfonos en src/. 2. Correr prueba CL-24 & NF-05. | Solo aparece el número oficial 320 444 9987 en Footer/Home/Checkout. | Media | **Aprobado** |

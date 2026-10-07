# Documentación del Proyecto "Antana"

Este documento contiene la especificación completa, arquitectura, reglas de negocio y flujos de usuario del proyecto Antana. Está diseñado para servir como base técnica para la elaboración de Historias de Usuario, Casos de Prueba (QA) y futuros requerimientos de software.

---

## 1. Visión General del Producto
Antana es una aplicación web (PWA) de comercio electrónico enfocada en la venta de comida rápida (Hamburguesas, Salchipapas, Perros Calientes y Bebidas). Cuenta con dos módulos principales:
1. **App de Cliente (Frontend):** Plataforma intuitiva con animaciones de alta calidad (micro-interacciones, morphing, etc.) para visualización del menú, personalización detallada de platos y un flujo de checkout que culmina en un pedido vía WhatsApp.
2. **Panel de Administración (Backoffice):** Interfaz protegida para la gestión integral de productos (creación, edición, eliminación, recorte/optimización de imágenes, control de inventario/stock), gestión de costos de domicilio (barrios) y control del estado operativo del local.

---

## 2. 🛠️ Arquitectura y Stack Tecnológico
- **Frontend Core:** React 19, Vite, React Router DOM v7.
- **PWA:** Configurado vía `vite-plugin-pwa` para instalación nativa y offline caching.
- **Performance:** Code Splitting / Lazy Loading (`React.lazy` y `Suspense`) para separar el bundle administrativo del bundle del cliente.
- **Backend / BaaS:** Supabase (PostgreSQL + Auth + Storage).
- **Estilos:** CSS Modules y variables CSS personalizadas (`style.css`, `admin.css`).
- **Animaciones:** Framer Motion (Transiciones de modales, morphing de elementos, layout animations).
- **Iconografía:** Lucide React.
- **Notificaciones:** Sonner y Modales de Alerta Personalizados (`AlertModal.jsx`).
- **Optimización de Assets:** Sistema nativo (Canvas HTML5) para recortar imágenes a formato cuadrado y comprimirlas a WebP antes de subirlas a Supabase. Implementación de `loading="lazy"` y `decoding="async"`.

---

## 3. 🗄️ Modelo de Datos (Supabase)

El sistema utiliza principalmente dos tablas y almacenamiento (Storage):

### Tabla: `menu_items`
Contiene la totalidad de productos principales y complementarios (extras). La lógica del sistema se apoya fuertemente en la columna `category`.
- `id` (UUID): Identificador único.
- `name` (String): Nombre del producto o extra.
- `description` (Text): Descripción detallada.
- `price` (Number): Precio (0 para salsas o complementos gratuitos).
- `category` (String): Campo CRÍTICO que determina cómo y dónde se renderiza el producto.
- `image_url` (String): Ruta pública de Supabase Storage.
- `is_out_of_stock` (Boolean): Flag de disponibilidad (Agotado/Disponible).
- `created_at` (Timestamp).

### Tabla: `neighborhoods`
Gestiona los costos de envío dinámicos.
- `id` (UUID)
- `name` (String): Nombre del barrio.
- `delivery_cost` (Number): Costo de envío a este barrio.

### Supabase Storage
- **Bucket:** `menu-images`. Reglas RLS públicas para lectura, protegidas para escritura (solo usuarios autenticados).

---

## 4. 🧠 Reglas de Negocio y Lógica de Personalización

La aplicación tiene una lógica dinámica para evitar que los usuarios hagan combinaciones ilógicas (ej. agregar "Aros de Cebolla" a una "Bebida"). 

### Categorías Principales
Los productos principales que el cliente puede agregar al carrito pertenecen a:
- `Hamburguesas`
- `Salchipapas`
- `Perros Calientes`
- `Bebidas`
- `Adicionales`

### Extras (Modificadores)
Los extras se guardan en la misma tabla `menu_items` pero bajo categorías especiales con el prefijo `Extras - `.
El componente `ProductCustomizerModal.jsx` renderiza dinámicamente las pestañas según la categoría del producto principal que el cliente selecciona:

1. **Producto tipo `Hamburguesas`:**
   - Muestra pestañas: `+ Salsas` y `+ Ingredientes`
   - Salsas toma items de: `Extras - Salsas`
   - Ingredientes toma items de: `Extras - Ingredientes Hamburguesas`

2. **Producto tipo `Perros Calientes`:**
   - Muestra pestañas: `+ Salsas` y `+ Ingredientes`
   - Ingredientes toma items de: `Extras - Ingredientes Perros`

3. **Producto tipo `Salchipapas`:**
   - Muestra pestañas: `+ Salsas` y `+ Ingredientes`
   - Ingredientes toma items de: `Extras - Ingredientes Salchipapas`

4. **Producto tipo `Bebidas`:**
   - Muestra pestaña única: `+ Michelados`
   - Toma items de: `Extras - Michelados`

---

## 5. 🧑‍💻 Flujos de Usuario (User Journeys)

### Flujo del Cliente (End-User)
1. **Navegación:** El usuario entra al `Home` o `Menu` y visualiza la carta. El menú está agrupado por categorías con búsqueda en tiempo real. Si un producto está `is_out_of_stock = true`, se muestra bloqueado y con etiqueta "AGOTADO".
2. **Personalización:** Al tocar un producto, no se agrega de inmediato. Se abre el `ProductCustomizerModal`.
   - Selecciona la cantidad (mínimo 1).
   - Agrega Salsas (con multiselección visual).
   - Agrega Ingredientes extra (cada uno suma al subtotal de ese plato individual).
   - Agrega Comentarios/Notas específicas (ej. "Sin cebolla cabezona").
3. **Animación Morphing de Carrito:** Al presionar "Agregar al carrito", el modal no se cierra abruptamente. Ocurre una animación continua donde el contenido del modal desaparece, el contenedor se encoge, toma la forma de un vector de hamburguesa iluminado, y viaja en parábola hacia el botón del carrito (`Menu.jsx`).
4. **Sidebar del Carrito:** El cliente revisa los ítems consolidados y su subtotal. 
5. **Checkout (`CheckoutModal.jsx`):**
   - El cliente ingresa: Nombre, Barrio (Dropdown), Dirección y Método de pago.
   - El costo de domicilio se suma automáticamente.
   - Si el panel de admin tiene activo una "Alerta de Demora" o "Local Cerrado", se inyectan las advertencias correspondientes o se bloquea el botón.
   - Se genera el link de WhatsApp con el desglose exacto (Plato, Cantidad, Extras, Subtotal, Costo de envío, Total).

### Flujo del Administrador (Backoffice)
1. **Autenticación:** Ingreso mediante usuario (email) y contraseña gestionado vía Auth de Supabase en `/login`.
2. **Interfaz:** Diseño responsivo con Sidebar izquierdo colapsable (`Admin.jsx`). Las ventanas de acciones (Crear/Editar) se abren como modales centrados flotantes con `backdrop-filter: blur(10px)`.
3. **Gestión de Menú (`AdminMenuTab.jsx`):**
   - CRUD de la tabla `menu_items`.
   - **Upload de Imágenes:** Usa `react-easy-crop` integrado. Al cargar foto, el usuario encuadra (formato cuadrado ratio 1:1), el sistema recorta, escala a max 500x500px, convierte a `WebP` de forma invisible y lo sube al bucket.
   - **Eliminación Segura:** Utiliza un modal (`AlertModal`) para confirmar la acción destructiva (eliminando el uso de `window.confirm` genéricos).
   - **Switch de Stock:** Botón rápido (tipo toggle) para alternar el estado `is_out_of_stock` (bloqueo/desbloqueo inmediato).
4. **Gestión de Barrios (`AdminNeighborhoodsTab.jsx`):**
   - Creación, edición (nombre, precio) y eliminación de los costos de entrega.
5. **Gestión de Configuración Operativa (`AdminSettingsTab.jsx`):**
   - Control de Estado Local: 3 Tarjetas visuales (Operación Normal, Demoras/Tiempo de Espera, Cerrado temporalmente).
   - Variables dinámicas de WhatsApp (permite armar el template que recibirá el local, usando chips como `{pedido}`, `{total}`).

---

## 6. 📝 Criterios de Aceptación Clave (Para QA / Pruebas)

- **QC-01 (Caché):** Si el menú se cargó recientemente, navegar a otra página y volver al menú no debe desencadenar un nuevo fetch a Supabase (tiempo de carga 0ms).
- **QC-02 (RLS & Seguridad):** Las mutaciones a la BD (Insert, Update, Delete) solo deben ejecutarse si existe un token de sesión de Supabase válido. Si un cliente público inspecciona la red e intenta forzar una escritura, debe obtener un error 401/403 de Row Level Security.
- **QC-03 (Consistencia de Precios):** El precio de los extras debe multiplicar correctamente en el `ProductCustomizerModal` por la `quantity` elegida, y debe reflejarse fielmente en el `CartContext`.
- **QC-04 (Animaciones de Interfaz):** Todas las alertas destructivas (Eliminar) deben usar `AlertModal.jsx`. Las alertas informativas deben usar `toast` (Sonner).
- **QC-05 (Filtros de Extras):** Un producto con categoría "Bebidas" **NUNCA** debe renderizar pestañas de Salsas ni Ingredientes. Solo "Michelados".

---
*Fin del Documento Maestro.*

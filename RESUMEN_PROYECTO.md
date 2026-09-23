# Resumen del Proyecto "Antana"

Este documento mantiene el contexto completo y actualizado de todo lo que se ha construido en el proyecto.

---

## 🛠️ Stack Tecnológico
- **Frontend:** React 19 (con Vite) + PWA (`vite-plugin-pwa`)
- **Enrutamiento y Carga:** React Router DOM v7 con **Code Splitting y Lazy Loading** (`React.lazy` y `Suspense`).
- **Backend / Base de Datos / Storage:** Supabase (PostgreSQL + Supabase Storage con RLS blindado).
- **Estilos / Animaciones:** CSS puro modular (`style.css` y `admin.css`), Framer Motion (para transiciones y feedback visual).
- **Iconos:** Lucide React
- **Notificaciones:** Sonner / AlertModal personalizado
- **Optimización multimedia:** Pipeline de recorte y compresión a **WebP** en el navegador (HTML5 Canvas + FileReader) y optimización general de assets (Preloads, `loading="lazy"`).
- **Caché:** Sistema de Caché en memoria (cliente) para reducir requests repetitivos a Supabase.

---

## 📁 Estructura del Proyecto

### Páginas (`src/pages/`)
1. **`Home.jsx`**: Landing page principal con hero section interactivo.
2. **`Menu.jsx`**: Menú completo con categorías, modal de detalle de producto y agregado al carrito.
3. **`Login.jsx`**: Inicio de sesión administrativo con autenticación vía Supabase.
4. **`Admin.jsx`**: **Panel de Administración rediseñado** con sidebar izquierdo colapsable, topbar de control y canvas modular (Solo se descarga si el usuario entra a esta ruta).

### Componentes de Administración (`src/components/admin/`)
- **`AdminMenuTab.jsx`**: Grid completa de platos con toggles de disponibilidad inmediata (Agotado/Disponible), filtros por categoría y modal de creación/edición.
- **`AdminNeighborhoodModal.jsx`**: Modal auxiliar flotante con fondo borroso (`backdrop-filter: blur`) para crear y editar tarifas de barrios.
- **`AdminProductModal.jsx`**: Modal auxiliar flotante con vista previa y subida/recorte automático de fotos directo a Supabase Storage.
- **`AdminNeighborhoodsTab.jsx`**: Gestión de barrios y costos de envío.
- **`AdminSettingsTab.jsx`**: Panel de control intuitivo con 3 modos de estado del local (Normal, Demoras, Cerrado) y chips clicables de variables para la plantilla de WhatsApp.

### Componentes Globales (`src/components/`)
- **`Navbar.jsx`**: Barra superior de navegación adaptable para la tienda (se oculta automáticamente en `/admin` para maximizar el área de trabajo y evitar distracciones).
- **`Footer.jsx`**: Pie de página con información del negocio y enlaces (oculto en `/admin`).
- **`CartSidebar.jsx`**: Carrito deslizable (drawer inferior en móvil, lateral en PC) con cálculo de envío por barrio y lógica inteligente de inyección de tiempos de espera en base a la configuración de alertas.
- **`AlertModal.jsx`**: Modal reutilizable para confirmaciones y alertas de negocio.
- **`LoadingScreen.jsx`**: Pantalla de transición estética con resplandor para cargas y *fallbacks* de componentes perezosos (Lazy Loading).

---

## 🚀 Mejoras Implementadas

### Fases de UI/UX Administrativa
1. **Fase 1 - Sidebar Izquierdo Retraíble:**
   - Barra lateral anclada a la izquierda que se retrae y expande mediante un botón con animación suave.
   - En móviles se despliega como un menú lateral seguro (drawer con oscurecimiento y blur). Altura dinámica (`100dvh`) para no ser obstaculizada por la barra de navegación del celular.
   - Optimiza al 100% el ancho de pantalla para la gestión de productos.

2. **Fase 2 - Pantallas Auxiliares (Modales Flotantes con Blur):**
   - Eliminados los formularios estáticos que ocupaban espacio permanente.
   - Ahora, al presionar **"Añadir Nuevo Plato"**, **"Añadir Barrio"** o al **editar** cualquier elemento, se abre una ventana auxiliar centrada con desenfoque de fondo (`backdrop-filter: blur(10px)`).
   - Optimizado para pantallas táctiles y móviles: botones táctiles grandes, previsualización de imagen recortada y cierre fácil.

3. **Fase 3 - Rediseño Intuitivo de Mensajes y Estado:**
   - Sustitución de checkboxes confusos por **3 tarjetas de estado visual** con códigos de color claros:
     - 🟢 **Operación Normal:** Inyección de tiempos estándar o mensajes informativos en el flujo normal, paso directo a WhatsApp.
     - 🔵 **Demoras / Tiempo de Espera:** Mensaje preventivo, advierte al usuario del retraso pero le permite continuar.
     - 🔴 **Local Cerrado / Sin Domicilios:** Bloqueo total del paso al pedido.
   - **Chips de variables clicables:** Inserta etiquetas como `{pedido}`, `{barrio}`, `{direccion}`, etc. en la plantilla de WhatsApp con 1 solo toque.

### Auditoría y Optimización de Rendimiento (QA & Performance)
1. **Code Splitting (Separación de Código):** La aplicación pública y el panel administrativo están separados mediante `React.lazy`. Los clientes públicos ya no descargan dependencias de edición (ej. `react-easy-crop`) agilizando inmensamente el tiempo de primera pintura (FCP).
2. **Assets Ultraligeros:** 
   - Conversión de imágenes pesadas a **formato WebP** de próxima generación (ej. hero y logo perdieron entre 68% y 86% de peso sin perder calidad visual).
   - Implementación de preloads en `index.html` para la imagen *Hero* que previene parpadeos (LCP Optimizado).
3. **Lazy Loading de Imágenes:** Todas las imágenes del menú incorporan `loading="lazy" decoding="async"` para ahorrar ancho de banda.
4. **Caché de Base de Datos en Memoria:** El archivo `db.js` cachea las llamadas a la carta de productos (con un TTL), logrando que segundas navegaciones de los clientes al Menú sean **instantáneas**, y ahorrando peticiones pagas (reads) a Supabase.
5. **Correcciones CSS Móviles:** Uso global de unidades `dvh` (*Dynamic Viewport Height*) para corregir desbordes y problemas con la interfaz del navegador en iOS y Android.

---
*Última actualización: 21 de Septiembre de 2026*

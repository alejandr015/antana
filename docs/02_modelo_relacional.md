    # Modelo relacional – Antana

    Estado actual (Supabase/PostgreSQL) y modelo normalizado propuesto.

    ## 1. Estado actual

    | Tabla | Observaciones |
    |---|---|
    | `menu_items` | `category` es texto libre; los extras se distinguen por prefijo `Extras - ` |
    | `neighborhoods` | `price` en código, `delivery_cost` en documentación (inconsistente); además guarda `isRestricted`, `meetingPoint*`, `customAlertMessage` |
    | `settings` | Una sola fila (`id=1`) con JSON `config` (branding, categorías, alertas, límites, plantilla WhatsApp) |
    | `orders` | `items` guardado como JSON del carrito; `neighborhood` y `address` como texto |
    | `admin_users` | Lista de correos autorizados |

    Problemas: categorías y límites en JSON/strings sin integridad referencial, sin reglas explícitas de qué extras aplican a qué categoría, sin historial de pedidos normalizado ni estado del pedido.

    ## 2. Diagrama ER propuesto

    ```mermaid
    erDiagram
      CATEGORIES ||--o{ MENU_ITEMS : contiene
      CATEGORIES ||--o{ CATEGORY_EXTRA_GROUPS : "producto de"
      EXTRA_GROUPS ||--o{ CATEGORY_EXTRA_GROUPS : aplica
      EXTRA_GROUPS ||--o{ EXTRAS : agrupa
      NEIGHBORHOODS ||--o{ ORDERS : destino
      ORDERS ||--|{ ORDER_ITEMS : incluye
      MENU_ITEMS ||--o{ ORDER_ITEMS : referencia
      ORDER_ITEMS ||--o{ ORDER_ITEM_EXTRAS : lleva
      EXTRAS ||--o{ ORDER_ITEM_EXTRAS : referencia

      CATEGORIES {
        uuid id PK
        text name UK
        int sort_order
        bool is_active
        int daily_limit
        bool limit_active
      }
      MENU_ITEMS {
        uuid id PK
        uuid category_id FK
        text name
        text description
        numeric price
        text image_url
        bool is_out_of_stock
        timestamptz created_at
      }
      EXTRA_GROUPS {
        uuid id PK
        text name UK
        int sort_order
      }
      EXTRAS {
        uuid id PK
        uuid group_id FK
        text name
        numeric price
        bool is_out_of_stock
      }
      CATEGORY_EXTRA_GROUPS {
        uuid category_id FK
        uuid extra_group_id FK
        text tab_label
      }
      NEIGHBORHOODS {
        uuid id PK
        text name UK
        numeric delivery_cost
        bool is_restricted
        text meeting_point_name
        text meeting_point_address
        text custom_alert_message
        timestamptz created_at
      }
      ORDERS {
        uuid id PK
        text customer_name
        text customer_phone
        text order_type
        uuid neighborhood_id FK
        text address
        text housing_details
        text payment_method
        numeric subtotal
        numeric delivery_fee
        numeric total
        text status
        timestamptz created_at
      }
      ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid menu_item_id FK
        text name_snapshot
        numeric unit_price
        int quantity
        text comment
      }
      ORDER_ITEM_EXTRAS {
        uuid id PK
        uuid order_item_id FK
        uuid extra_id FK
        text name_snapshot
        numeric unit_price
        int quantity
      }
      SETTINGS {
        int id PK
        jsonb config
        timestamptz updated_at
      }
      ADMIN_USERS {
        uuid id PK
        text email UK
        timestamptz created_at
      }
    ```

    ## 3. Reglas / decisiones
    - **Categorías y extras separados:** se elimina el prefijo `Extras - `. `category_extra_groups` define qué pestañas ve cada categoría (cumple QC-05: Bebidas solo ve Michelados).
    - **Snapshots de pedido:** `name_snapshot` y `unit_price` conservan el precio vigente al comprar aunque el menú cambie.
    - **`orders.status`:** `pendiente | confirmado | entregado | cancelado` (resuelve pedidos "fantasma").
    - **`settings` y `admin_users`** se mantienen igual (config JSON es adecuado para branding/alertas).
    - **Integridad:** `ON DELETE RESTRICT` en `menu_items → order_items` (usar `is_active`/stock en lugar de borrar productos con ventas).

    ## 4. SQL (PostgreSQL / Supabase)

    ```sql
    create table categories (
      id uuid primary key default gen_random_uuid(),
      name text not null unique,
      sort_order int not null default 0,
      is_active boolean not null default true,
      daily_limit int,
      limit_active boolean not null default false
    );

    create table menu_items (
      id uuid primary key default gen_random_uuid(),
      category_id uuid not null references categories(id),
      name text not null,
      description text,
      price numeric(10,0) not null check (price >= 0),
      image_url text,
      is_out_of_stock boolean not null default false,
      created_at timestamptz not null default now()
    );

    create table extra_groups (
      id uuid primary key default gen_random_uuid(),
      name text not null unique,
      sort_order int not null default 0
    );

    create table extras (
      id uuid primary key default gen_random_uuid(),
      group_id uuid not null references extra_groups(id) on delete cascade,
      name text not null,
      price numeric(10,0) not null default 0 check (price >= 0),
      is_out_of_stock boolean not null default false
    );

    create table category_extra_groups (
      category_id uuid references categories(id) on delete cascade,
      extra_group_id uuid references extra_groups(id) on delete cascade,
      tab_label text not null,
      primary key (category_id, extra_group_id)
    );

    create table neighborhoods (
      id uuid primary key default gen_random_uuid(),
      name text not null unique,
      delivery_cost numeric(10,0) not null check (delivery_cost >= 0),
      is_restricted boolean not null default false,
      meeting_point_name text,
      meeting_point_address text,
      custom_alert_message text,
      created_at timestamptz not null default now()
    );

    create table orders (
      id uuid primary key default gen_random_uuid(),
      customer_name text not null,
      customer_phone char(10) not null check (customer_phone ~ '^[0-9]{10}$'),
      order_type text not null check (order_type in ('delivery','pickup')),
      neighborhood_id uuid references neighborhoods(id),
      address text,
      housing_details text,
      payment_method text not null,
      subtotal numeric(10,0) not null,
      delivery_fee numeric(10,0) not null default 0,
      total numeric(10,0) not null,
      status text not null default 'pendiente'
        check (status in ('pendiente','confirmado','entregado','cancelado')),
      created_at timestamptz not null default now()
    );

    create table order_items (
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references orders(id) on delete cascade,
      menu_item_id uuid not null references menu_items(id) on delete restrict,
      name_snapshot text not null,
      unit_price numeric(10,0) not null,
      quantity int not null check (quantity > 0),
      comment text
    );

    create table order_item_extras (
      id uuid primary key default gen_random_uuid(),
      order_item_id uuid not null references order_items(id) on delete cascade,
      extra_id uuid references extras(id) on delete set null,
      name_snapshot text not null,
      unit_price numeric(10,0) not null,
      quantity int not null default 1 check (quantity > 0)
    );

    create index on menu_items (category_id);
    create index on orders (created_at desc);
    create index on order_items (order_id);
    ```

    ## 5. Plan de migración (resumen)
    1. Crear tablas nuevas sin tocar las actuales.
    2. Poblar `categories`/`extra_groups` desde `settings.config.customCategories` y los prefijos `Extras - `.
    3. Migrar `menu_items` (los no-extra) y `extras` (los que tienen prefijo).
    4. Convertir `orders.items` (JSON) a `order_items` / `order_item_extras`.
    5. Adaptar `src/services/db.js` y RLS (lectura pública de menú/barrios; escritura solo admin; `orders` insert público, select solo admin).
    6. Retirar tablas/columnas antiguas.

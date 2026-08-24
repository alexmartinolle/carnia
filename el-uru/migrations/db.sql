-- ==========================================
-- 1. CREACIÓN DE TIPOS PERSONALIZADOS (ENUMS)
-- ==========================================
CREATE TYPE delivery_type_enum AS ENUM ('pickup', 'delivery');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'redsys', 'transfer');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE order_status_enum AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE period_type_enum AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE product_type_enum AS ENUM ('unit', 'weight');
CREATE TYPE movement_type_enum AS ENUM ('in', 'out', 'adjustment', 'sale', 'waste');

-- ==========================================
-- 2. TABLAS INDEPENDIENTES / MAESTRAS
-- ==========================================

-- Tabla: profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_ca TEXT,
    slug TEXT UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: ai_forecast_cache
CREATE TABLE ai_forecast_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_date DATE NOT NULL,
    forecast_data JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: daily_stats
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    total_revenue NUMERIC(12, 2) DEFAULT 0.00,
    ticket_count INTEGER DEFAULT 0,
    avg_ticket NUMERIC(12, 2) DEFAULT 0.00,
    online_revenue NUMERIC(12, 2) DEFAULT 0.00,
    physical_revenue NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: packs
CREATE TABLE packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_ca TEXT,
    slug TEXT UNIQUE,
    description_es TEXT,
    description_ca TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_on_offer BOOLEAN DEFAULT false,
    offer_price NUMERIC(10, 2),
    offer_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: sale_tickets
CREATE TABLE sale_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    payment_method payment_method_enum NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TABLAS DEPENDIENTES (CON LLAVES FORÁNEAS)
-- ==========================================

-- Tabla: addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    province TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_es TEXT NOT NULL,
    name_ca TEXT,
    slug TEXT UNIQUE,
    description_es TEXT,
    description_ca TEXT,
    price NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2),
    product_type product_type_enum NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    image_public_id TEXT,
    is_visible BOOLEAN DEFAULT true,
    is_on_offer BOOLEAN DEFAULT false,
    offer_price NUMERIC(10, 2),
    offer_ends_at TIMESTAMP WITH TIME ZONE,
    stock_quantity NUMERIC(10, 3) DEFAULT 0.000,
    stock_threshold NUMERIC(10, 3) DEFAULT 0.000,
    expires_at TIMESTAMP WITH TIME ZONE,
    expiry_alert_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    preparation_tips_es TEXT,
    preparation_tips_ca TEXT
);

-- Tabla: orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    guest_email TEXT,
    guest_name TEXT,
    guest_phone TEXT,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    delivery_type delivery_type_enum NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum DEFAULT 'pending',
    order_status order_status_enum DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    redsys_order_id TEXT,
    notes TEXT,
    sale_channel TEXT DEFAULT 'web',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    estimated_quantity NUMERIC(10, 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: pack_products
CREATE TABLE pack_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pack_id UUID REFERENCES packs(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    weight NUMERIC(10, 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: product_sales_stats
CREATE TABLE product_sales_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    period DATE NOT NULL,
    period_type period_type_enum NOT NULL,
    units_sold NUMERIC(10, 3) DEFAULT 0.000,
    revenue NUMERIC(12, 2) DEFAULT 0.00,
    ticket_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: sale_ticket_items
CREATE TABLE sale_ticket_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES sale_tickets(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity NUMERIC(10, 3) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: stock_movements
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 3) NOT NULL,
    movement_type movement_type_enum NOT NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
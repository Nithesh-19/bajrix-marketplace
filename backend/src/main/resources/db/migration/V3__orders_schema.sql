-- V3__orders_schema.sql
-- Orders & Order Items Schema for BajriX Marketplace Checkout

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer_name VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(50) NOT NULL,
    buyer_email VARCHAR(255) NOT NULL,
    project_site_name VARCHAR(255),
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    site_unloading_notes TEXT,
    payment_method VARCHAR(50) NOT NULL,
    total_material_amount NUMERIC(12, 2) NOT NULL,
    freight_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    order_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id BIGINT REFERENCES seller_listings(id) ON DELETE SET NULL,
    seller_id BIGINT NOT NULL REFERENCES sellers(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_unit VARCHAR(50) NOT NULL,
    seller_name VARCHAR(255) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

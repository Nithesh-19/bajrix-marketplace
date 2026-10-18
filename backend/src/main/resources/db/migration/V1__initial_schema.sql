-- V1__initial_schema.sql
-- BajriX Marketplace Initial Schema: Sellers, Products, and Seller Listings

CREATE TABLE sellers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    location VARCHAR(255),
    seller_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (seller_status IN ('APPROVED', 'PENDING', 'REJECTED')),
    rating NUMERIC(3, 2) DEFAULT 4.50
        CHECK (rating >= 1.00 AND rating <= 5.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_sellers_status ON sellers(seller_status);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

CREATE TABLE seller_listings (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    available_stock INTEGER NOT NULL CHECK (available_stock >= 0),
    min_order_quantity INTEGER NOT NULL CHECK (min_order_quantity > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_seller_product UNIQUE (seller_id, product_id)
);

CREATE INDEX idx_seller_listings_seller_id ON seller_listings(seller_id);
CREATE INDEX idx_seller_listings_product_id ON seller_listings(product_id);
CREATE INDEX idx_seller_listings_active_price ON seller_listings(product_id, active, price);

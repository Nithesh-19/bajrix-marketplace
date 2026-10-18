-- V2__seed_data.sql
-- Seed Data for BajriX Marketplace (Deterministic, Idempotent)

-- 1. Insert Sellers
INSERT INTO sellers (id, name, email, phone, location, seller_status, rating)
VALUES
(1, 'Apex Building Supplies', 'contact@apexsupplies.com', '+91 98201 12345', 'Navi Mumbai, MH', 'APPROVED', 4.80),
(2, 'BuildPro Infrastructure Ltd', 'sales@buildproinfra.com', '+91 98110 54321', 'Sector 62, Noida, UP', 'APPROVED', 4.65),
(3, 'SolidRock Cement & Aggregates', 'orders@solidrock.in', '+91 94480 98765', 'Peenya Industrial Area, Bengaluru, KA', 'APPROVED', 4.90),
(4, 'NovaTech Steel & Infra', 'verify@novatechinfra.com', '+91 97230 45678', 'Sanand Industrial Estate, Ahmedabad, GJ', 'PENDING', 4.20),
(5, 'Shady Materials Trading', 'info@shadymaterials.com', '+91 91234 00000', 'Kalyani Nagar, Pune, MH', 'REJECTED', 2.10)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    seller_status = EXCLUDED.seller_status;

SELECT setval('sellers_id_seq', (SELECT MAX(id) FROM sellers));

-- 2. Insert Products
INSERT INTO products (id, name, description, category, unit, image_url)
VALUES
(1, 'UltraTech PPC Cement 50 kg', 'Portland Pozzolana Cement offering superior durability, fine finish, and corrosion resistance for general civil construction.', 'Cement', '50 kg bag', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80'),
(2, 'Tata Tiscon 550D TMT Rebar (12mm)', 'High-ductility Fe 550D grade thermo-mechanically treated rebars engineered for high-earthquake load resistance and structural longevity.', 'Steel & TMT', 'tonne', 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80'),
(3, 'Red Clay Kiln-Burnt Bricks (Class 1)', 'Standard high-compressive strength kiln-burnt red clay table-molded bricks. Dimensions 230 x 115 x 75 mm.', 'Bricks & Blocks', '1000 pieces', 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80'),
(4, 'M-Sand (Plastering Grade)', 'Double washed, finely graded manufactured cubical sand optimized for external wall plastering and masonry mortar.', 'Sand & Aggregates', 'tonne', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'),
(5, 'Blue Metal Crushed Aggregate 20mm', 'Hard crushed blue granite stone aggregate machine-graded at 20mm for high-grade RCC slab casting and foundation columns.', 'Sand & Aggregates', 'tonne', 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80'),
(6, 'Astral CPVC Pro Pipes 1-inch (3m)', 'Chlorinated Polyvinyl Chloride cold and hot water pressure pipes rated SDR 11 with antimicrobial resistance.', 'Plumbing', '10 pieces', 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=600&auto=format&fit=crop&q=80'),
(7, 'Finolex 2.5 sq mm FR Copper Wire (90m coil)', 'Flame Retardant multi-strand PVC insulated industrial-grade electrical copper wiring coil with 1100V rating.', 'Electrical', 'coil', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop&q=80'),
(8, 'Dr. Fixit 101 LW+ Waterproofing Chemical', 'Integral liquid waterproofing compound for concrete and mortar, reduces water permeability and bleeding.', 'Chemicals', '20L can', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80'),
(9, 'UltraTech Super Cement (Weather Plus) 50 kg', 'Engineered water-repellent cement for coastal regions and high-rainfall foundations. Protects against efflorescence.', 'Cement', '50 kg bag', 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&auto=format&fit=crop&q=80'),
(10, 'Birla Aerocon AAC Blocks (600x200x150mm)', 'Autoclaved Aerated Concrete lightweight thermal insulation blocks for rapid construction and reduced foundation dead load.', 'Bricks & Blocks', 'cubic meter', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit;

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- 3. Insert Seller Listings
-- Product 1: UltraTech PPC Cement (Multi-seller comparison matching user scenario)
INSERT INTO seller_listings (id, seller_id, product_id, price, available_stock, min_order_quantity, active, version)
VALUES
(1, 1, 1, 390.00, 500, 50, TRUE, 0),    -- Seller A (Apex): ₹390 per bag, 500 bags
(2, 2, 1, 385.00, 200, 25, TRUE, 0),    -- Seller B (BuildPro): ₹385 per bag, 200 bags (Lowest price!)
(3, 3, 1, 405.00, 1000, 100, TRUE, 0),  -- Seller C (SolidRock): ₹405 per bag, 1000 bags
(4, 4, 1, 375.00, 400, 50, TRUE, 0),    -- Seller D (NovaTech): PENDING seller (Must NOT show to buyers)
(5, 5, 1, 350.00, 100, 10, TRUE, 0),    -- Seller E (Shady): REJECTED seller (Must NOT show to buyers)

-- Product 2: Tata Tiscon 550D TMT Rebar (Multi-seller)
(6, 1, 2, 64500.00, 45, 2, TRUE, 0),
(7, 2, 2, 63800.00, 30, 3, TRUE, 0),

-- Product 3: Red Clay Bricks (Multi-seller)
(8, 2, 3, 8200.00, 60, 5, TRUE, 0),
(9, 3, 3, 7950.00, 120, 10, TRUE, 0),

-- Product 4: M-Sand (Multi-seller)
(10, 1, 4, 1150.00, 250, 15, TRUE, 0),
(11, 3, 4, 1080.00, 400, 20, TRUE, 0),

-- Product 5: Blue Metal Aggregate 20mm (Single seller)
(12, 3, 5, 920.00, 500, 25, TRUE, 0),

-- Product 6: Astral CPVC Pipes (One active, one INACTIVE listing)
(13, 1, 6, 3450.00, 80, 5, TRUE, 0),
(14, 2, 6, 3600.00, 50, 5, FALSE, 0),   -- INACTIVE listing (Must NOT show to buyers)

-- Product 7: Finolex Copper Wire
(15, 2, 7, 2850.00, 150, 10, TRUE, 0),

-- Product 8: Dr. Fixit Waterproofing (Multi-seller)
(16, 1, 8, 3100.00, 75, 4, TRUE, 0),
(17, 3, 8, 2990.00, 40, 2, TRUE, 0),

-- Product 9: UltraTech Super Cement Weather Plus -> Has NO listings (Tests 0 offers state)

-- Product 10: Birla Aerocon AAC Blocks
(18, 1, 10, 3200.00, 85, 10, TRUE, 0)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    available_stock = EXCLUDED.available_stock,
    min_order_quantity = EXCLUDED.min_order_quantity,
    active = EXCLUDED.active;

SELECT setval('seller_listings_id_seq', (SELECT MAX(id) FROM seller_listings));

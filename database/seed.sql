USE winvel_db;

-- Categories
INSERT IGNORE INTO categories (name, slug, description) VALUES
('Graphic Tees', 'graphic-tees', 'Bold graphic design t-shirts'),
('Plain Tees', 'plain-tees', 'Classic solid color t-shirts'),
('Vintage', 'vintage', 'Retro and vintage style t-shirts'),
('Limited Edition', 'limited-edition', 'Exclusive limited run designs');

-- Sample products
INSERT IGNORE INTO products (category_id, name, slug, description, price, compare_price, sku, image_url, is_featured) VALUES
(1, 'Mountain Sunset Tee', 'mountain-sunset-tee', 'Stunning mountain landscape at sunset', 29.99, 39.99, 'MTN-001', '/images/products/mountain-sunset.jpg', TRUE),
(1, 'Urban Skull Tee', 'urban-skull-tee', 'Edgy urban skull graphic design', 34.99, NULL, 'SKL-001', '/images/products/urban-skull.jpg', TRUE),
(2, 'Classic Black Tee', 'classic-black-tee', 'Premium cotton black t-shirt', 19.99, NULL, 'BLK-001', '/images/products/classic-black.jpg', FALSE),
(3, 'Retro Wave Tee', 'retro-wave-tee', '80s inspired retro wave design', 32.99, 42.99, 'RET-001', '/images/products/retro-wave.jpg', TRUE);

-- Product variants
INSERT IGNORE INTO product_variants (product_id, size, color, stock_quantity, sku) VALUES
(1, 'S', 'Navy', 50, 'MTN-001-S-NAVY'),
(1, 'M', 'Navy', 75, 'MTN-001-M-NAVY'),
(1, 'L', 'Navy', 60, 'MTN-001-L-NAVY'),
(1, 'XL', 'Navy', 40, 'MTN-001-XL-NAVY'),
(2, 'M', 'Black', 30, 'SKL-001-M-BLK'),
(2, 'L', 'Black', 45, 'SKL-001-L-BLK'),
(3, 'S', 'Black', 100, 'BLK-001-S-BLK'),
(3, 'M', 'Black', 150, 'BLK-001-M-BLK'),
(3, 'L', 'Black', 120, 'BLK-001-L-BLK'),
(4, 'M', 'Purple', 25, 'RET-001-M-PUR'),
(4, 'L', 'Purple', 20, 'RET-001-L-PUR');

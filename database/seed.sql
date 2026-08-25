USE winvel_db;

-- 1. Truncate tables to ensure clean seeding
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE admin_activity_logs;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE notifications;
TRUNCATE TABLE banners;
TRUNCATE TABLE password_resets;
TRUNCATE TABLE otp_verifications;
TRUNCATE TABLE review_images;
TRUNCATE TABLE reviews;
TRUNCATE TABLE order_status_history;
TRUNCATE TABLE shipments;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_addresses;
TRUNCATE TABLE order_items;
TRUNCATE TABLE coupon_usages;
TRUNCATE TABLE orders;
TRUNCATE TABLE coupons;
TRUNCATE TABLE wishlist_items;
TRUNCATE TABLE wishlists;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE product_collections;
TRUNCATE TABLE product_categories;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE colors;
TRUNCATE TABLE sizes;
TRUNCATE TABLE products;
TRUNCATE TABLE collections;
TRUNCATE TABLE categories;
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Seed Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'Customer', 'General shopping customer account'),
(2, 'Admin', 'Store administrator with catalog/order access'),
(3, 'Super Admin', 'Full control super administrator');

-- 3. Seed Sizes
INSERT INTO sizes (id, name, sort_order) VALUES
(1, 'S', 1),
(2, 'M', 2),
(3, 'L', 3),
(4, 'XL', 4),
(5, 'XXL', 5);

-- 4. Seed Colors
INSERT INTO colors (id, name, hex_code, sort_order) VALUES
(1, 'Black', '#000000', 1),
(2, 'Sage Green', '#879883', 2),
(3, 'White', '#ffffff', 3),
(4, 'Lavender', '#c8a2c8', 4),
(5, 'Sand Beige', '#e1c699', 5),
(6, 'Deep Teal', '#005a5b', 6);

-- 5. Seed Categories
INSERT INTO categories (id, parent_id, name, slug, sort_order) VALUES
(1, NULL, 'Men', 'men', 1),
(2, NULL, 'Women', 'women', 2),
(3, NULL, 'Oversized', 'oversized', 3),
(4, NULL, 'Basics', 'basics', 4),
(5, NULL, 'New Arrivals', 'new-arrivals', 5);

-- 6. Seed Products
INSERT INTO products (id, name, slug, short_description, description, brand, base_price, status, featured, is_new) VALUES
(1, 'Classic Black Tee', 'classic-black-tee', 'Premium quality black t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 699.00, 'active', TRUE, TRUE),
(2, 'Sage Green Tee', 'sage-green-tee', 'Premium quality sage green t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 699.00, 'active', TRUE, TRUE),
(3, 'Essential White Tee', 'essential-white-tee', 'Premium quality white t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 599.00, 'active', TRUE, TRUE),
(4, 'Lavender Tee', 'lavender-tee', 'Premium quality lavender purple t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 599.00, 'active', TRUE, TRUE),
(5, 'Sand Beige Tee', 'sand-beige-tee', 'Premium quality beige t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 699.00, 'active', TRUE, TRUE),
(6, 'Deep Teal Tee', 'deep-teal-tee', 'Premium quality deep teal t-shirt', 'Premium quality t-shirt for everyday comfort and style. 100% combed cotton, regular fit, pre-shrunk fabric.', 'WINVEL', 699.00, 'active', TRUE, TRUE);

-- 7. Seed Product Variants (mapping sizes & colors)
INSERT INTO product_variants (id, product_id, size_id, color_id, sku, price, compare_at_price, stock_quantity) VALUES
-- Classic Black Tee variants (size S, M, L, XL; color Black)
(1, 1, 1, 1, 'TEE-BLK-S', 699.00, 899.00, 50),
(2, 1, 2, 1, 'TEE-BLK-M', 699.00, 899.00, 75),
(3, 1, 3, 1, 'TEE-BLK-L', 699.00, 899.00, 60),
(4, 1, 4, 1, 'TEE-BLK-XL', 699.00, 899.00, 40),
-- Sage Green Tee variants (size S, M, L; color Sage Green)
(5, 2, 1, 2, 'TEE-GRN-S', 699.00, NULL, 30),
(6, 2, 2, 2, 'TEE-GRN-M', 699.00, NULL, 45),
(7, 2, 3, 2, 'TEE-GRN-L', 699.00, NULL, 40),
-- Essential White Tee variants (size S, M, L; color White)
(8, 3, 1, 3, 'TEE-WHT-S', 599.00, NULL, 100),
(9, 3, 2, 3, 'TEE-WHT-M', 599.00, NULL, 150),
(10, 3, 3, 3, 'TEE-WHT-L', 599.00, NULL, 120),
-- Lavender Tee variants (size S, M, L; color Lavender)
(11, 4, 1, 4, 'TEE-LAV-S', 599.00, 749.00, 25),
(12, 4, 2, 4, 'TEE-LAV-M', 599.00, 749.00, 20),
(13, 4, 3, 4, 'TEE-LAV-L', 599.00, 749.00, 30),
-- Sand Beige Tee variants (size S, M, L; color Sand Beige)
(14, 5, 1, 5, 'TEE-BGE-S', 699.00, NULL, 40),
(15, 5, 2, 5, 'TEE-BGE-M', 699.00, NULL, 50),
(16, 5, 3, 5, 'TEE-BGE-L', 699.00, NULL, 45),
-- Deep Teal Tee variants (size S, M, L; color Deep Teal)
(17, 6, 1, 6, 'TEE-TEL-S', 699.00, 899.00, 35),
(18, 6, 2, 6, 'TEE-TEL-M', 699.00, 899.00, 45),
(19, 6, 3, 6, 'TEE-TEL-L', 699.00, 899.00, 40);

-- 8. Seed Product Images
INSERT INTO product_images (product_id, variant_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, NULL, '/images/products/product_black.png', 'Classic Black Tee Primary', 1, TRUE),
(2, NULL, '/images/products/product_green.png', 'Sage Green Tee Primary', 1, TRUE),
(3, NULL, '/images/products/product_white.png', 'Essential White Tee Primary', 1, TRUE),
(4, NULL, '/images/products/product_lavender.png', 'Lavender Tee Primary', 1, TRUE),
(5, NULL, '/images/products/product_beige.png', 'Sand Beige Tee Primary', 1, TRUE),
(6, NULL, '/images/products/product_teal.png', 'Deep Teal Tee Primary', 1, TRUE);

-- 9. Seed Product Categories Relationship
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (1, 5), -- Black Tee in Men, New Arrivals
(2, 1), (2, 5), -- Green Tee in Men, New Arrivals
(3, 4), (3, 5), -- White Tee in Basics, New Arrivals
(4, 2), (4, 5), -- Lavender Tee in Women, New Arrivals
(5, 4), (5, 5), -- Beige Tee in Basics, New Arrivals
(6, 1), (6, 5); -- Teal Tee in Men, New Arrivals

-- 10. Seed Settings (mapped key_name layout)
INSERT INTO settings (key_name, value, type) VALUES
('store.app_name', 'WINVEL', 'string'),
('store.tagline', 'WEAR YOUR VIBE', 'string'),
('store.currency', 'INR', 'string'),
('store.currency_symbol', '₹', 'string'),
('store.free_shipping_threshold', '999', 'number'),
('theme.primary', '#000000', 'color'),
('theme.secondary', '#000000', 'color'),
('theme.accent', '#ffffff', 'color'),
('theme.bg', '#ffffff', 'color'),
('theme.surface', '#ffffff', 'color'),
('theme.text', '#000000', 'color'),
('theme.text_muted', '#666666', 'color'),
('theme.border', '#eeeeee', 'color'),
('theme.radius', '4px', 'string'),
('theme.font_family', 'Inter, system-ui, sans-serif', 'string'),
('theme.auth_banner', '/images/auth_banner.png', 'image');

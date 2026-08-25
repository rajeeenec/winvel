-- WINVEL Production Database Schema
CREATE DATABASE IF NOT EXISTS winvel_db;
USE winvel_db;

-- 1. Roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Role permissions junction
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT UNSIGNED NOT NULL,
  permission_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at DATETIME,
  phone_verified_at DATETIME,
  status ENUM('active','blocked','inactive') NOT NULL DEFAULT 'active',
  last_login_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_role (role_id),
  INDEX idx_users_status (status),
  INDEX idx_users_created (created_at),
  INDEX idx_users_deleted (deleted_at)
);

-- 5. User Addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  address_type ENUM('home','work','other') NOT NULL DEFAULT 'home',
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  landmark VARCHAR(150),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  postal_code VARCHAR(10) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id),
  INDEX idx_addresses_postal (postal_code),
  INDEX idx_addresses_default (is_default)
);

-- 6. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT UNSIGNED,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_categories_parent (parent_id),
  INDEX idx_categories_sort (sort_order),
  INDEX idx_categories_status (status)
);

-- 7. Collections table
CREATE TABLE IF NOT EXISTS collections (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  start_date DATETIME,
  end_date DATETIME,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_collections_dates (start_date, end_date),
  INDEX idx_collections_status (status)
);

-- 8. Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(280) UNIQUE NOT NULL,
  short_description VARCHAR(500),
  description LONGTEXT,
  brand VARCHAR(100) NOT NULL DEFAULT 'WINVEL',
  base_price DECIMAL(10,2) NOT NULL,
  status ENUM('draft','active','inactive','archived') NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_products_name (name),
  INDEX idx_products_price (base_price),
  INDEX idx_products_status (status),
  INDEX idx_products_flags (featured, is_bestseller, is_new),
  INDEX idx_products_created (created_at),
  INDEX idx_products_deleted (deleted_at)
);

-- 9. Sizes master table
CREATE TABLE IF NOT EXISTS sizes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX idx_sizes_sort (sort_order),
  INDEX idx_sizes_status (status)
);

-- 10. Colors master table
CREATE TABLE IF NOT EXISTS colors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  INDEX idx_colors_sort (sort_order),
  INDEX idx_colors_status (status)
);

-- 11. Product Variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  size_id BIGINT UNSIGNED,
  color_id BIGINT UNSIGNED,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT UNSIGNED NOT NULL DEFAULT 5,
  weight_grams INT UNSIGNED,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
  FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL,
  UNIQUE KEY unique_variant_combo (product_id, size_id, color_id),
  INDEX idx_variants_product (product_id),
  INDEX idx_variants_size (size_id),
  INDEX idx_variants_color (color_id),
  INDEX idx_variants_price (price),
  INDEX idx_variants_stock (stock_quantity),
  INDEX idx_variants_status (status)
);

-- 12. Product Images table
CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_images_product (product_id),
  INDEX idx_images_variant (variant_id),
  INDEX idx_images_primary (is_primary),
  INDEX idx_images_sort (sort_order)
);

-- 13. Product Categories relation
CREATE TABLE IF NOT EXISTS product_categories (
  product_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 14. Product Collections relation
CREATE TABLE IF NOT EXISTS product_collections (
  product_id BIGINT UNSIGNED NOT NULL,
  collection_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, collection_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- 15. Carts table
CREATE TABLE IF NOT EXISTS carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  session_id VARCHAR(100),
  status ENUM('active','converted','abandoned') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_carts_user (user_id),
  INDEX idx_carts_session (session_id),
  INDEX idx_carts_status (status)
);

-- 16. Cart Items table
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  INDEX idx_cart_items_cart (cart_id),
  INDEX idx_cart_items_variant (variant_id)
);

-- 17. Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED UNIQUE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. Wishlist Items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wishlist_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_product (wishlist_id, product_id)
);

-- 19. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  maximum_discount DECIMAL(10,2),
  usage_limit INT UNSIGNED,
  usage_per_user INT UNSIGNED NOT NULL DEFAULT 1,
  start_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_dates (start_at, expires_at),
  INDEX idx_coupons_status (status)
);

-- 20. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  shipping_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  coupon_discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
  order_status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned') NOT NULL DEFAULT 'pending',
  notes TEXT,
  placed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_total (total_amount),
  INDEX idx_orders_payment (payment_status),
  INDEX idx_orders_status (order_status),
  INDEX idx_orders_placed (placed_at)
);

-- 21. Coupon Usages table
CREATE TABLE IF NOT EXISTS coupon_usages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  coupon_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  order_id BIGINT UNSIGNED UNIQUE NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_coupon_usages_used (used_at)
);

-- 22. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  variant_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  size_name VARCHAR(20),
  color_name VARCHAR(50),
  image_url VARCHAR(500),
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  INDEX idx_order_items_order (order_id)
);

-- 23. Order Addresses table
CREATE TABLE IF NOT EXISTS order_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  address_type ENUM('billing','shipping') NOT NULL DEFAULT 'shipping',
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  landmark VARCHAR(150),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  postal_code VARCHAR(10) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_addresses_order (order_id),
  INDEX idx_order_addresses_type (address_type)
);

-- 24. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('razorpay','upi','card','netbanking','cod') NOT NULL,
  transaction_id VARCHAR(255),
  gateway_order_id VARCHAR(255),
  gateway_payment_id VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status ENUM('created','pending','success','failed','refunded') NOT NULL DEFAULT 'created',
  gateway_response JSON,
  paid_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_payments_order (order_id),
  INDEX idx_payments_method (payment_method),
  INDEX idx_payments_transaction (transaction_id),
  INDEX idx_payments_gateway (gateway_order_id, gateway_payment_id),
  INDEX idx_payments_status (status)
);

-- 25. Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  courier_name VARCHAR(100),
  tracking_number VARCHAR(150),
  tracking_url VARCHAR(500),
  status ENUM('pending','packed','shipped','in_transit','out_for_delivery','delivered','returned') NOT NULL DEFAULT 'pending',
  shipped_at DATETIME,
  delivered_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_shipments_order (order_id),
  INDEX idx_shipments_tracking (tracking_number),
  INDEX idx_shipments_status (status)
);

-- 26. Order Status History table
CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  status VARCHAR(50) NOT NULL,
  comment TEXT,
  changed_by BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_history_order (order_id),
  INDEX idx_order_history_status (status),
  INDEX idx_order_history_created (created_at)
);

-- 27. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  order_item_id BIGINT UNSIGNED,
  rating TINYINT UNSIGNED NOT NULL,
  title VARCHAR(150),
  comment TEXT,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
  INDEX idx_reviews_product (product_id),
  INDEX idx_reviews_user (user_id),
  INDEX idx_reviews_rating (rating),
  INDEX idx_reviews_status (status)
);

-- 28. Review Images table
CREATE TABLE IF NOT EXISTS review_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  review_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  INDEX idx_review_images_review (review_id)
);

-- 29. OTP Verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED,
  email VARCHAR(255),
  otp_hash VARCHAR(255) NOT NULL,
  purpose ENUM('registration','login','password_reset','email_change') NOT NULL DEFAULT 'registration',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_otp_email (email),
  INDEX idx_otp_purpose (purpose),
  INDEX idx_otp_expires (expires_at)
);

-- 30. Password Resets table
CREATE TABLE IF NOT EXISTS password_resets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_resets_user (user_id),
  INDEX idx_resets_expires (expires_at)
);

-- 31. Banners table
CREATE TABLE IF NOT EXISTS banners (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  image_url VARCHAR(500) NOT NULL,
  mobile_image_url VARCHAR(500),
  button_text VARCHAR(100),
  button_url VARCHAR(500),
  position VARCHAR(50) NOT NULL DEFAULT 'home_hero',
  sort_order INT NOT NULL DEFAULT 0,
  start_at DATETIME,
  end_at DATETIME,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_pos (position),
  INDEX idx_banners_sort (sort_order),
  INDEX idx_banners_dates (start_at, end_at),
  INDEX idx_banners_status (status)
);

-- 32. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  reference_type VARCHAR(50),
  reference_id BIGINT UNSIGNED,
  read_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_read (read_at),
  INDEX idx_notifications_created (created_at)
);

-- 33. Inventory Transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  variant_id BIGINT UNSIGNED NOT NULL,
  type ENUM('purchase','sale','return','adjustment','damage') NOT NULL DEFAULT 'adjustment',
  quantity INT NOT NULL,
  reference_type VARCHAR(50),
  reference_id BIGINT UNSIGNED,
  note VARCHAR(255),
  created_by BIGINT UNSIGNED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_inventory_variant (variant_id),
  INDEX idx_inventory_type (type),
  INDEX idx_inventory_ref (reference_id),
  INDEX idx_inventory_created (created_at)
);

-- 34. Admin Activity Logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  reference_id BIGINT UNSIGNED,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin_logs_user (user_id),
  INDEX idx_admin_logs_action (action),
  INDEX idx_admin_logs_module (module),
  INDEX idx_admin_logs_ref (reference_id),
  INDEX idx_admin_logs_created (created_at)
);

-- 35. Settings table
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(30) NOT NULL DEFAULT 'string',
  updated_by BIGINT UNSIGNED,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Extra table for file-service uploads (Required to keep upload API functional)
CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

USE winvel_db;

-- Theme colors (public — loaded by frontend on startup)
INSERT IGNORE INTO settings (category, setting_key, setting_value, value_type, label, description, is_public) VALUES
('theme', 'primary', '#1a1a2e', 'color', 'Primary Color', 'Main brand color (header, sidebar)', TRUE),
('theme', 'secondary', '#e94560', 'color', 'Secondary Color', 'Accent / CTA buttons', TRUE),
('theme', 'accent', '#0f3460', 'color', 'Accent Color', 'Gradients and highlights', TRUE),
('theme', 'bg', '#f8f9fa', 'color', 'Background', 'Page background', TRUE),
('theme', 'surface', '#ffffff', 'color', 'Surface', 'Cards and panels', TRUE),
('theme', 'text', '#1a1a2e', 'color', 'Text Color', 'Main text', TRUE),
('theme', 'text_muted', '#6c757d', 'color', 'Muted Text', 'Secondary text', TRUE),
('theme', 'border', '#dee2e6', 'color', 'Border Color', 'Borders and dividers', TRUE),
('theme', 'success', '#28a745', 'color', 'Success', 'Success states', TRUE),
('theme', 'warning', '#ffc107', 'color', 'Warning', 'Warning states', TRUE),
('theme', 'danger', '#dc3545', 'color', 'Danger', 'Error / danger states', TRUE),
('theme', 'primary_hover', '#2a2a4e', 'color', 'Primary Hover', 'Primary button hover', TRUE),
('theme', 'secondary_hover', '#d63851', 'color', 'Secondary Hover', 'Secondary button hover', TRUE),
('theme', 'success_bg', '#d4edda', 'color', 'Success Background', 'Success badge background', TRUE),
('theme', 'success_text', '#155724', 'color', 'Success Text', 'Success badge text', TRUE),
('theme', 'warning_bg', '#fff3cd', 'color', 'Warning Background', 'Warning badge background', TRUE),
('theme', 'warning_text', '#856404', 'color', 'Warning Text', 'Warning badge text', TRUE),
('theme', 'danger_bg', '#f8d7da', 'color', 'Danger Background', 'Danger badge background', TRUE),
('theme', 'danger_text', '#721c24', 'color', 'Danger Text', 'Danger badge text', TRUE),
('theme', 'info_bg', '#d1ecf1', 'color', 'Info Background', 'Info badge background', TRUE),
('theme', 'info_text', '#0c5460', 'color', 'Info Text', 'Info badge text', TRUE),
('theme', 'radius', '8px', 'string', 'Border Radius', 'Corner radius for cards/buttons', TRUE),
('theme', 'font_family', 'Inter, system-ui, sans-serif', 'string', 'Font Family', 'App font', TRUE);

-- Store config (public read, admin write)
INSERT IGNORE INTO settings (category, setting_key, setting_value, value_type, label, description, is_public) VALUES
('store', 'logo_url', '', 'image', 'Store Logo', 'Upload store logo (PNG, JPG, SVG)', TRUE),
('store', 'app_name', 'Winvel', 'string', 'App Name', 'Store brand name', TRUE),
('store', 'tagline', 'Premium T-Shirts', 'string', 'Tagline', 'Store tagline', TRUE),
('store', 'currency', 'USD', 'string', 'Currency', 'Currency code', TRUE),
('store', 'currency_symbol', '$', 'string', 'Currency Symbol', 'Display symbol', TRUE),
('store', 'free_shipping_threshold', '50', 'number', 'Free Shipping Min', 'Minimum order for free shipping', TRUE),
('store', 'contact_email', 'support@winvel.com', 'string', 'Contact Email', 'Customer support email', FALSE),
('store', 'tax_rate', '0', 'number', 'Tax Rate (%)', 'Default tax percentage', FALSE);

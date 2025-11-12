-- ============================================
-- DONNÉES DE DÉMONSTRATION SHOPLUX
-- ============================================
-- Ce script insère des données de test dans la base de données
-- Exécutez ce script après avoir créé le schéma principal
-- ============================================

-- Création d'utilisateurs de test
INSERT INTO users (id, email, first_name, last_name, phone, role, loyalty_points) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@shoplux.com', 'Admin', 'User', '+33601020304', 'admin', 1000),
  ('00000000-0000-0000-0000-000000000002', 'customer@shoplux.com', 'Jean', 'Dupont', '+33601020305', 'customer', 500),
  ('00000000-0000-0000-0000-000000000003', 'marie@example.com', 'Marie', 'Martin', '+33601020306', 'customer', 250)
ON CONFLICT (email) DO NOTHING;

-- Création de catégories
INSERT INTO categories (id, name, slug, description, is_active, "order") VALUES
  ('10000000-0000-0000-0000-000000000001', 'Électronique', 'electronique', 'Tous les produits électroniques', true, 1),
  ('10000000-0000-0000-0000-000000000002', 'Mode', 'mode', 'Vêtements et accessoires', true, 2),
  ('10000000-0000-0000-0000-000000000003', 'Maison & Jardin', 'maison-jardin', 'Décoration et jardinage', true, 3),
  ('10000000-0000-0000-0000-000000000004', 'Sports', 'sports', 'Équipements sportifs', true, 4),
  ('10000000-0000-0000-0000-000000000005', 'Smartphones', 'smartphones', 'Téléphones portables', true, 1),
  ('10000000-0000-0000-0000-000000000006', 'Ordinateurs', 'ordinateurs', 'PC et laptops', true, 2)
ON CONFLICT (slug) DO NOTHING;

-- Sous-catégories
UPDATE categories SET parent_id = '10000000-0000-0000-0000-000000000001' 
WHERE id IN ('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000006');

-- Création de produits
INSERT INTO products (id, name, slug, description, short_description, price, compare_at_price, sku, stock, category_id, brand, tags, is_featured, is_new_arrival, status) VALUES
  ('20000000-0000-0000-0000-000000000001', 'iPhone 14 Pro', 'iphone-14-pro', 'Le dernier iPhone avec puce A16 Bionic', 'Smartphone Apple dernière génération', 1199.99, 1299.99, 'IPHONE14PRO', 50, '10000000-0000-0000-0000-000000000005', 'Apple', ARRAY['smartphone', 'apple', 'ios'], true, true, 'active'),
  ('20000000-0000-0000-0000-000000000002', 'MacBook Pro 14"', 'macbook-pro-14', 'MacBook Pro avec puce M2 Pro', 'Ordinateur portable professionnel', 2499.99, 2699.99, 'MACBOOKPRO14', 30, '10000000-0000-0000-0000-000000000006', 'Apple', ARRAY['laptop', 'apple', 'macbook'], true, false, 'active'),
  ('20000000-0000-0000-0000-000000000003', 'Samsung Galaxy S23', 'samsung-galaxy-s23', 'Smartphone Samsung avec écran AMOLED', 'Flagship Samsung', 899.99, 999.99, 'GALAXYS23', 75, '10000000-0000-0000-0000-000000000005', 'Samsung', ARRAY['smartphone', 'samsung', 'android'], false, true, 'active'),
  ('20000000-0000-0000-0000-000000000004', 'Dell XPS 15', 'dell-xps-15', 'Laptop Dell haute performance', 'Ordinateur portable premium', 1899.99, 2099.99, 'DELLXPS15', 40, '10000000-0000-0000-0000-000000000006', 'Dell', ARRAY['laptop', 'dell', 'windows'], true, false, 'active'),
  ('20000000-0000-0000-0000-000000000005', 'AirPods Pro', 'airpods-pro', 'Écouteurs sans fil avec réduction de bruit', 'Écouteurs Apple', 279.99, 299.99, 'AIRPODSPRO', 100, '10000000-0000-0000-0000-000000000001', 'Apple', ARRAY['audio', 'apple', 'écouteurs'], false, false, 'active')
ON CONFLICT (sku) DO NOTHING;

-- Mise à jour des images de produits (JSON)
UPDATE products SET images = '[
  {"url": "https://via.placeholder.com/600x400?text=iPhone+14+Pro", "alt": "iPhone 14 Pro"},
  {"url": "https://via.placeholder.com/600x400?text=iPhone+14+Pro+Back", "alt": "iPhone 14 Pro Back"}
]'::jsonb WHERE slug = 'iphone-14-pro';

UPDATE products SET images = '[
  {"url": "https://via.placeholder.com/600x400?text=MacBook+Pro", "alt": "MacBook Pro"},
  {"url": "https://via.placeholder.com/600x400?text=MacBook+Pro+Side", "alt": "MacBook Pro Side"}
]'::jsonb WHERE slug = 'macbook-pro-14';

-- Création de coupons
INSERT INTO coupons (code, type, value, min_purchase, expires_at, usage_limit, is_active) VALUES
  ('WELCOME10', 'percentage', 10, 50, NOW() + INTERVAL '30 days', 100, true),
  ('SAVE20', 'fixed', 20, 100, NOW() + INTERVAL '60 days', 50, true),
  ('PREMIUM', 'percentage', 15, 200, NOW() + INTERVAL '90 days', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- Création de méthodes de livraison
INSERT INTO shipping_methods (name, description, price, estimated_days_min, estimated_days_max, is_active) VALUES
  ('Standard', 'Livraison standard', 5.99, 3, 5, true),
  ('Express', 'Livraison express', 12.99, 1, 2, true),
  ('Gratuite', 'Livraison gratuite (plus de 100€)', 0, 4, 7, true)
ON CONFLICT DO NOTHING;

-- Création de bannières promotionnelles
INSERT INTO promotional_banners (title, description, image_url, link_url, button_text, position, is_active, start_date, end_date) VALUES
  ('Soldes d''été', 'Jusqu''à -50% sur une sélection d''articles', 'https://via.placeholder.com/1200x400?text=Summer+Sale', '/products', 'Découvrir', 1, true, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days'),
  ('Nouveautés', 'Découvrez nos derniers produits', 'https://via.placeholder.com/1200x400?text=New+Products', '/products?new=true', 'Voir', 2, true, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- Création d'avis pour les produits
INSERT INTO reviews (product_id, user_id, rating, title, comment, verified_purchase) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 5, 'Excellent produit!', 'Le meilleur iPhone que j''ai eu. La caméra est incroyable.', true),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 4, 'Très bon', 'Bon smartphone mais un peu cher.', true),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 5, 'Parfait pour le travail', 'Performance exceptionnelle, écran magnifique.', true),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 4, 'Très satisfait', 'Excellent rapport qualité/prix.', false)
ON CONFLICT DO NOTHING;

-- Création d'adresses
INSERT INTO addresses (user_id, type, first_name, last_name, street, city, state, zip_code, country, phone, is_default) VALUES
  ('00000000-0000-0000-0000-000000000002', 'shipping', 'Jean', 'Dupont', '123 Rue de la Paix', 'Paris', 'Île-de-France', '75001', 'France', '+33601020305', true),
  ('00000000-0000-0000-0000-000000000002', 'billing', 'Jean', 'Dupont', '123 Rue de la Paix', 'Paris', 'Île-de-France', '75001', 'France', '+33601020305', true),
  ('00000000-0000-0000-0000-000000000003', 'shipping', 'Marie', 'Martin', '456 Avenue des Champs', 'Lyon', 'Auvergne-Rhône-Alpes', '69001', 'France', '+33601020306', true)
ON CONFLICT DO NOTHING;

-- Création de commandes exemple
INSERT INTO orders (
  order_number, 
  user_id, 
  items, 
  subtotal, 
  discount, 
  tax, 
  shipping, 
  total, 
  status, 
  payment_status, 
  payment_method,
  shipping_address,
  billing_address
) VALUES (
  'ORD-2024-001',
  '00000000-0000-0000-0000-000000000002',
  '[{"product_id": "20000000-0000-0000-0000-000000000001", "name": "iPhone 14 Pro", "quantity": 1, "price": 1199.99}]'::jsonb,
  1199.99,
  0,
  239.99,
  5.99,
  1445.97,
  'delivered',
  'paid',
  'card',
  '{"first_name": "Jean", "last_name": "Dupont", "street": "123 Rue de la Paix", "city": "Paris", "zip_code": "75001", "country": "France", "phone": "+33601020305"}'::jsonb,
  '{"first_name": "Jean", "last_name": "Dupont", "street": "123 Rue de la Paix", "city": "Paris", "zip_code": "75001", "country": "France", "phone": "+33601020305"}'::jsonb
)
ON CONFLICT (order_number) DO NOTHING;

-- Afficher un résumé
SELECT 'Données de démonstration insérées avec succès!' as message;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as categories_count FROM categories;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as coupons_count FROM coupons;
SELECT COUNT(*) as orders_count FROM orders;
SELECT COUNT(*) as reviews_count FROM reviews;




DELETE FROM public.cart_items;
DELETE FROM public.order_items;
DELETE FROM public.reviews;
DELETE FROM public.products;
DELETE FROM public.categories;

INSERT INTO public.categories (id, name, description, image_url) VALUES
  (gen_random_uuid(), 'Ankara Fabrics', 'Vibrant African wax print fabrics, perfect for elegant fashion.', 'https://images.unsplash.com/photo-1596902852634-6c1e6b6a3f2c?w=800'),
  (gen_random_uuid(), 'Kampala Fabrics', 'Premium tie-dye Kampala fabrics in rich colors and patterns.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'),
  (gen_random_uuid(), 'Bags', 'Stylish and durable bags to complete your look.', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800');

WITH cats AS (SELECT id, name FROM public.categories)
INSERT INTO public.products (name, description, price, compare_at_price, stock, category_id, images, featured)
SELECT * FROM (VALUES
  ('Royal Ankara Wax Print - 6 Yards', 'Authentic Ankara wax print fabric, 6 yards. Perfect for gowns, shirts and traditional attire.', 25000::numeric, 30000::numeric, 50, (SELECT id FROM cats WHERE name='Ankara Fabrics'), ARRAY['https://images.unsplash.com/photo-1596902852634-6c1e6b6a3f2c?w=800'], true),
  ('Ankara Floral Bloom - 6 Yards', 'Bold floral pattern Ankara, ideal for weddings and special occasions.', 22000::numeric, NULL::numeric, 40, (SELECT id FROM cats WHERE name='Ankara Fabrics'), ARRAY['https://images.unsplash.com/photo-1591279119755-d31b21e29a63?w=800'], true),
  ('Ankara Geometric Print - 6 Yards', 'Modern geometric Ankara print, versatile for everyday wear.', 20000::numeric, 24000::numeric, 60, (SELECT id FROM cats WHERE name='Ankara Fabrics'), ARRAY['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800'], false),
  ('Premium Kampala Tie-Dye - 6 Yards', 'Handcrafted Kampala tie-dye fabric in deep indigo and gold.', 28000::numeric, 32000::numeric, 30, (SELECT id FROM cats WHERE name='Kampala Fabrics'), ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'], true),
  ('Kampala Adire Classic - 6 Yards', 'Classic Nigerian Adire Kampala, rich blue with traditional motifs.', 26000::numeric, NULL::numeric, 45, (SELECT id FROM cats WHERE name='Kampala Fabrics'), ARRAY['https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800'], false),
  ('Kampala Sunset Blend - 6 Yards', 'Warm sunset-toned Kampala fabric, soft and luxurious.', 27000::numeric, 30000::numeric, 35, (SELECT id FROM cats WHERE name='Kampala Fabrics'), ARRAY['https://images.unsplash.com/photo-1591086334337-2b3315c1f3a2?w=800'], true),
  ('Elegant Tote Bag', 'Spacious tote bag in premium leather, ideal for daily use.', 15000::numeric, 18000::numeric, 25, (SELECT id FROM cats WHERE name='Bags'), ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'], true),
  ('Classic Handbag', 'Timeless handbag with gold accents to elevate any outfit.', 18000::numeric, NULL::numeric, 20, (SELECT id FROM cats WHERE name='Bags'), ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], false),
  ('Ankara Print Clutch', 'Handmade clutch with vibrant Ankara fabric detailing.', 8500::numeric, 10000::numeric, 40, (SELECT id FROM cats WHERE name='Bags'), ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'], true)
) AS t(name, description, price, compare_at_price, stock, category_id, images, featured);

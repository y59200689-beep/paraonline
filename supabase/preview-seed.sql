-- Isolated Preview fixture. This is deliberately separate from seed.sql.
-- Contains only synthetic public catalogue records and minimal public settings.
-- It must only be applied to an isolated Preview/local Supabase project.

INSERT INTO public.settings (id, value)
VALUES (
  1,
  jsonb_build_object(
    'storeName', 'Para Divine Preview',
    'storePhone', '',
    'storeWhatsApp', '',
    'freeShippingThreshold', 400,
    'shippingFee', 35,
    'quizDiscountPercent', 0,
    'customConcerns', jsonb_build_array(
      jsonb_build_object('id', 'acne', 'keywords', jsonb_build_array('acné', 'imperfection')),
      jsonb_build_object('id', 'spots', 'keywords', jsonb_build_array('tache', 'éclat')),
      jsonb_build_object('id', 'dryness', 'keywords', jsonb_build_array('hydratation', 'sécheresse')),
      jsonb_build_object('id', 'wrinkles', 'keywords', jsonb_build_array('rides', 'ridules')),
      jsonb_build_object('id', 'redness', 'keywords', jsonb_build_array('rougeur'))
    ),
    'homepageSections', jsonb_build_object('sectionOrder', jsonb_build_array()),
    'banners', jsonb_build_array(),
    'faq', jsonb_build_array()
  )
)
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value;

-- 73 synthetic products: three full 24-item pages plus a one-product last page.
-- IDs, names, brands, categories, SKUs, images, descriptions and prices are test data.
INSERT INTO public.products (
  id, title, name, name_fr, vendor, image, images, price, compare_price,
  category, categories, tags, rating, reviews, description, ingredients, usage,
  stock, sku, buying_cost, points, status, is_face_product,
  recommendation_status, routine_roles, suitable_skin_types, suitable_concerns,
  sensitivity_levels, active_strength, time_of_day
)
SELECT
  n,
  format('Produit Preview %s — %s', lpad(n::text, 3, '0'), CASE n % 5
    WHEN 0 THEN 'Sérum hydratant synthétique'
    WHEN 1 THEN 'Crème visage synthétique'
    WHEN 2 THEN 'Nettoyant doux synthétique'
    WHEN 3 THEN 'Soin solaire synthétique'
    ELSE 'Soin éclat synthétique' END),
  format('Preview Product %s', n),
  format('Produit Preview %s', n),
  CASE n % 4 WHEN 0 THEN 'Marque Preview A' WHEN 1 THEN 'Marque Preview B' WHEN 2 THEN 'Marque Preview C' ELSE 'Marque Preview D' END,
  '/images/product-image-fallback.png',
  ARRAY['/images/product-image-fallback.png'],
  CASE WHEN n % 17 = 0 THEN 1800 + n ELSE 80 + (n * 13 % 900) END,
  CASE WHEN n % 6 = 0 THEN 120 + (n * 13 % 900) ELSE CASE WHEN n % 17 = 0 THEN 1800 + n ELSE 80 + (n * 13 % 900) END END,
  CASE n % 5 WHEN 0 THEN 'visage' WHEN 1 THEN 'acne' WHEN 2 THEN 'solaire' WHEN 3 THEN 'hydratation' ELSE 'corps' END,
  ARRAY[
    CASE n % 5 WHEN 0 THEN 'visage' WHEN 1 THEN 'acne' WHEN 2 THEN 'solaire' WHEN 3 THEN 'hydratation' ELSE 'corps' END,
    CASE n % 3 WHEN 0 THEN 'visage' WHEN 1 THEN 'anti-taches' ELSE 'peau-sensible' END
  ],
  CASE n % 4 WHEN 0 THEN ARRAY['visage','niacinamide','taches']::text[] WHEN 1 THEN ARRAY['acné','peau sensible']::text[] WHEN 2 THEN ARRAY['hydratation','hyaluronique']::text[] ELSE ARRAY['solaire','vitamine c']::text[] END,
  -- No synthetic ratings or review counts; keep Preview structured data honest.
  0,
  0,
  format('Description synthétique du produit Preview %s. Contenu public de démonstration pour tester les pages catalogue, filtres et fiches produit.', n),
  CASE n % 3 WHEN 0 THEN 'Niacinamide, glycerin, aqua' WHEN 1 THEN 'Hyaluronic acid, panthenol' ELSE 'Vitamin C, glycerin' END,
  'Donnée de démonstration uniquement.',
  CASE WHEN n % 7 = 0 THEN 0 ELSE 5 + n END,
  format('PREVIEW-SKU-%s', lpad(n::text, 3, '0')),
  NULL,
  0,
  'live',
  n % 5 IN (0, 1, 3),
  'approved',
  CASE n % 4 WHEN 0 THEN ARRAY['cleanser']::text[] WHEN 1 THEN ARRAY['treatment']::text[] WHEN 2 THEN ARRAY['moisturizer']::text[] ELSE ARRAY['sunscreen']::text[] END,
  CASE n % 3 WHEN 0 THEN ARRAY['dry']::text[] WHEN 1 THEN ARRAY['oily']::text[] ELSE ARRAY['combination']::text[] END,
  CASE n % 4 WHEN 0 THEN ARRAY['acne']::text[] WHEN 1 THEN ARRAY['dark_spots']::text[] WHEN 2 THEN ARRAY['dryness']::text[] ELSE ARRAY['redness']::text[] END,
  CASE n % 2 WHEN 0 THEN ARRAY['low']::text[] ELSE ARRAY['medium']::text[] END,
  CASE n % 3 WHEN 0 THEN 'gentle' WHEN 1 THEN 'moderate' ELSE 'strong' END,
  CASE n % 2 WHEN 0 THEN ARRAY['morning']::text[] ELSE ARRAY['evening']::text[] END
FROM generate_series(1, 73) AS n
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, name = EXCLUDED.name, name_fr = EXCLUDED.name_fr,
  vendor = EXCLUDED.vendor, image = EXCLUDED.image, images = EXCLUDED.images,
  price = EXCLUDED.price, compare_price = EXCLUDED.compare_price,
  category = EXCLUDED.category, categories = EXCLUDED.categories, tags = EXCLUDED.tags,
  rating = EXCLUDED.rating, reviews = EXCLUDED.reviews, description = EXCLUDED.description,
  ingredients = EXCLUDED.ingredients, usage = EXCLUDED.usage, stock = EXCLUDED.stock,
  sku = EXCLUDED.sku, buying_cost = EXCLUDED.buying_cost, points = EXCLUDED.points,
  status = EXCLUDED.status, is_face_product = EXCLUDED.is_face_product,
  recommendation_status = EXCLUDED.recommendation_status, routine_roles = EXCLUDED.routine_roles,
  suitable_skin_types = EXCLUDED.suitable_skin_types, suitable_concerns = EXCLUDED.suitable_concerns,
  sensitivity_levels = EXCLUDED.sensitivity_levels, active_strength = EXCLUDED.active_strength,
  time_of_day = EXCLUDED.time_of_day;

-- No code_snippets, marketing flows, customers, orders, payment data,
-- operators, authentication users, or integration credentials are seeded.

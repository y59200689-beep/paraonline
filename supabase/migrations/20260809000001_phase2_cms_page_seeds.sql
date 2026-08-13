-- Phase 2: register all public content routes. Existing hardcoded pages remain
-- the fallback until an admin publishes structured sections for a route.
INSERT INTO cms_pages (slug, page_type, title_fr, title_ar, status, section_order)
VALUES
  ('a-propos', 'about', 'À propos', 'من نحن', 'draft', '[]'::jsonb),
  ('suivi-commande', 'delivery', 'Suivi de commande', 'تتبع الطلب', 'draft', '[]'::jsonb),
  ('checkout-success', 'checkout_success', 'Commande confirmée', 'تم تأكيد الطلب', 'draft', '[]'::jsonb),
  ('checkout-failure', 'checkout_failure', 'Paiement à vérifier', 'يرجى التحقق من الدفع', 'draft', '[]'::jsonb),
  ('politiques/conditions-vente', 'policies', 'Conditions générales de vente', 'شروط البيع العامة', 'draft', '[]'::jsonb),
  ('politiques/confidentialite', 'policies', 'Politique de confidentialité', 'سياسة الخصوصية', 'draft', '[]'::jsonb),
  ('politiques/retours-reclamations', 'policies', 'Retours et réclamations', 'الإرجاع والشكاوى', 'draft', '[]'::jsonb),
  ('customer-portal', 'customer_portal', 'Espace client', 'مساحة العميل', 'draft', '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Phase 3: ordered no-code brand sections. Empty arrays preserve the current
-- visual templates until each migrated brand is reviewed and approved.
ALTER TABLE IF EXISTS cms_brands ADD COLUMN IF NOT EXISTS page_sections JSONB NOT NULL DEFAULT '[]'::jsonb;

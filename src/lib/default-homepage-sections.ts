import type { HomepageSectionItem } from '@/context/SettingsContext';

// Default sections — used only when no CMS homepage record exists.
// Once the admin publishes the homepage, this array is never consulted.
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionItem[] = [
  { id: 'hero-1',                 type: 'hero',                 nameFr: 'Carrousel Héro & Diaporama',             visible: true },
  { id: 'categoryTrack-1',        type: 'categoryTrack',        nameFr: 'Barre de Défilement des Catégories',     visible: true },
  { id: 'productGrid-1',          type: 'productGrid',          nameFr: 'Grille Principale des Produits',         visible: true },
  { id: 'brandPartners-1',        type: 'brandPartners',        nameFr: 'Marques Partenaires',                    visible: true },
  { id: 'diagnosticBanner-1',     type: 'diagnosticBanner',     nameFr: 'Diagnostic de Peau IA',                  visible: false },
  { id: 'summerSale-1',           type: 'summerSale',           nameFr: "Offres d'Été (Summer Sale)",             visible: true },
  { id: 'dermoCorner-1',          type: 'dermoCorner',          nameFr: 'Dermo Corner (Acné vs Taches)',          visible: true },
  { id: 'customerReviews-1',      type: 'customerReviews',      nameFr: 'Témoignages & Avis Clients',             visible: true },
  { id: 'triplePromo-1',          type: 'triplePromo',          nameFr: 'Bannières Triple Promotionnelles',       visible: true },
  { id: 'topRated-1',             type: 'topRated',             nameFr: 'Produits les Mieux Notés',               visible: true },
  { id: 'bestSellers-1',          type: 'bestSellers',          nameFr: 'Produits les Plus Vendus',               visible: true },
  { id: 'routineVisualizer-1',    type: 'routineVisualizer',    nameFr: 'Visualiseur de Routine de Soins',        visible: true },
  { id: 'featuredIngredient-1',   type: 'featuredIngredient',   nameFr: 'Marques Vedettes de la Semaine',         visible: true },
  { id: 'skincareRoutineSteps-1', type: 'skincareRoutineSteps', nameFr: 'Étapes de la Routine Skincare',          visible: true },
  { id: 'activeIngredients-1',    type: 'activeIngredients',    nameFr: 'Molécules & Ingrédients Actifs',         visible: true },
  { id: 'ingredientDictionary-1', type: 'ingredientDictionary', nameFr: 'Dictionnaire Clinique des Ingrédients', visible: true },
  { id: 'faq-1',                  type: 'faq',                  nameFr: 'Foire Aux Questions (FAQ)',              visible: true },
  { id: 'officialDistributor-1',  type: 'officialDistributor',  nameFr: 'Badge Distributeur Officiel',           visible: true },
  { id: 'trustBar-1',             type: 'trustBar',             nameFr: 'Barre de Confiance Maroc',              visible: true },
];

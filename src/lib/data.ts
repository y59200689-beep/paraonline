import ingredientsData from '@/data/ingredients.json';
import faqData from '@/data/faq.json';
import testimonialsData from '@/data/testimonials.json';
import citiesData from '@/data/cities.json';

export interface ProductVariant {
  id: string;
  title: string; // e.g., "30ml", "50ml", "100ml"
  price: number;
  comparePrice?: number;
  stock: number;
}

export interface Product {
  id: number;
  title: string;
  name?: string;
  nameFr?: string;
  vendor: string;
  image: string;
  images: string[];
  price: number;
  comparePrice: number;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  description: string;
  ingredients: string;
  usage: string;
  stock?: number;
  points?: number;
  variants?: ProductVariant[];
  sku?: string;
  buyingCost?: number;
  status?: 'draft' | 'live';
  // SEO fields
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface IngredientInfo {
  icon: string;
  name_fr: string;
  name_ar: string;
  safety_fr: string;
  safety_ar: string;
  desc_fr: string;
  desc_ar: string;
  benefit_fr: string;
  benefit_ar: string;
}

export const PRODUCTS_DB: Product[] = [
    {
        "id": 638,
        "title": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 ANTI TACHES 50 ML  ANTI PIGMENT",
        "name": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 ANTI TACHES 50 ML  ANTI PIGMENT",
        "nameFr": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 ANTI TACHES 50 ML  ANTI PIGMENT",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/1-Packshot.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/1-Packshot.webp"
        ],
        "price": 199.7,
        "comparePrice": 199.7,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 10,
        "description": "Fluide solaire très haute protection SPF 50+ de 50 ml par La Roche-Posay. Formulé pour cibler et corriger les taches pigmentaires induites par les UV tout en unifiant le teint grâce à sa texture fluide teintée.",
        "ingredients": "",
        "usage": "",
        "sku": "116262"
    },
    {
        "id": 639,
        "title": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 X 50 ML",
        "name": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 X 50 ML",
        "nameFr": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE 400 X 50 ML",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/Rp-Anthelios-Fluide-UVMUNE-400-spf50-50mleau-thermale-pack.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/Rp-Anthelios-Fluide-UVMUNE-400-spf50-50mleau-thermale-pack.webp"
        ],
        "price": 185.9,
        "comparePrice": 185.9,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 7,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "449"
    },
    {
        "id": 640,
        "title": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE PEDIATRIQUE 50 ML",
        "name": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE PEDIATRIQUE 50 ML",
        "nameFr": "ANTHELIOS ECRAN 50+ FLUIDE UV MINE PEDIATRIQUE 50 ML",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/la_roche_posay-anthelios_dermo-pediatrics-3337875886307-front-0.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/la_roche_posay-anthelios_dermo-pediatrics-3337875886307-front-0.webp"
        ],
        "price": 196.8,
        "comparePrice": 196.8,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 7,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "115051"
    },
    {
        "id": 641,
        "title": "ANTHELIOS ECRAN BRUME FRAICHE SPRAY SPF50+ 75 ML VISAGE INVISIBLE",
        "name": "ANTHELIOS ECRAN BRUME FRAICHE SPRAY SPF50+ 75 ML VISAGE INVISIBLE",
        "nameFr": "ANTHELIOS ECRAN BRUME FRAICHE SPRAY SPF50+ 75 ML VISAGE INVISIBLE",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/la-roche-posay-anthelios-brume-fraiche-invisible-anti-brillance-spf50-75ml-6.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/la-roche-posay-anthelios-brume-fraiche-invisible-anti-brillance-spf50-75ml-6.webp"
        ],
        "price": 148.3,
        "comparePrice": 148.3,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 0,
        "description": "Brume fraîche solaire invisible SPF 50+ de 75 ml pour le visage par La Roche-Posay. Offre une très haute protection à absorption rapide, idéale pour les retouches en journée, même par-dessus le maquillage.",
        "ingredients": "",
        "usage": "",
        "sku": "108701"
    },
    {
        "id": 642,
        "title": "ANTHELIOS ECRAN LAIT APRES SOLAIRE POST UV 200 ML",
        "name": "ANTHELIOS ECRAN LAIT APRES SOLAIRE POST UV 200 ML",
        "nameFr": "ANTHELIOS ECRAN LAIT APRES SOLAIRE POST UV 200 ML",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/la-roche-posay-la-roche-posay-anthelios-post-uv-200-ml-lotion-apres-soleil-apres-soleil-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/la-roche-posay-la-roche-posay-anthelios-post-uv-200-ml-lotion-apres-soleil-apres-soleil-1.webp"
        ],
        "price": 158.4,
        "comparePrice": 158.4,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 6,
        "description": "Lait après-solaire apaisant et hydratant de 200 ml par La Roche-Posay. Conçu pour nourrir et calmer les sensations d'échauffement de la peau après l'exposition au soleil, restaurant la barrière cutanée.",
        "ingredients": "",
        "usage": "",
        "sku": "116125"
    },
    {
        "id": 643,
        "title": "ANTHELIOS ECRAN MINERAL ONE 50+ T01 T30ML D/E/F",
        "name": "ANTHELIOS ECRAN MINERAL ONE 50+ T01 T30ML D/E/F",
        "nameFr": "ANTHELIOS ECRAN MINERAL ONE 50+ T01 T30ML D/E/F",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/Anthelios_Mineral_One_SPF_50_Tinted_Fac_65779_7055_detail.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/Anthelios_Mineral_One_SPF_50_Tinted_Fac_65779_7055_detail.webp"
        ],
        "price": 170.4,
        "comparePrice": 170.4,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 7,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "114335"
    },
    {
        "id": 644,
        "title": "ANTHELIOS ECRAN MINERAL ONE 50+ T03 T30ML D/E/F",
        "name": "ANTHELIOS ECRAN MINERAL ONE 50+ T03 T30ML D/E/F",
        "nameFr": "ANTHELIOS ECRAN MINERAL ONE 50+ T03 T30ML D/E/F",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/Anthelios_Mineral_One_SPF_50_Tinted_Fac_65779_7055_detail.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/Anthelios_Mineral_One_SPF_50_Tinted_Fac_65779_7055_detail.webp"
        ],
        "price": 170.4,
        "comparePrice": 170.4,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 8,
        "description": "Crème solaire teintée 100% minérale SPF 50+ de 30 ml (teinte 03) par La Roche-Posay. Offre une très haute protection quotidienne tout en assurant une couvrance naturelle et mate pendant 12 heures.",
        "ingredients": "",
        "usage": "",
        "sku": "110707"
    },
    {
        "id": 645,
        "title": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANT INVISIBLE PG 50+ + PROMO",
        "name": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANT INVISIBLE PG 50+ + PROMO",
        "nameFr": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANT INVISIBLE PG 50+ + PROMO",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/mune_dt-2.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/mune_dt-2.webp"
        ],
        "price": 185.9,
        "comparePrice": 185.9,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 7,
        "description": "Gel-crème solaire matifiant et invisible SPF 50+ UVMune 400 par La Roche-Posay. Offre une très haute protection contre les UVA ultra-longs et contrôle les brillances des peaux mixtes à grasses.",
        "ingredients": "",
        "usage": "",
        "sku": "107227"
    },
    {
        "id": 646,
        "title": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANTE TEINTE 50+ PG",
        "name": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANTE TEINTE 50+ PG",
        "nameFr": "ANTHELIOS ECRAN SPF 50+ GEL UV MUNE 400 MATIFIANTE TEINTE 50+ PG",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/la-roche-posay-anthelios-uv-mune-400-oil-control-spf50-colour-50-ml.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/la-roche-posay-anthelios-uv-mune-400-oil-control-spf50-colour-50-ml.webp"
        ],
        "price": 185.9,
        "comparePrice": 185.9,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 11,
        "description": "Gel-crème solaire matifiant teinté SPF 50+ UVMune 400 par La Roche-Posay. Protège efficacement contre les UVA ultra-longs tout en unifiant le teint des peaux mixtes à grasses avec un fini sec.",
        "ingredients": "",
        "usage": "",
        "sku": "5529"
    },
    {
        "id": 647,
        "title": "ANTHELIOS ECRAN SPF 50+ INVISIBLE CREME FONDANTE PSNS + PROMO",
        "name": "ANTHELIOS ECRAN SPF 50+ INVISIBLE CREME FONDANTE PSNS + PROMO",
        "nameFr": "ANTHELIOS ECRAN SPF 50+ INVISIBLE CREME FONDANTE PSNS + PROMO",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/AntheliosFondantepackshotfront-1-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/AntheliosFondantepackshotfront-1-1.webp"
        ],
        "price": 185.9,
        "comparePrice": 185.9,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 10,
        "description": "Crème fondante solaire invisible très haute protection SPF 50+ par La Roche-Posay. Sa texture fondante et hydratante sans traces blanches convient parfaitement aux peaux sèches et sensibles.",
        "ingredients": "",
        "usage": "",
        "sku": "447"
    },
    {
        "id": 648,
        "title": "ANTHELIOS ECRAN SPF 50+ TEINTE BB CREME FONDANTE PSNS",
        "name": "ANTHELIOS ECRAN SPF 50+ TEINTE BB CREME FONDANTE PSNS",
        "nameFr": "ANTHELIOS ECRAN SPF 50+ TEINTE BB CREME FONDANTE PSNS",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/09d97e1b574c76ef5994eb7528f9.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/09d97e1b574c76ef5994eb7528f9.webp"
        ],
        "price": 185.9,
        "comparePrice": 185.9,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 11,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "5888"
    },
    {
        "id": 649,
        "title": "ANTHELIOS ECRAN SPF50+ LAIT DERMOPEDIATRICS 250 ML ULTRA LONG",
        "name": "ANTHELIOS ECRAN SPF50+ LAIT DERMOPEDIATRICS 250 ML ULTRA LONG",
        "nameFr": "ANTHELIOS ECRAN SPF50+ LAIT DERMOPEDIATRICS 250 ML ULTRA LONG",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/LaRochePosay-Product-AntheliosDermoPediatricLotion-3337875888851-ATF-Packshot-Box-1-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/LaRochePosay-Product-AntheliosDermoPediatricLotion-3337875888851-ATF-Packshot-Box-1-1.webp"
        ],
        "price": 343.1,
        "comparePrice": 343.1,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 11,
        "description": "Lait solaire très haute protection SPF 50+ Dermopediatrics de 250 ml par La Roche-Posay. Formule haute tolérance conçue pour protéger la peau fragile et sensible des bébés et des enfants.",
        "ingredients": "",
        "usage": "",
        "sku": "114949"
    },
    {
        "id": 650,
        "title": "ANTHELIOS ECRAN SPF50+ LAIT VISAGE ET CORPS ULTRA LONG 150 ML",
        "name": "ANTHELIOS ECRAN SPF50+ LAIT VISAGE ET CORPS ULTRA LONG 150 ML",
        "nameFr": "ANTHELIOS ECRAN SPF50+ LAIT VISAGE ET CORPS ULTRA LONG 150 ML",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/Rp-Anthelios-Face-body-hydrating-milk-UVMNE-400-spf50-150ml.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/Rp-Anthelios-Face-body-hydrating-milk-UVMNE-400-spf50-150ml.webp"
        ],
        "price": 303,
        "comparePrice": 303,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 6,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "116507"
    },
    {
        "id": 651,
        "title": "ANTHELIOS ECRAN SPF50+ SPRAY AD ULTRA FLUIDE 200 ML",
        "name": "ANTHELIOS ECRAN SPF50+ SPRAY AD ULTRA FLUIDE 200 ML",
        "nameFr": "ANTHELIOS ECRAN SPF50+ SPRAY AD ULTRA FLUIDE 200 ML",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/74168.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/74168.webp"
        ],
        "price": 320,
        "comparePrice": 320,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 11,
        "description": "Spray solaire très haute protection SPF 50+ de 200 ml par La Roche-Posay. Sa texture ultra-fluide et légère s'applique facilement sur tout le corps et résiste efficacement à l'eau et à la transpiration.",
        "ingredients": "",
        "usage": "",
        "sku": "110621"
    },
    {
        "id": 652,
        "title": "ANTHELIOS ECRAN SPF50+ SPRAY ENFANT 400 SPF50",
        "name": "ANTHELIOS ECRAN SPF50+ SPRAY ENFANT 400 SPF50",
        "nameFr": "ANTHELIOS ECRAN SPF50+ SPRAY ENFANT 400 SPF50",
        "vendor": "LA ROCHE POSAY",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/1061354_1.avif",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/1061354_1.avif"
        ],
        "price": 309.1,
        "comparePrice": 309.1,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 9,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "114950"
    },
    {
        "id": 844,
        "title": "ATODERM BAUME LEVRES 15 ML",
        "name": "ATODERM BAUME LEVRES 15 ML",
        "nameFr": "ATODERM BAUME LEVRES 15 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/shop-rt-04540-01-atoderm-restorative-lip-balm-15ml-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/shop-rt-04540-01-atoderm-restorative-lip-balm-15ml-1.webp"
        ],
        "price": 89.82,
        "comparePrice": 89.82,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 6,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "2276"
    },
    {
        "id": 845,
        "title": "ATODERM CREME DOUCHE 1 LITRE",
        "name": "ATODERM CREME DOUCHE 1 LITRE",
        "nameFr": "ATODERM CREME DOUCHE 1 LITRE",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/161236_BIO_ATODERM_CREME_DE_DOUCHE_28130B.png",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/161236_BIO_ATODERM_CREME_DE_DOUCHE_28130B.png"
        ],
        "price": 250.56,
        "comparePrice": 250.56,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 5,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "114015"
    },
    {
        "id": 846,
        "title": "ATODERM CREME MAINS ET ONGLES 50 ML",
        "name": "ATODERM CREME MAINS ET ONGLES 50 ML",
        "nameFr": "ATODERM CREME MAINS ET ONGLES 50 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/171102.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/171102.webp"
        ],
        "price": 101.2,
        "comparePrice": 101.2,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 10,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "111358"
    },
    {
        "id": 847,
        "title": "ATODERM CREME ULTRA 200 ML",
        "name": "ATODERM CREME ULTRA 200 ML",
        "nameFr": "ATODERM CREME ULTRA 200 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/bioderma-atoderm-creme-ultra-hydratante-nourrissante-200ml.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/bioderma-atoderm-creme-ultra-hydratante-nourrissante-200ml.webp"
        ],
        "price": 174.84,
        "comparePrice": 174.84,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 5,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "116946"
    },
    {
        "id": 848,
        "title": "ATODERM GEL DE DOUCHE 1 LITRE",
        "name": "ATODERM GEL DE DOUCHE 1 LITRE",
        "nameFr": "ATODERM GEL DE DOUCHE 1 LITRE",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/images-41.jpeg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/images-41.jpeg"
        ],
        "price": 283.22,
        "comparePrice": 283.22,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 5,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "110367"
    },
    {
        "id": 849,
        "title": "ATODERM GEL DOUCHE 200 ML",
        "name": "ATODERM GEL DOUCHE 200 ML",
        "nameFr": "ATODERM GEL DOUCHE 200 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/shop-bn-00219-01-atoderm-gel-douche-nettoyant-douceur-200ml-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/shop-bn-00219-01-atoderm-gel-douche-nettoyant-douceur-200ml-1.webp"
        ],
        "price": 174.84,
        "comparePrice": 174.84,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 6,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "2277"
    },
    {
        "id": 850,
        "title": "ATODERM GEL DOUCHE 500 ML",
        "name": "ATODERM GEL DOUCHE 500 ML",
        "nameFr": "ATODERM GEL DOUCHE 500 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/71hiW5akDL._AC_UF10001000_QL80_.jpg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/71hiW5akDL._AC_UF10001000_QL80_.jpg"
        ],
        "price": 250.56,
        "comparePrice": 250.56,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 7,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "4362"
    },
    {
        "id": 851,
        "title": "ATODERM HUILE DE DOUCHE 1 LITRE",
        "name": "ATODERM HUILE DE DOUCHE 1 LITRE",
        "nameFr": "ATODERM HUILE DE DOUCHE 1 LITRE",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/atoderm-huile-de-douch-1-lts-_3_.jpg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/atoderm-huile-de-douch-1-lts-_3_.jpg"
        ],
        "price": 327.34,
        "comparePrice": 327.34,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 8,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "110415"
    },
    {
        "id": 852,
        "title": "ATODERM INTENSIVE BAUME 200 ML",
        "name": "ATODERM INTENSIVE BAUME 200 ML",
        "nameFr": "ATODERM INTENSIVE BAUME 200 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/21604413-df13-486c-9234-55508391d464_large.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/21604413-df13-486c-9234-55508391d464_large.webp"
        ],
        "price": 197.72,
        "comparePrice": 197.72,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 8,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "9639"
    },
    {
        "id": 853,
        "title": "ATODERM INTENSIVE BAUME 75 ML",
        "name": "ATODERM INTENSIVE BAUME 75 ML",
        "nameFr": "ATODERM INTENSIVE BAUME 75 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma-atoderm-intensive-baume-dry-irritated-atopic-skin-75ml_1.avif",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma-atoderm-intensive-baume-dry-irritated-atopic-skin-75ml_1.avif"
        ],
        "price": 141.35,
        "comparePrice": 141.35,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 12,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "1477"
    },
    {
        "id": 854,
        "title": "ATODERM INTENSIVE CONTOUR YEUX 100 ML",
        "name": "ATODERM INTENSIVE CONTOUR YEUX 100 ML",
        "nameFr": "ATODERM INTENSIVE CONTOUR YEUX 100 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/dlRBblhZTE5qN3Jo.jpg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/dlRBblhZTE5qN3Jo.jpg"
        ],
        "price": 211.51,
        "comparePrice": 211.51,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 8,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "111436"
    },
    {
        "id": 855,
        "title": "ATODERM INTENSIVE GEL CREME  500 ML",
        "name": "ATODERM INTENSIVE GEL CREME  500 ML",
        "nameFr": "ATODERM INTENSIVE GEL CREME  500 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma_atoderm_intensive_gel-creme_500_1_1.jpg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma_atoderm_intensive_gel-creme_500_1_1.jpg"
        ],
        "price": 331.01,
        "comparePrice": 331.01,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 12,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "1265"
    },
    {
        "id": 856,
        "title": "ATODERM INTENSIVE GEL CREME 200 ML",
        "name": "ATODERM INTENSIVE GEL CREME 200 ML",
        "nameFr": "ATODERM INTENSIVE GEL CREME 200 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma_atoderm_intensive_gel-creme_200_1_1_1.jpg",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma_atoderm_intensive_gel-creme_200_1_1_1.jpg"
        ],
        "price": 236.01,
        "comparePrice": 236.01,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 5,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "111435"
    },
    {
        "id": 857,
        "title": "ATODERM INTENSIVE GEL MOUSSANT 1 LITRE",
        "name": "ATODERM INTENSIVE GEL MOUSSANT 1 LITRE",
        "nameFr": "ATODERM INTENSIVE GEL MOUSSANT 1 LITRE",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma-atoderm-intensive-gel-moussant-ultra-rich-foaming-gel-1l_3_1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2025/12/bioderma-atoderm-intensive-gel-moussant-ultra-rich-foaming-gel-1l_3_1.webp"
        ],
        "price": 211.51,
        "comparePrice": 211.51,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 12,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "113649"
    },
    {
        "id": 858,
        "title": "ATODERM INTENSIVE GEL MOUSSANT 200 ML",
        "name": "ATODERM INTENSIVE GEL MOUSSANT 200 ML",
        "nameFr": "ATODERM INTENSIVE GEL MOUSSANT 200 ML",
        "vendor": "BIODERMA",
        "image": "https://paraofficinal.store/wp-content/uploads/2026/01/Atoderm-Intensive-Gel-Moussant-Nettoyant-Surgras-500ml-3401560969757-bioderma-2-300x300-1.webp",
        "images": [
            "https://paraofficinal.store/wp-content/uploads/2026/01/Atoderm-Intensive-Gel-Moussant-Nettoyant-Surgras-500ml-3401560969757-bioderma-2-300x300-1.webp"
        ],
        "price": 130.66,
        "comparePrice": 130.66,
        "category": "visage",
        "tags": [],
        "rating": 5,
        "reviews": 5,
        "description": "",
        "ingredients": "",
        "usage": "",
        "sku": "2278"
    }
];

export const INGREDIENTS_GLOSSARY = ingredientsData as Record<string, IngredientInfo>;

export const TESTIMONIALS = testimonialsData as Array<{
  rating: number;
  text_fr: string;
  text_ar: string;
  author: string;
  city: string;
}>;

export const FAQ_ITEMS = faqData as Array<{
  question_fr: string;
  question_ar: string;
  answer_fr: string;
  answer_ar: string;
}>;

export const MOROCCAN_CITIES = citiesData as Array<{
  value: string;
  labelFr: string;
  labelAr: string;
}>;

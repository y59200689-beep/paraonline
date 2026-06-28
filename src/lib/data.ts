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
        id: 1,
        title: "Garnier Super UV Cooling Gel Solaire 30ml",
        name: "Garnier Super UV Cooling Gel 30ml",
        nameFr: "Garnier Super UV Gel Solaire Rafraîchissant 30ml",
        vendor: "Garnier",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 49.00,
        comparePrice: 59.00,
        category: "garnier",
        tags: [
            "visage",
            "solaire",
            "homme",
            "sport"
        ],
        rating: 4.8,
        reviews: 14,
        description: "Ce fluide photoprotecteur haute performance offre une très haute protection SPF 50+ contre les rayonnements UVA et UVB, prévenant activement le photovieillissement prématuré. Sa formule intègre un agent cryogène assurant un rafraîchissement épidermique immédiat de la barrière cutanée. Sa texture hydro-dispersible pénètre instantanément sans laisser de film lipidique occlusif ou de traces blanchâtres.",
        ingredients: "Aqua / Water, Alcohol Denat., Diisopropyl Sebacate, Silica, Isopropyl Myristate, Ethylhexyl Salicylate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Butyl Methoxydibenzoylmethane, Glycerin, Menthol, Tocopherol, Caprylyl Glycol, Hydrolyzed Rice Protein, Hydroxyethylcellulose, Trisodium Ethylenediamine Disuccinate.",
        usage: "Appliquer uniformément sur l'ensemble du visage et du cou vingt minutes avant l'exposition solaire. Renouveler l'application toutes les deux heures pour maintenir l'indice de photoprotection, particulièrement après sudation ou baignade.",
        sku: "SKU-GARNIER-001",
        buyingCost: 29
    },
    {
        id: 2,
        title: "Garnier Super UV Invisible Serum Sunscreen SPF 50",
        name: "Garnier Super UV Invisible Serum Sunscreen SPF 50",
        nameFr: "Garnier Sérum Solaire Invisible Super UV SPF 50",
        vendor: "Garnier",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop"
        ],
        price: 69.00,
        comparePrice: 89.00,
        category: "garnier",
        tags: [
            "visage",
            "solaire"
        ],
        rating: 4.9,
        reviews: 28,
        description: "Formulation dermo-cosmétique avancée sous forme de sérum ultra-fluide offrant une photoprotection SPF 50+ PA++++. Conçu pour lutter contre les dommages cellulaires profonds induits par les rayons UVA longs, ce sérum intègre des agents hydratants biomimétiques qui renforcent l'intégrité de la barrière épidermique. Offre un fini parfaitement imperceptible et mat, constituant une excellente base de préparation cutanée avant maquillage.",
        ingredients: "Aqua / Water, Alcohol Denat., Diisopropyl Sebacate, Silica, Isopropyl Myristate, Ethylhexyl Salicylate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Butyl Methoxydibenzoylmethane, Glycerin, C12-22 Alkyl Acrylate/Hydroxyethylacrylate Copolymer, Drometrizole Trisiloxane, Perlite, Caprylyl Glycol, Tocopherol.",
        usage: "Agiter vigoureusement le flacon pour homogénéiser la formule. Appliquer quotidiennement le matin comme dernière étape du protocole de soin. Étaler délicatement de l'intérieur vers l'extérieur du visage."
    ,
        sku: "SKU-GARNIER-001",
        buyingCost: 29
    },
    {
        id: 3,
        title: "Garnier Fast Bright Booster Serum 30ml",
        name: "Garnier Fast Bright Serum 30ml",
        nameFr: "Garnier Sérum Booster Éclat Rapide Vitamine C 30ml",
        vendor: "Garnier",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop"
        ],
        price: 119.00,
        comparePrice: 139.00,
        category: "garnier",
        tags: [
            "visage"
        ],
        rating: 4.6,
        reviews: 19,
        description: "Sérum correcteur hautement concentré en Vitamine C dermo-active, enrichi en Niacinamide sébo-régulateur et en Acide Salicylique exfoliant. Ce soin cible de manière sélective l'hyperpigmentation et les désordres pigmentaires pour lisser le grain de peau et restaurer la luminosité naturelle du teint tout en favorisant le renouvellement cellulaire.",
        ingredients: "Aqua / Water, Glycerin, Alcohol, Dipropylene Glycol, Butylene Glycol, Niacinamide, PEG/PPG/Polybutylene Glycol-8/5/3 Glycerin, 3-O-Ethyl Ascorbic Acid (Vitamin C), Salicylic Acid, Citrus Limon Fruit Extract / Lemon Fruit Extract, Phenoxyethanol, Sodium Hyaluronate, Tocopheryl Acetate, Linalool, Limonene, Parfum.",
        usage: "Appliquer matin et soir trois à quatre gouttes sur un épiderme préalablement purifié. Effectuer de légers tapotements pour stimuler la micro-circulation. L'application d'un écran solaire SPF de haute protection est requise en journée.",
        sku: "SKU-GARNIER-003",
        buyingCost: 71
    },
    {
        id: 4,
        title: "Garnier Super UV Invisible Air-Mist Sunscreen 75ml",
        name: "Garnier Super UV Invisible Air-Mist Sunscreen 75ml",
        nameFr: "Garnier Brume Solaire Protectrice Super UV Invisible 75ml",
        vendor: "Garnier",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 139.00,
        comparePrice: 169.00,
        category: "garnier",
        tags: [
            "visage",
            "solaire",
            "corps",
            "homme",
            "sport"
        ],
        rating: 4.7,
        reviews: 22,
        description: "Brume de photoprotection à diffusion micro-aérée garantissant un bouclier invisible SPF 50 contre les rayonnements ultraviolets et le dépôt de particules polluantes. Sa formule légère s'adapte parfaitement au rythme urbain et sportif, créant une barrière matifiante non occlusive.",
        ingredients: "Butane, Aqua / Water, Homosalate, Octocrylene, Glycerin, Dimethicone, Ethylhexyl Salicylate, Dicaprylyl Carbonate, Nylon-12, Methyl Methacrylate Crosspolymer, Cyclohexasiloxane, d-Limonene, Benzyl Salicylate, Tocopherol, Phenoxyethanol, Caprylyl Glycol, Parfum / Fragrance.",
        usage: "Agiter énergiquement avant emploi. Fermer les yeux et la bouche. Vaporiser de manière homogène à une distance minimale de 15 centimètres sur l'ensemble du visage et du cou. Renouveler au cours de la journée."
    ,
        sku: "SKU-GARNIER-003",
        buyingCost: 71
    },
    {
        id: 5,
        title: "Hada Labo Tokyo Absolute Smoothing & Moisturizing Cream 50ml",
        name: "Hada Labo Tokyo Absolute Smoothing & Moisturizing Cream 50ml",
        nameFr: "Hada Labo Tokyo Crème Hydratante & Lissante Absolue 50ml",
        vendor: "Hada Labo Tokyo",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 209.00,
        comparePrice: 259.00,
        category: "hadalabo",
        tags: [
            "visage"
        ],
        rating: 4.8,
        reviews: 31,
        description: "Crème de soin hautement hydratante intégrant le complexe japonais exclusif Super Hyaluronic Acid. Conçue pour restaurer l'homéostasie hydrique de la peau, elle comble de l'intérieur les ridules de déshydratation, améliorant visiblement la texture cutanée. Cette édition inclut un accessoire d'officine (trousse de soin élégante).",
        ingredients: "Aqua, Glycerin, Dipropylene Glycol, Squalane, Diglycerin, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Sodium Acetylated Hyaluronate, Carbomer, Dimethicone, Disodium EDTA, Phytosteryl/Octyldodecyl Lauroyl Glutamate, Methylparaben.",
        usage: "Appliquer matin et soir sur un visage parfaitement propre et tonifié. Effectuer des mouvements d'effleurage doux de bas en haut pour favoriser l'absorption des principes actifs.",
        sku: "SKU-HADALABOTOKYO-005",
        buyingCost: 125
    },
    {
        id: 6,
        title: "Hada Labo Tokyo Intense Hydrating Skin-Plump Gel 50ml",
        name: "Hada Labo Tokyo Intense Hydrating Skin-Plump Gel 50ml",
        nameFr: "Hada Labo Tokyo Gel-Crème Hydratation & Repulpant Intense 50ml",
        vendor: "Hada Labo Tokyo",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop"
        ],
        price: 219.00,
        comparePrice: 269.00,
        category: "hadalabo",
        tags: [
            "visage",
            "masques"
        ],
        rating: 4.9,
        reviews: 44,
        description: "Formulation hybride avancée associant la légèreté d'un gel-crème et la concentration d'un sérum. Sa formule enrichie en Super Hyaluronic Acid, collagène dermo-assimilable et arginine favorise la régénération cellulaire globale et repulpe l'épiderme fatigué pour un fini éclatant. Livré avec un accessoire de toilette de marque.",
        ingredients: "Aqua, Butylene Glycol, Glycerin, Hydroxyethyl Urea, Pentylene Glycol, PPG-10 Methyl Glucose Ether, Triethylhexanoin, Ammonium Acryloyldimethyltaurate/VP Copolymer, Hydrolyzed Hyaluronic Acid, Sodium Hyaluronate, Hydrolyzed Collagen, Arginine.",
        usage: "Appliquer généreusement matin et soir sur les zones cibles du visage et du cou. Peut également s'utiliser en masque de nuit en couche plus épaisse pour un traitement réparateur intensif."
    ,
        sku: "SKU-HADALABOTOKYO-005",
        buyingCost: 125
    },
    {
        id: 7,
        title: "Hada Labo Tokyo Premium Lotion Intense 7XHA Super Deep Hydrator 150ml",
        name: "Hada Labo Tokyo Premium Lotion Intense 7XHA Super Deep Hydrator 150ml",
        nameFr: "Hada Labo Tokyo Premium Lotion Hydratante Intense 7XHA 150ml",
        vendor: "Hada Labo Tokyo",
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop"
        ],
        price: 189.00,
        comparePrice: 239.00,
        category: "hadalabo",
        tags: [
            "visage"
        ],
        rating: 5.0,
        reviews: 57,
        description: "Soin préparateur haut de gamme et pilier de l'hydratation dermatologique japonaise. Cette lotion gélifiée intègre sept formes complémentaires d'acides hyaluroniques de poids moléculaires distincts afin de saturer en eau toutes les couches de l'épiderme, tout en optimisant l'absorption des soins ultérieurs. Livrée avec sa trousse beauté.",
        ingredients: "Aqua, Glycerin, Butylene Glycol, Pentylene Glycol, Sodium Hyaluronate, Hydrolyzed Sodium Hyaluronate, Sodium Acetylated Hyaluronate, Hydroxypropyltrimonium Hyaluronate, Sodium Hyaluronate Crosspolymer, Hydrolyzed Hyaluronic Acid, Lactococcus/Hyaluronic Acid Ferment Filtrate.",
        usage: "Verser quelques gouttes dans le creux des mains préalablement lavées, puis presser délicatement sur le visage et le cou. Éviter l'utilisation d'un coton pour limiter la perte de formule.",
        sku: "SKU-HADALABOTOKYO-007",
        buyingCost: 113
    },
    {
        id: 8,
        title: "Hada Labo Tokyo Wrinkle Reducer Anti-Aging Day Cream 50ml",
        name: "Hada Labo Tokyo Anti-Aging Day Cream Wrinkle Reducer 50ml",
        nameFr: "Hada Labo Tokyo Crème de Jour Anti-Âge Réductrice de Rides 50ml",
        vendor: "Hada Labo Tokyo",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 229.00,
        comparePrice: 279.00,
        category: "hadalabo",
        tags: [
            "visage",
            "homme"
        ],
        rating: 4.8,
        reviews: 26,
        description: "Traitement restructurant ciblant spécifiquement la sénescence cutanée. Sa formule associe le complexe Super Hyaluronic Acid à un palmitate de rétinol stabilisé et à du collagène marin d'une excellente biodisponibilité. Accélère la synthèse d'élastine et de collagène endogène pour regalber l'ovale du visage. Coffret exclusif avec trousse.",
        ingredients: "Aqua, Glycerin, Butylene Glycol, Caprylic/Capric Triglyceride, Simmondsia Chinensis Seed Oil, Retinyl Palmitate (Retinol), Hydrolyzed Collagen, Sodium Acetylated Hyaluronate, Sodium Hyaluronate, Beta-Carotene, Tocopherol, Pentylene Glycol.",
        usage: "Appliquer chaque matin sur l'ensemble du visage, du cou et du décolleté propres. Réaliser des pressions fermes et des mouvements lissants ascendants."
    ,
        sku: "SKU-HADALABOTOKYO-007",
        buyingCost: 113
    },
    {
        id: 9,
        title: "Bioderma Photoderm XDefense Ultra Fluide SPF50+ Invisible 40ml",
        name: "Bioderma Photoderm XDefense Ultra Fluid SPF50+ Invisible 40ml",
        nameFr: "Bioderma Photoderm XDefense Ultra Fluide SPF50+ Invisible 40ml",
        vendor: "Bioderma",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop"
        ],
        price: 169.00,
        comparePrice: 191.00,
        category: "offers",
        tags: [
            "visage",
            "solaire",
            "sport"
        ],
        rating: 4.9,
        reviews: 35,
        description: "Formulation protectrice brevetée Sun Active Defense offrant une défense biologique contre les altérations causées par le spectre des UVA courts et longs. Sa texture ultra-fluide fusionne parfaitement avec la structure cutanée, laissant un fini imperceptible et non gras. Ce pack d'été comprend un sac cabas exclusif de la marque.",
        ingredients: "Aqua/Water/Eau, Dicaprylyl Carbonate, Octocrylene, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol [Nano], Butyl Methoxydibenzoylmethane, Glycerin, Methyl Methacrylate Crosspolymer, Ectoin, Mannitol, Xylitol, Rhamnose, Fructooligosaccharides.",
        usage: "Appliquer généreusement sur la zone du visage et du cou avant de s'exposer. Renouveler impérativement l'application après baignade, frottement mécanique ou sudation.",
        sku: "SKU-BIODERMA-009",
        buyingCost: 101
    },
    {
        id: 10,
        title: "Embryolisse Lait-Crème Concentré 75ml",
        name: "Embryolisse Lait-Crème Concentré 75ml",
        nameFr: "Embryolisse Lait-Crème Concentré 75ml",
        vendor: "Embryolisse",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 199.00,
        comparePrice: 239.00,
        category: "offers",
        tags: [
            "visage",
            "corps",
            "bebe",
            "masques"
        ],
        rating: 4.8,
        reviews: 48,
        description: "Soin dermatologique polyvalent 6-en-1 de renommée mondiale. Formulé à base d'acides gras essentiels et de vitamines naturelles, il assure simultanément les fonctions de crème hydratante, de base lissante de maquillage, de lait démaquillant physiologique, de masque nourrissant et de soin après-rasage apaisant. Offert dans un coffret exclusif.",
        ingredients: "Aqua, Paraffinum Liquidum, Stearic Acid, Palmitic Acid, Glyceryl Stearate SE, Triethanolamine, Cera Alba (Beeswax), Cetyl Palmitate, Butyrospermum Parkii (Shea Butter), 1,2-Hexanediol, Caprylyl Glycol, Steareth-10, Polyacrylamide, Aloe Barbadensis Leaf Extract.",
        usage: "Prélever une petite quantité et masser délicatement sur le visage et le cou propres en base ou soin protecteur. Pour l'utiliser en masque réparateur, appliquer en couche épaisse et laisser poser 15 minutes."
    ,
        sku: "SKU-EMBRYOLISSE-009",
        buyingCost: 101
    },
    {
        id: 11,
        title: "Nivea Sun Spray Solaire Protecteur & Hydratant SPF50+ 200ml",
        name: "Nivea Sun Protect & Moisture SPF50+ Spray 200ml",
        nameFr: "Nivea Sun Spray Solaire Protecteur & Hydratant SPF50+ 200ml",
        vendor: "Nivea Sun",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 149.00,
        comparePrice: 189.00,
        category: "offers",
        tags: [
            "corps",
            "solaire",
            "homme",
            "sport",
            "bebe"
        ],
        rating: 4.7,
        reviews: 17,
        description: "Brume corporelle de photoprotection combinant des filtres UVA/UVB à large spectre à un complexe hydratant dermo-protecteur 48h. Aide à neutraliser le stress oxydatif induit par le soleil tout en préservant le confort épidermique. Sa formule résiste à l'eau.",
        ingredients: "Aqua, Homosalate, Glycerin, Alcohol Denat., Butyl Methoxydibenzoylmethane, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Ethylhexyl Salicylate, Dibutyl Adipate, Copernicia Cerifera Cera, Panthenol, Silica, VP/Hexadecene Copolymer, Tocopheryl Acetate.",
        usage: "Agiter vigoureusement avant emploi. Vaporiser généreusement sur les zones du corps avant exposition. Ne pas orienter le spray directement vers les yeux. Répartir uniformément.",
        sku: "SKU-NIVEASUN-011",
        buyingCost: 89
    },
    {
        id: 12,
        title: "Maybelline Mascara Lash Sensational Sky High Noir",
        name: "Maybelline Lash Sensational Sky High Mascara Black",
        nameFr: "Maybelline Mascara Lash Sensational Sky High Noir",
        vendor: "Maybelline",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 119.00,
        comparePrice: 149.00,
        category: "offers",
        tags: [
            "maquillage"
        ],
        rating: 4.8,
        reviews: 62,
        description: "Mascara haute définition formulé à base d'extraits de bambou fortifiants et de fibres dermo-compatibles. Sa brosse exclusive Flex Tower épouse parfaitement l'anatomie ciliaire pour allonger intensément sans surcharger ni créer de paquets.",
        ingredients: "Aqua / Water / Eau, Propylene Glycol, Styrene/Acrylates/Ammonium Methacrylate Copolymer, Polyurethane-35, Cera Alba / Beeswax / Cire Dabeille, Synthetic Fluorphlogopite, Glyceryl Stearate, Cetyl Alcohol, PEG-200 Glycol, Copernicia Cerifera Cera / Carnauba Wax.",
        usage: "Positionner la brosse à la base des cils et étirer vers le haut en effectuant de légers mouvements horizontaux de zigzag. Renouveler l'application pour moduler le volume."
    ,
        sku: "SKU-MAYBELLINE-011",
        buyingCost: 89
    },
    {
        id: 13,
        title: "Beauty of Joseon Relief Sun Rice Probiotics SPF 50+",
        name: "Beauty of Joseon Relief Sun Rice Probiotics SPF 50+",
        nameFr: "Beauty of Joseon Relief Sun Riz + Probiotiques Écran Solaire SPF 50+",
        vendor: "Beauty of Joseon",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop"
        ],
        price: 229.00,
        comparePrice: 320.00,
        category: "kbeauty",
        tags: [
            "visage",
            "solaire",
            "sport"
        ],
        rating: 4.9,
        reviews: 142,
        description: "Soin photoprotecteur biologique de pointe formulé avec 30% d'extraits de riz et de ferments de céréales (probiotiques). Cet écran assure une haute protection SPF 50+ PA++++ tout en nourrissant et en renforçant activement le microbiome cutané. Sa texture légère, similaire à une crème de jour fondante, pénètre sans fini gras ni effet blanc.",
        ingredients: "Water, Oryza Sativa (Rice) Extract (30%), Glycerin, Methylpropanediol, Niacinamide, Portulaca Oleracea Extract, Saccharomyces/Rice Ferment Filtrate, Lactobacillus/Pumpkin Ferment Extract, Monascus/Rice Ferment, Adenosine, Silica, Tocopherol.",
        usage: "Appliquer généreusement et de manière uniforme sur le visage et le cou comme dernière étape de votre rituel matinal. Excellente compatibilité avec le maquillage.",
        sku: "SKU-BEAUTYOFJOSEON-013",
        buyingCost: 137
    },
    {
        id: 14,
        title: "Anua Niacinamide 10% + TXA 4% Dark Spot Correcting Serum 30ml",
        name: "Anua Niacinamide 10% + TXA 4% Dark Spot Correcting Serum 30ml",
        nameFr: "Anua Sérum Correcteur Niacinamide 10% + TXA 4% Anti-Taches 30ml",
        vendor: "Anua",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop"
        ],
        price: 289.00,
        comparePrice: 320.00,
        category: "kbeauty",
        tags: [
            "visage"
        ],
        rating: 4.8,
        reviews: 79,
        description: "Traitement ciblé intensif de l'hyperpigmentation cutanée. Associe synergiquement 10% de Niacinamide et 4% d'Acide Tranexamique (TXA) pour bloquer la synthèse et le transfert mélanique anormal. Idéal pour estomper les marques érythémateuses post-acnéiques et réguler les dysfonctionnements sébacés.",
        ingredients: "Water, Niacinamide (10%), Tranexamic Acid (4%), Butylene Glycol, Glycerin, Arbutin, 1,2-Hexanediol, Sodium Hyaluronate, Centella Asiatica Extract, Glutathione, Allantoin, Panthenol, Dipotassium Glycyrrhizate, Ethylhexylglycerin.",
        usage: "Appliquer trois à quatre gouttes matin et soir sur un visage propre et tonifié. Tapoter doucement. L'utilisation d'une haute protection solaire en journée est impérative."
    ,
        sku: "SKU-ANUA-013",
        buyingCost: 137
    },
    {
        id: 15,
        title: "Anua Heartleaf Pore Control Cleansing Oil 200ml",
        name: "Anua Heartleaf Pore Control Cleansing Oil 200ml",
        nameFr: "Anua Huile Nettoyante Régulatrice des Pores Heartleaf 200ml",
        vendor: "Anua",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop"
        ],
        price: 260.00,
        comparePrice: 360.00,
        category: "kbeauty",
        tags: [
            "visage",
            "homme"
        ],
        rating: 4.9,
        reviews: 98,
        description: "Huile démaquillante et purifiante dermo-physiologique formulée à base d'extraits d'Heartleaf (Houttuynia Cordata) pour dissoudre sélectivement les lipides sébacés oxydés, le maquillage résistant et les impuretés microscopiques. Sa formule prévient activement les comédons et apaise les réactions épidermiques.",
        ingredients: "Ethylhexyl Palmitate, Sorbeth-30 Tetraoleate, Houttuynia Cordata Extract, Simmondsia Chinensis (Jojoba) Seed Oil, Olea Europaea (Olive) Fruit Oil, Vitis Vinifera (Grape) Seed Oil, Macadamia Integrifolia Seed Oil, Tocopherol, Water, Butylene Glycol.",
        usage: "Sur peau et mains sèches, masser délicatement en mouvements circulaires. Émulsionner en ajoutant de l'eau tiède pour former un lait fluide, puis rincer abondamment à l'eau claire.",
        sku: "SKU-ANUA-015",
        buyingCost: 156
    },
    {
        id: 16,
        title: "Skin1004 Madagascar Centella Tone Brightening Capsule Ampoule 100ml",
        name: "Skin1004 Madagascar Centella Tone Brightening Capsule Ampoule 100ml",
        nameFr: "Skin1004 Madagascar Centella Ampoule Capsule Éclaircissante 100ml",
        vendor: "Skin1004",
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=320&auto=format&fit=crop"
        ],
        price: 269.00,
        comparePrice: 370.00,
        category: "kbeauty",
        tags: [
            "visage",
            "masques"
        ],
        rating: 4.7,
        reviews: 54,
        description: "Traitement intensif hautement concentré en extraits purifiés de Centella Asiatica de Madagascar (77%). Intègre la technologie brevetée Madawhite encapsulée, libérant ses agents éclaircissants lors de l'application pour estomper les taches de mélanine et réparer les épidermes sensibilisés.",
        ingredients: "Centella Asiatica Extract (77%), Butylene Glycol, Niacinamide, Glycerin, 1,2-Hexanediol, Tranexamic Acid, Madecassoside (Capsules), Biosaccharide Gum-1, Ethylhexylglycerin, Xanthan Gum, Citric Acid, Sodium Citrate.",
        usage: "Prélever une dose complète à l'aide de la pipette et appliquer sur le visage préalablement purifié. Masser délicatement pour rompre les capsules actives."
    ,
        sku: "SKU-SKIN1004-015",
        buyingCost: 156
    },
    {
        id: 17,
        title: "Skin1004 Madagascar Centella Hyalu-Cica Water-Fit Sun Serum SPF50+ 50ml",
        name: "Skin1004 Madagascar Centella Hyalu-Cica Water-Fit Sun Serum SPF50+ 50ml",
        nameFr: "Skin1004 Madagascar Centella Hyalu-Cica Sérum Solaire Water-Fit SPF50+ 50ml",
        vendor: "Skin1004",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 209.00,
        comparePrice: 320.00,
        category: "kbeauty",
        tags: [
            "visage",
            "solaire"
        ],
        rating: 5.0,
        reviews: 112,
        description: "Formulation solaire organique de pointe à index SPF 50+ PA++++. Associe de la Centella Asiatica apaisante et de l'acide hyaluronique multi-poids pour hydrater intensément tout en protégeant contre le rayonnement nocif. Sa formule hydro-dispersible ne laisse aucun fini blanc ou résidu.",
        ingredients: "Water, Centella Asiatica Extract (38%), Glycerin, Didiethylamino Hydroxybenzoyl Hexyl Benzoate, Ethylhexyl Triazone, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, Sodium Hyaluronate, Hyaluronic Acid, Hydrolyzed Hyaluronic Acid.",
        usage: "Appliquer généreusement sur le visage et le cou le matin après le rituel de soin quotidien et avant l'exposition.",
        sku: "SKU-SKIN1004-017",
        buyingCost: 125
    },
    {
        id: 18,
        title: "Kérastase Elixir Ultime L'Huile Originale Sublimatrice 100ml",
        name: "Kerastase Elixir Ultime L'Huile Originale 100ml",
        nameFr: "Kérastase Elixir Ultime L'Huile Originale Sublimatrice Cheveux 100ml",
        vendor: "Kérastase",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=320&auto=format&fit=crop"
        ],
        price: 450.00,
        comparePrice: 490.00,
        category: "offers",
        tags: [
            "cheveux"
        ],
        rating: 4.9,
        reviews: 87,
        description: "Élixir capillaire d'exception formulé à base d'huiles végétales précieuses (Marula, Camélia et Argan). Restructure intensément la fibre capillaire, scelle les écailles et apporte une brillance et un éclat incomparables tout en assurant une protection thermique.",
        ingredients: "Cyclopentasiloxane, Dimethiconol, Zea Mays Germ Oil / Corn Germ Oil, Argania Spinosa Kernel Oil, Sclerocarya Birrea Seed Oil, Camellia Oleifera Seed Oil, Pentaclethra Macroloba Seed Oil, Linalool, Alpha-Isomethyl Ionone, Limonene, Geraniol, Parfum / Fragrance.",
        usage: "Répartir une à deux pressions sur cheveux humides ou secs, des mi-longueurs jusqu'aux pointes. Procéder au séchage ou au coiffage."
    ,
        sku: "SKU-KRASTASE-017",
        buyingCost: 125
    },
    {
        id: 19,
        title: "Foreo Luna 4 Go Facial Cleansing Brush",
        name: "Foreo Luna 4 Go Facial Cleansing Brush",
        nameFr: "Foreo Luna 4 Go Brosse Nettoyante Visage en Silicone Ultra-Hygiénique",
        vendor: "Foreo",
        image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=320&auto=format&fit=crop"
        ],
        price: 1290.00,
        comparePrice: 1490.00,
        category: "kbeauty",
        tags: [
            "appareils",
            "visage"
        ],
        rating: 4.8,
        reviews: 19,
        description: "Dispositif d'exfoliation et de nettoyage épidermique en silicone de qualité médicale ultra-hygiénique. Émet des pulsations soniques T-Sonic qui désincrustent les impuretés des pores et stimulent la micro-circulation sans irriter la peau.",
        ingredients: "Silicone médical ultra-hygiénique, sans phtalates ni bisphénol A. 100% étanche. Batterie rechargeable longue durée.",
        usage: "Humidifier le visage et appliquer la mousse nettoyante. Activer l'appareil et effectuer des mouvements circulaires sur l'ensemble du visage durant une minute. Rincer.",
        sku: "SKU-FOREO-019",
        buyingCost: 774
    },
    {
        id: 20,
        title: "Beautyblender Original Sponge & Cleanser Set",
        name: "Beautyblender Original Sponge & Cleanser Set",
        nameFr: "Beautyblender Kit Éponge Originale & Nettoyant de Teint",
        vendor: "BeautyBlender",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=320&auto=format&fit=crop"
        ],
        price: 199.00,
        comparePrice: 249.00,
        category: "offers",
        tags: [
            "accessoires",
            "maquillage"
        ],
        rating: 4.7,
        reviews: 35,
        description: "Kit d'application professionnel comprenant l'éponge hydrophile brevetée sans latex et un pain de savon nettoyant dermo-protecteur. Permet une répartition homogène des produits de teint pour un fini naturel seconde peau.",
        ingredients: "Mousse polyuréthane hydrophile de qualité médicale brevetée, sans latex, non allergène et sans parfum.",
        usage: "Humidifier entièrement l'éponge à l'eau, l'essorer fermement, puis prélever et appliquer le fond de teint ou la BB crème par légers tapotements."
    ,
        sku: "SKU-BEAUTYBLENDER-019",
        buyingCost: 774
    },
    {
        id: 21,
        title: "Solgar Skin Nails Hair Formula 60 Tablets",
        name: "Solgar Skin Nails Hair Formula 60 Tablets",
        nameFr: "Solgar Formule Nutritive Peau Ongles Cheveux 60 Comprimés",
        vendor: "Solgar",
        image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?q=80&w=320&auto=format&fit=crop"
        ],
        price: 249.00,
        comparePrice: 299.00,
        category: "offers",
        tags: [
            "complements"
        ],
        rating: 4.8,
        reviews: 56,
        description: "Formulation nutritionnelle premium favorisant la synthèse endogène du collagène et de la kératine. Intègre du MSM (source de soufre organique), du zinc dermo-régulateur, de la silice d'algues rouges et de la vitamine C co-facteur de collagène.",
        ingredients: "MSM (Méthylsulfonylméthane), Silice (Algue rouge L. calcareum), Vitamine C (Acide L-ascorbique), Zinc (Citrate), Cuivre (Glycinate), L-Proline, L-Lysine, Cellulose microcristalline, Acide stéarique végétal, Stéarate de magnésium.",
        usage: "Pour adultes, ingérer deux comprimés par jour au cours d'un repas avec un grand verre d'eau. Ne pas dépasser la posologie recommandée.",
        sku: "SKU-SOLGAR-021",
        buyingCost: 149
    },
    {
        id: 22,
        title: "Anua Heartleaf Pore Deep Cleansing Foam 150ml",
        name: "Anua Heartleaf Pore Deep Cleansing Foam 150ml",
        nameFr: "Anua Heartleaf Mousse Nettoyante Profonde des Pores 150ml",
        vendor: "Anua",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=320&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=320&auto=format&fit=crop"
        ],
        price: 179.00,
        comparePrice: 220.00,
        category: "kbeauty",
        tags: [
            "visage",
            "kbeauty"
        ],
        rating: 4.8,
        reviews: 42,
        description: "Mousse nettoyante profonde formulée à base de poudre d'Heartleaf (3 000 ppm) et d'acide salicylique. Purifie les comédons, élimine l'excès de sébum oxydé et régule l'apparition de micro-kystes tout en respectant le pH physiologique de la peau. Parfait en seconde étape de nettoyage.",
        ingredients: "Houttuynia Cordata Extract, Glycerin, Sodium Cocoyl Glycinate, Water, Sodium Lauroyl Glutamate, Methylpropanediol, Sodium Cocoyl Isethionate, 1,2-Hexanediol, Salicylic Acid, Quercetin.",
        usage: "Faire mousser une noisette de produit dans des mains préalablement humidifiées. Masser délicatement sur l'ensemble du visage humide, puis rincer abondamment à l'eau tiède."
    ,
        sku: "SKU-ANUA-021",
        buyingCost: 149
    },
    {
        id: 101,
        title: "La Roche-Posay Cicaplast Baume B5+ 100ml",
        name: "La Roche-Posay Cicaplast Baume B5+ 100ml + Eau Thermale 50ml Offert",
        nameFr: "La Roche-Posay Cicaplast Baume B5+ 100ml + Eau Thermale 50ml Offert",
        vendor: "La Roche-Posay",
        image: "/images/cicaplast_bundle.webp",
        images: [
            "/images/cicaplast_bundle.webp"
        ],
        price: 179.00,
        comparePrice: 199.00,
        category: "offers",
        tags: [
            "visage",
            "offres",
            "baume",
            "apaisant"
        ],
        rating: 4.9,
        reviews: 58,
        description: "Traitement réparateur cutané et apaisant de référence. Sa formule enrichie en Madécassoside, en Cuivre-Zinc-Manganèse purifiants et en Panthénol à 5% accélère la reconstruction de la barrière épidermique. Ce pack exclusif d'officine est accompagné d'un flacon d'Eau Thermale Minéralisante 50ml.",
        ingredients: "Cicaplast Baume B5+: Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Centella Asiatica Extract. Eau Thermale: Aqua / Water.",
        usage: "Appliquer deux fois par jour sur une zone cutanée préalablement purifiée et sèche. Vaporiser l'Eau Thermale à tout moment pour calmer l'irritation.",
        sku: "SKU-LAROCHEPOSAY-101",
        buyingCost: 107
    },
    {
        id: 102,
        title: "Vichy Capital Soleil Crème Onctueuse SPF 50+ 50ml",
        name: "Vichy Capital Soleil Crème Onctueuse SPF 50+ 50ml + Sac Plage Offert",
        nameFr: "Vichy Capital Soleil Crème Onctueuse SPF 50+ 50ml + Sac Plage Offert",
        vendor: "Vichy",
        image: "/images/vichy_sunscreen_bundle.webp",
        images: [
            "/images/vichy_sunscreen_bundle.webp"
        ],
        price: 179.00,
        comparePrice: 189.00,
        category: "offers",
        tags: [
            "visage",
            "solaire",
            "offres"
        ],
        rating: 4.8,
        reviews: 32,
        description: "Photoprotecteur hydratant onctueux formulé à base d'acide hyaluronique pour les peaux sèches et déshydratées. Protège contre les rayonnements ultraviolets tout en empêchant le dessèchement de la barrière hydrolipidique. Livré dans son coffret avec un élégant sac en matières naturelles.",
        ingredients: "Aqua/Water, Glycerin, Diisopropyl Sebacate, Ethylhexyl Salicylate, Ethylhexyl Triazone, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Sodium Hyaluronate.",
        usage: "Appliquer généreusement sur le visage et le cou avant l'exposition. Renouveler fréquemment après sudation ou friction mécanique."
    ,
        sku: "SKU-VICHY-101",
        buyingCost: 107
    },
    {
        id: 103,
        title: "Vichy Dercos Shampooing Energisant Anti-Chute 200ml",
        name: "Vichy Dercos Shampooing Energisant Anti-Chute 200ml + Format Voyage 50ml Offert",
        nameFr: "Vichy Dercos Shampooing Energisant Anti-Chute 200ml + Format Voyage 50ml Offert",
        vendor: "Vichy",
        image: "/images/dercos_shampoo_bundle.webp",
        images: [
            "/images/dercos_shampoo_bundle.webp"
        ],
        price: 127.00,
        comparePrice: 145.00,
        category: "offers",
        tags: [
            "cheveux",
            "anti-chute",
            "offres"
        ],
        rating: 4.9,
        reviews: 64,
        description: "Shampooing dermatologique fortifiant enrichi en Aminexil (molécule brevetée anti-chute) et en vitamines actives B5 et B6. Restructure l'ancrage de la fibre capillaire dans le cuir chevelu pour réduire significativement la casse. Livré avec un format d'officine nomade 50ml.",
        ingredients: "Aqua/Water, Sodium Laureth Sulfate, Citric Acid, Sodium Hydroxide, Aminexil, Niacinamide, Panthenol, Pyridoxine HCl.",
        usage: "Appliquer sur cheveux humides, masser le cuir chevelu pour activer la circulation, laisser poser 2 minutes pour libérer les actifs, puis rincer.",
        sku: "SKU-VICHY-103",
        buyingCost: 76
    },
    {
        id: 104,
        title: "CeraVe Duo Hydratation Intense Baume 454g + Lotion 236ml",
        name: "CeraVe Duo Hydratation Baume 454g + Lotion 236ml + Trousse Offerte",
        nameFr: "CeraVe Duo Hydratation Intense Baume 454g + Lotion 236ml",
        vendor: "CeraVe",
        image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=600&auto=format&fit=crop"
        ],
        price: 220.00,
        comparePrice: 260.00,
        category: "offers",
        tags: [
            "visage",
            "corps",
            "offres",
            "hydratant"
        ],
        rating: 4.9,
        reviews: 78,
        description: "Protocole d'hydratation barrière ultime formulé à base de trois céramides essentiels et d'acide hyaluronique. Ce pack réunit le baume relipidant riche 454g pour les sécheresses intenses et le lait émollient fluide 236ml pour le corps, accompagnés d'une trousse de toilette dermatologique de la marque.",
        ingredients: "Aqua/Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Hyaluronic Acid.",
        usage: "Appliquer le Lait Hydratant fluide le matin sur l'ensemble du corps. Appliquer le Baume riche le soir sur les zones les plus sèches pour une réparation nocturne intense."
    ,
        sku: "SKU-CERAVE-103",
        buyingCost: 76
    },
    {
        id: 105,
        title: "Garnier Fast Bright Routine Éclat Vitamine C",
        name: "Garnier Fast Bright Sérum Vitamine C 30ml + Gel Nettoyant 100ml + Masseur Offert",
        nameFr: "Garnier Fast Bright Routine Éclat Sérum Vitamine C + Gel Nettoyant",
        vendor: "Garnier",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop"
        ],
        price: 149.00,
        comparePrice: 179.00,
        category: "offers",
        tags: [
            "visage",
            "offres",
            "eclat"
        ],
        rating: 4.8,
        reviews: 45,
        description: "Protocole dermo-clarifiant complet comprenant le sérum concentré à la Vitamine C 30ml et le gel nettoyant physiologique 100ml. Cible l'hyperpigmentation et lisse le grain de peau. Incorpore un rouleau de massage facial en quartz naturel pour stimuler le drainage lymphatique.",
        ingredients: "Aqua/Water, Glycerin, Ascorbic Acid (Vitamine C), Niacinamide, Salicylic Acid, Citrus Limon Fruit Extract, Sodium Hyaluronate.",
        usage: "Purifier le visage matin et soir avec le gel nettoyant. Appliquer ensuite le sérum sur peau humide, puis utiliser le rouleau de massage en mouvements ascendants.",
        sku: "SKU-GARNIER-105",
        buyingCost: 89
    },
    {
        id: 106,
        title: "L'Oréal Revitalift Repulpant Sérum 1.5% AH + Crème Jour 50ml",
        name: "L'Oréal Revitalift Sérum Acide Hyaluronique 30ml + Crème de Jour 50ml + Mini Gua Sha Offert",
        nameFr: "L'Oréal Revitalift Repulpant Sérum 1.5% AH + Crème Jour 50ml",
        vendor: "L'Oréal Paris",
        image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop"
        ],
        price: 269.00,
        comparePrice: 320.00,
        category: "offers",
        tags: [
            "visage",
            "offres",
            "anti-age"
        ],
        rating: 4.8,
        reviews: 52,
        description: "Protocole combleur anti-rides à base d'acide hyaluronique hautement concentré. Associe le sérum hydratant à 1,5% d'acide hyaluronique pur 30ml et la crème de jour volumisante 50ml. Livré dans son coffret avec un mini Gua Sha en aventurine pour raffermir les muscles faciaux.",
        ingredients: "Aqua/Water, Glycerin, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Adenosine, Secale Cereale Seed Extract/Rye Seed Extract, Tocopherol.",
        usage: "Appliquer le sérum sur peau humide matin et soir, faire suivre de la crème. Utiliser le Gua Sha en effectuant des massages doux du centre du visage vers les contours extérieurs."
    ,
        sku: "SKU-LORALPARIS-105",
        buyingCost: 89
    },
    {
        id: 107,
        title: "Eucerin Sun Oil Control Gel-Crème SPF 50+ 50ml",
        name: "Eucerin Sun Oil Control SPF 50+ 50ml + Gel Nettoyant 75ml Offert",
        nameFr: "Eucerin Sun Oil Control Gel-Crème SPF 50+ + Gel Nettoyant 75ml",
        vendor: "Eucerin",
        image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop"
        ],
        price: 189.00,
        comparePrice: 220.00,
        category: "offers",
        tags: [
            "visage",
            "solaire",
            "offres",
            "anti-imperfections"
        ],
        rating: 4.9,
        reviews: 67,
        description: "La très haute protection solaire préférée des peaux mixtes à grasses à tendance acnéique. Offre un effet anti-brillance de 8h. Livré en duo d'officine avec le gel nettoyant purifiant régulateur Dermopure 75ml.",
        ingredients: "Sun: Aqua, Alcohol Denat., Butyl Methoxydibenzoylmethane, C12-15 Alkyl Benzoate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, L-Carnitine. Gel: Aqua, Sodium Cocoamphoacetate, Propylene Glycol, Citric Acid.",
        usage: "Nettoyer l'épiderme avec le gel Dermopure. Appliquer ensuite le gel-crème photoprotecteur uniformément sur le visage avant de s'exposer.",
        sku: "SKU-EUCERIN-107",
        buyingCost: 113
    },
    {
        id: 108,
        title: "Mixa Bébé Douceur Duo Lait Protecteur + Gel Douche",
        name: "Mixa Bébé Lait Très Doux 250ml + Gel Lavant 250ml + Doudou Offert",
        nameFr: "Mixa Bébé Douceur Duo Lait Protecteur + Gel Douche Sans Savon",
        vendor: "Mixa Bébé",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop"
        ],
        price: 119.00,
        comparePrice: 149.00,
        category: "offers",
        tags: [
            "corps",
            "bebe",
            "offres",
            "douceur"
        ],
        rating: 4.9,
        reviews: 29,
        description: "Duo d'hygiène et de soin haute tolérance pédiatrique pour la peau très fragile des nouveau-nés. Comprend le lait hydratant protecteur à l'huile d'amande douce 250ml et le gel lavant syndet sans savon cheveux et corps 250ml. Accompagné d'un doudou hypoallergénique.",
        ingredients: "Lait: Aqua, Paraffinum Liquidum, Glycerin, Prunus Amygdalus Dulcis Oil/Sweet Almond Oil. Gel: Aqua, Sodium Laureth Sulfate, PEG-200 Hydrogenated Glyceryl Palmate, Coco-Betaine.",
        usage: "Utiliser le gel lavant pour l'hygiène quotidienne sous la douche. Hydrater la peau après le bain en appliquant le lait protecteur avec des mouvements d'effleurage doux."
    ,
        sku: "SKU-MIXABB-107",
        buyingCost: 113
    },
    {
        id: 109,
        title: "Erborian CC Crème Perfection Teint Centella 45ml",
        name: "Erborian CC Crème Centella Clair 45ml + Skin Therapy Huile de Nuit 10ml + Pinceau Offert",
        nameFr: "Erborian CC Crème Perfection Teint Centella + Huile de Nuit 10ml",
        vendor: "Erborian",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
        ],
        price: 389.00,
        comparePrice: 450.00,
        category: "offers",
        tags: [
            "visage",
            "maquillage",
            "offres"
        ],
        rating: 4.7,
        reviews: 38,
        description: "Soin perfecteur de teint hybride enrichi en Centella Asiatica répatrice. Cette CC Crème s'adapte à la carnation naturelle pour masquer les rougeurs et sublimer le teint. Livré avec un pinceau applicateur professionnel et l'huile de nuit régénératrice Skin Therapy 10ml.",
        ingredients: "CC: Aqua/Water, Cyclomethicone, Ethylhexyl Methoxycinnamate, Titanium Dioxide, Centella Asiatica Extract. Huile: Caprylic/Capric Triglyceride, Squalane, Helianthus Annuus Seed Oil.",
        usage: "Appliquer la CC Crème le matin au pinceau ou au doigt. Le soir, appliquer deux à trois gouttes de l'huile régénératrice sur un visage parfaitement propre.",
        sku: "SKU-ERBORIAN-109",
        buyingCost: 233
    },
    {
        id: 110,
        title: "Bioderma Sensibio Duo H2O Eau Micellaire 2x500ml",
        name: "Bioderma Sensibio H2O L'Eau Micellaire 500ml Duo Pack",
        nameFr: "Bioderma Sensibio Duo H2O Eau Micellaire Dermo-Brevetée 2x500ml",
        vendor: "Bioderma",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop"
        ],
        price: 179.00,
        comparePrice: 238.00,
        category: "offers",
        tags: [
            "visage",
            "offres",
            "demaquillant"
        ],
        rating: 5.0,
        reviews: 145,
        description: "Solution micellaire physiologique de référence, dermo-brevetée pour les peaux sensibles. Élimine 99% des particules polluantes et des pigments de maquillage tout en respectant l'intégrité de la barrière épidermique. Format d'officine économique en lot exclusif de deux flacons de 500ml.",
        ingredients: "Aqua/Water/Eau, PEG-6 Caprylic/Capric Glycerides, Fructooligosaccharides, Mannitol, Xylitol, Rhamnose, Cucumis Sativus (Cucumber) Fruit Extract, Propylene Glycol, Cetrimonium Bromide, Disodium EDTA.",
        usage: "Imbiber un coton hydrophile et nettoyer délicatement le visage et le contour des yeux sans frotter. Inutile de rincer."
    ,
        sku: "SKU-BIODERMA-109",
        buyingCost: 233
    },
    {
        id: 111,
        title: "Kérastase Genesis Anti-Chute Duo Bain + Masque",
        name: "Kérastase Genesis Bain Hydra-Fortifiant 250ml + Masque Reconstituant 200ml + Peigne Offert",
        nameFr: "Kérastase Genesis Anti-Chute Duo Bain + Masque",
        vendor: "Kérastase",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"
        ],
        price: 520.00,
        comparePrice: 610.00,
        category: "offers",
        tags: [
            "cheveux",
            "anti-chute",
            "offres"
        ],
        rating: 4.9,
        reviews: 64,
        description: "Protocole capillaire fortifiant ciblant la chute de cheveux causée par la casse. Comprend le shampooing physiologique Bain Hydra-Fortifiant 250ml et le masque reconstituant riche 200ml, accompagnés d'un peigne démêlant professionnel.",
        ingredients: "Bain: Aqua, Sodium Laureth Sulfate, Citric Acid, Cocamidopropyl Betaine. Masque: Aqua, Cetearyl Alcohol, Amodimethicone, Behentrimonium Chloride, Cetyl Esters, Arginine, Centella Asiatica Extract.",
        usage: "Effectuer le lavage avec le Bain sur cheveux humides, émulsionner et rincer. Appliquer ensuite le Masque sur les longueurs essorées, laisser poser 5 minutes, démêler et rincer.",
        sku: "SKU-KRASTASE-111",
        buyingCost: 312
    },
    {
        id: 112,
        title: "SVR Sebiaclear Anti-Acné Active Gel 40ml",
        name: "SVR Sebiaclear Active Gel 40ml + Eau Micellaire 75ml Offerte",
        nameFr: "SVR Sebiaclear Anti-Acné Active Gel 40ml",
        vendor: "SVR",
        image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=600&auto=format&fit=crop"
        ],
        price: 169.00,
        comparePrice: 199.00,
        category: "offers",
        tags: [
            "visage",
            "offres",
            "anti-imperfections"
        ],
        rating: 4.8,
        reviews: 41,
        description: "Traitement kératolytique intensif pour peaux acnéiques et sujettes aux imperfections. Formulé avec de la Gluconolactone (14%) et du Niacinamide (4%) pour éliminer boutons et points noirs tout en prévenant les marques rouges. Ce pack comprend l'Eau Micellaire purifiante Sebiaclear 75ml.",
        ingredients: "Gel: Aqua, Gluconolactone, Alcohol Denat., Niacinamide, Glycerin, Sodium Hydroxide. Eau Micellaire: Aqua, Poloxamer 184, PEG-7 Glyceryl Cocoate, Zinc PCA.",
        usage: "Nettoyer le visage avec l'Eau Micellaire. Appliquer ensuite le Gel Sebiaclear matin et soir sur l'ensemble de la zone cutanée."
    ,
        sku: "SKU-SVR-111",
        buyingCost: 312
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

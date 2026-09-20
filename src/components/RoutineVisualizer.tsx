'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Check, Brain, Sun, Moon, Stethoscope, Bubbles, Droplet, Pipette, Container } from 'lucide-react';
import styles from './RoutineVisualizer.module.css';

interface Step {
  id: number;
  nameFr: string;
  nameAr: string;
  subtitleFr: string;
  subtitleAr: string;
  descFr: string;
  descAr: string;
  importanceFr: string;
  importanceAr: string;
  time: 'AM' | 'PM' | 'Both';
  activesFr: string[];
  activesAr: string[];
  benefitsFr: string[];
  benefitsAr: string[];
  color: string; // Tailored glow color class
  icon: React.ReactNode;
}

interface MoleculeDetails {
  categoryFr: string;
  categoryAr: string;
  targetFr: string;
  targetAr: string;
  descFr: string;
  descAr: string;
  concentration: string;
}

const MOLECULE_DATABASE: Record<string, MoleculeDetails> = {
  // Step 1: Nettoyer
  "Acide Salicylique": {
    categoryFr: "BHA (Beta-Hydroxy Acid)",
    categoryAr: "حمض بيتا هيدروكسي",
    targetFr: "Pores & Glandes Sébacées",
    targetAr: "المسام والغدد الدهنية",
    descFr: "Exfoliant lipophile qui pénètre à l'intérieur des pores pour dissoudre le sébum et prévenir l'acné.",
    descAr: "مقشر يذوب في الدهون يتغلغل داخل المسام لإذابة الدهون ومنع ظهور حب الشباب.",
    concentration: "0.5% - 2.0%"
  },
  "حمض الساليسيليك": {
    categoryFr: "BHA (Beta-Hydroxy Acid)",
    categoryAr: "حمض بيتا هيدروكسي",
    targetFr: "Pores & Glandes Sébacées",
    targetAr: "المسام والغدد الدهنية",
    descFr: "Exfoliant lipophile qui pénètre à l'intérieur des pores pour dissoudre le sébum et prévenir l'acné.",
    descAr: "مقشر يذوب في الدهون يتغلغل داخل المسام لإذابة الدهون ومنع ظهور حب الشباب.",
    concentration: "0.5% - 2.0%"
  },
  "Centella Asiatica": {
    categoryFr: "Phyto-Actif Apaisant",
    categoryAr: "مستخلص نباتي مهدئ",
    targetFr: "Barrière Cutanée & Rougeurs",
    targetAr: "حاجز الجلد والاحمرار",
    descFr: "Plante médicinale asiatique riche en madécassoside, accélérant la cicatrisation et calmant l'inflammation.",
    descAr: "نبات طبي آسيوي غني بالمديكاسوسيد، يسرع التئام البشرة ويهدئ الالتهاب.",
    concentration: "10% - 95%"
  },
  "سنتيلا أسياتيكا": {
    categoryFr: "Phyto-Actif Apaisant",
    categoryAr: "مستخلص نباتي مهدئ",
    targetFr: "Barrière Cutanée & Rougeurs",
    targetAr: "حاجز الجلد والاحمرار",
    descFr: "Plante médicinale asiatique riche en madécassoside, accélérant la cicatrisation et calmant l'inflammation.",
    descAr: "نبات طبي آسيوي غني بالمديكاسوسيد، يسرع التئام البشرة ويهدئ الالتهاب.",
    concentration: "10% - 95%"
  },
  "Glycerin": {
    categoryFr: "Humectant Naturel",
    categoryAr: "مرطب طبيعي",
    targetFr: "Couche Cornée (Hydratation)",
    targetAr: "الطبقة القرنية (الترطيب)",
    descFr: "Molécule hygroscopique qui attire et retient l'eau dans l'épiderme pour maintenir l'élasticité.",
    descAr: "جزيء جاذب للرطوبة يسحب الماء ويحتفظ به داخل البشرة للحفاظ على مرونتها.",
    concentration: "2.0% - 15%"
  },
  "الجلسرين": {
    categoryFr: "Humectant Naturel",
    categoryAr: "مرطب طبيعي",
    targetFr: "Couche Cornée (Hydratation)",
    targetAr: "الطبقة القرنية (الترطيب)",
    descFr: "Molécule hygroscopique qui attire et retient l'eau dans l'épiderme pour maintenir l'élasticité.",
    descAr: "جزيء جاذب للرطوبة يسحب الماء ويحتفظ به داخل البشرة للحفاظ على مرونتها.",
    concentration: "2.0% - 15%"
  },
  
  // Step 2: Préparer
  "Panthenol (B5)": {
    categoryFr: "Provitamine Cicatrisante",
    categoryAr: "بروفيتامين مهدئ",
    targetFr: "Barrière Lipidique",
    targetAr: "حاجز الدهون الطبيعي",
    descFr: "Se transforme en acide pantothénique pour stimuler la régénération cellulaire et réduire la perte d'eau.",
    descAr: "يتحول إلى حمض البانتوثنيك لتحفيز تجديد الخلايا وتقليل فقدان رطوبة البشرة.",
    concentration: "1.0% - 5.0%"
  },
  "بانثينول (B5)": {
    categoryFr: "Provitamine Cicatrisante",
    categoryAr: "بروفيتامين مهدئ",
    targetFr: "Barrière Lipidique",
    targetAr: "حاجز الدهون الطبيعي",
    descFr: "Se transforme en acide pantothénique pour stimuler la régénération cellulaire et réduire la perte d'eau.",
    descAr: "يتحول إلى حمض البانتوثنيك لتحفيز تجديد الخلايا وتقليل فقدان رطوبة البشرة.",
    concentration: "1.0% - 5.0%"
  },
  "Eau Thermale": {
    categoryFr: "Solution Minérale",
    categoryAr: "محلول معدني طبيعي",
    targetFr: "Épiderme Sensible",
    targetAr: "البشرة الحساسة",
    descFr: "Riche en oligo-éléments (sélénium, silice) pour apaiser instantanément les irritations cutanées.",
    descAr: "غنية بالعناصر النادرة (السيلينيوم والسيليكا) لتهدئة تهيج الجلد فوراً.",
    concentration: "Purifiée 100%"
  },
  "مياه حرارية": {
    categoryFr: "Solution Minérale",
    categoryAr: "محلول معدني طبيعي",
    targetFr: "Épiderme Sensible",
    targetAr: "البشرة الحساسة",
    descFr: "Riche en oligo-éléments (sélénium, silice) pour apaiser instantanément les irritations cutanées.",
    descAr: "غنية بالعناصر النادرة (السيلينيوم والسيليكا) لتهدئة تهيج الجلد فوراً.",
    concentration: "Purifiée 100%"
  },
  "Acide Hyaluronique": {
    categoryFr: "Polysaccharide Humectant",
    categoryAr: "مرطب عميق",
    targetFr: "Matrice Extra-Cellulaire",
    targetAr: "المصفوفة خارج الخلية",
    descFr: "Capacité de retenir jusqu'à 1000 fois son poids en eau, repulpant visiblement les ridules.",
    descAr: "له القدرة على الاحتفاظ بالماء بوزن يعادل 1000 ضعف وزنه، مما يملأ الخطوط الدقيقة.",
    concentration: "0.1% - 2.0%"
  },
  "حمض الهيالورونيك": {
    categoryFr: "Polysaccharide Humectant",
    categoryAr: "مرطب عميق",
    targetFr: "Matrice Extra-Cellulaire",
    targetAr: "المصفوفة خارج الخلية",
    descFr: "Capacité de retenir jusqu'à 1000 fois son poids en eau, repulpant visiblement les ridules.",
    descAr: "له القدرة على الاحتفاظ بالماء بوزن يعادل 1000 ضعف وزنه، مما يملأ الخطوط الدقيقة.",
    concentration: "0.1% - 2.0%"
  },

  // Step 3: Traiter
  "Retinol": {
    categoryFr: "Rétinoïde (Vitamine A)",
    categoryAr: "ريتينويد (فيتامين أ)",
    targetFr: "Renouvellement Cellulaire",
    targetAr: "تجديد خلايا البشرة",
    descFr: "Accélère la desquamation, stimule le collagène et estompe rides et cicatrices d'acné.",
    descAr: "يسرع تقشير الخلايا القديمة، يحفز إنتاج الكولاجين ويخفف التجاعيد وآثار الحبوب.",
    concentration: "0.1% - 1.0%"
  },
  "ريتينول": {
    categoryFr: "Rétinoïde (Vitamine A)",
    categoryAr: "ريتينويد (فيتامين أ)",
    targetFr: "Renouvellement Cellulaire",
    targetAr: "تجديد خلايا البشرة",
    descFr: "Accélère la desquamation, stimule le collagène et estompe rides et cicatrices d'acné.",
    descAr: "يسرع تقشير الخلايا القديمة، يحفز إنتاج الكولاجين ويخفف التجاعيد وآثار الحبوب.",
    concentration: "0.1% - 1.0%"
  },
  "Vitamine C": {
    categoryFr: "Antioxydant Majeur",
    categoryAr: "مضاد أكسدة قوي",
    targetFr: "Mélanocytes (Éclat)",
    targetAr: "الخلايا الصبغية (النضارة)",
    descFr: "Inhibe la production de mélanine pour réduire les taches et neutralise les radicaux libres induits par les UV.",
    descAr: "يثبط إنتاج الميلانين لتقليل البقع الداكنة ويحيد الجذور الحرة الناتجة عن الشمس.",
    concentration: "5.0% - 20.0%"
  },
  "فيتامين C": {
    categoryFr: "Antioxydant Majeur",
    categoryAr: "مضاد أكسدة قوي",
    targetFr: "Mélanocytes (Éclat)",
    targetAr: "الخلايا الصبغية (النضارة)",
    descFr: "Inhibe la production de mélanine pour réduire les taches et neutralise les radicaux libres induits par les UV.",
    descAr: "يثبط إنتاج الميلانين لتقليل البقع الداكنة ويحيد الجذور الحرة الناتجة عن الشمس.",
    concentration: "5.0% - 20.0%"
  },
  "Acide Tranexamique": {
    categoryFr: "Inhibiteur de Pigmentation",
    categoryAr: "مضاد للتصبغات",
    targetFr: "Voies Inflammatoires",
    targetAr: "الالتهابات والتصبغات",
    descFr: "Bloque l'interaction entre les kératinocytes et les mélanocytes pour traiter le mélasma et les taches tenaces.",
    descAr: "يمنع التفاعل بين خلايا الجلد السطحية والصبغية لعلاج الكلف والبقع المستعصية.",
    concentration: "2.0% - 5.0%"
  },
  "حمض الترانيكساميك": {
    categoryFr: "Inhibiteur de Pigmentation",
    categoryAr: "مضاد للتصبغات",
    targetFr: "Voies Inflammatoires",
    targetAr: "الالتهابات والتصبغات",
    descFr: "Bloque l'interaction entre les kératinocytes et les mélanocytes pour traiter le mélasma et les taches tenaces.",
    descAr: "يمنع التفاعل بين خلايا الجلد السطحية والصبغية لعلاج الكلف والبقع المستعصية.",
    concentration: "2.0% - 5.0%"
  },
  "Niacinamide": {
    categoryFr: "Vitamine B3",
    categoryAr: "فيتامين ب3",
    targetFr: "Barrière & Teint",
    targetAr: "حاجز البشرة ولونها",
    descFr: "Régule le sébum, resserre les pores, renforce les céramides et estompe les taches d'hyperpigmentation.",
    descAr: "ينظم إفراز الدهون، يضيق المسام، يعزز السيراميد الطبيعي ويوحد لون البشرة.",
    concentration: "2.0% - 10.0%"
  },
  "نياسيناميد": {
    categoryFr: "Vitamine B3",
    categoryAr: "فيتامين ب3",
    targetFr: "Barrière & Teint",
    targetAr: "حاجز البشرة ولونها",
    descFr: "Régule le sébum, resserre les pores, renforce les céramides et estompe les taches d'hyperpigmentation.",
    descAr: "ينظم إفراز الدهون، يضيق المسام، يعزز السيراميد الطبيعي ويوحد لون البشرة.",
    concentration: "2.0% - 10.0%"
  },

  // Step 4: Hydrater
  "Ceramides": {
    categoryFr: "Lipides Intercellulaires",
    categoryAr: "دهون حاجز البشرة",
    targetFr: "Ciment Intercellulaire",
    targetAr: "الروابط بين الخلايا",
    descFr: "Restaure la cohésion cellulaire pour empêcher l'évaporation de l'eau et bloquer les allergènes extérieurs.",
    descAr: "يعيد تماسك خلايا البشرة لمنع تبخر الرطوبة وحمايتها من العوامل الخارجية الضارة.",
    concentration: "1.0% - 3.0%"
  },
  "سيراميد": {
    categoryFr: "Lipides Intercellulaires",
    categoryAr: "دهون حاجز البشرة",
    targetFr: "Ciment Intercellulaire",
    targetAr: "الروابط بين الخلايا",
    descFr: "Restaure la cohésion cellulaire pour empêcher l'évaporation de l'eau et bloquer les allergènes extérieurs.",
    descAr: "يعيد تماسك خلايا البشرة لمنع تبخر الرطوبة وحمايتها من العوامل الخارجية الضارة.",
    concentration: "1.0% - 3.0%"
  },
  "Squalane": {
    categoryFr: "Émollient Protecteur",
    categoryAr: "مرطب ومنعم للبشرة",
    targetFr: "Film Hydrolipidique",
    targetAr: "الغشاء المائي الدهني",
    descFr: "Mimétique du sébum humain stable, adoucit la peau sans sensation grasse ni comédogénicité.",
    descAr: "يحاكي دهون البشرة الطبيعية، ينعم البشرة بفعالية دون سد المسام أو ترك ملمس دهني.",
    concentration: "2.0% - 100%"
  },
  "سيروم السكوالين": {
    categoryFr: "Émollient Protecteur",
    categoryAr: "مرطب ومنعم للبشرة",
    targetFr: "Film Hydrolipidique",
    targetAr: "الغشاء المائي الدهني",
    descFr: "Mimétique du sébum humain stable, adoucit la peau sans sensation grasse ni comédogénicité.",
    descAr: "يحاكي دهون البشرة الطبيعية، ينعم البشرة بفعالية دون سد المسام أو ترك ملمس دهني.",
    concentration: "2.0% - 100%"
  },
  "Peptides": {
    categoryFr: "Chaînes d'Acides Aminés",
    categoryAr: "سلاسل أحماض أمينية",
    targetFr: "Fibroblastes (Collagène)",
    targetAr: "خلايا إنتاج الكولاجين",
    descFr: "Messagers cellulaires qui signalent à la peau de produire du nouveau collagène et de l'élastine.",
    descAr: "مرسلات خلوية تعطي إشارات للبشرة لإنتاج كولاجين وإيلاستين جديدين لزيادة مرونتها.",
    concentration: "1.0% - 5.0%"
  },
  "ببتيدات": {
    categoryFr: "Chaînes d'Acides Aminés",
    categoryAr: "سلاسل أحماض أمينية",
    targetFr: "Fibroblastes (Collagène)",
    targetAr: "خلايا إنتاج الكولاجين",
    descFr: "Messagers cellulaires qui signalent à la peau de produire du nouveau collagène et de l'élastine.",
    descAr: "مرسلات خلوية تعطي إشارات للبشرة لإنتاج كولاجين وإيلاستين جديدين لزيادة مرونتها.",
    concentration: "1.0% - 5.0%"
  },

  // Step 5: Protéger
  "Filtres UV Organiques": {
    categoryFr: "Filtres Chimiques",
    categoryAr: "فلاتر واقية كيميائية",
    targetFr: "Couches Épidermiques",
    targetAr: "طبقات الجلد الخارجية",
    descFr: "Absorbent les rayons UV et les convertissent en chaleur inoffensive pour prévenir les brûlures et taches.",
    descAr: "تمتص الأشعة فوق البنفسجية وتحولها إلى حرارة غير ضارة لمنع الحروق والتصبغات.",
    concentration: "Homologuée (Spf 50+)"
  },
  "فلاتر عضوية": {
    categoryFr: "Filtres Chimiques",
    categoryAr: "فلاتر واقية كيميائية",
    targetFr: "Couches Épidermiques",
    targetAr: "طبقات الجلد الخارجية",
    descFr: "Absorbent les rayons UV et les convertissent en chaleur inoffensive pour prévenir les brûlures et taches.",
    descAr: "تمتص الأشعة فوق البنفسجية وتحولها إلى حرارة غير ضارة لمنع الحروق والتصبغات.",
    concentration: "Homologuée (Spf 50+)"
  },
  "Filtres Minéraux": {
    categoryFr: "Filtres Physiques",
    categoryAr: "فلاتر واقية فيزيائية",
    targetFr: "Surface Cutanée (Écran)",
    targetAr: "سطح البشرة (حاجز واقي)",
    descFr: "Oxyde de Zinc et Dioxyde de Titane qui réfléchissent les UV comme un miroir, idéal pour peaux sensibles.",
    descAr: "أكسيد الزنك وثاني أكسيد التيتانيوم اللذان يعكسان الأشعة كمرآة، مثالي للبشرة الحساسة.",
    concentration: "5.0% - 25.0%"
  },
  "فلاتر معدنية": {
    categoryFr: "Filtres Physiques",
    categoryAr: "فلاتر واقية فيزيائية",
    targetFr: "Surface Cutanée (Écran)",
    targetAr: "سطح البشرة (حاجز واقي)",
    descFr: "Oxyde de Zinc et Dioxyde de Titane qui réfléchissent les UV comme un miroir, idéal pour peaux sensibles.",
    descAr: "أكسيد الزنك وثاني أكسيد التيتانيوم اللذان يعكسان الأشعة كمرآة، مثالي للبشرة الحساسة.",
    concentration: "5.0% - 25.0%"
  },
  "Antioxydants": {
    categoryFr: "Bouclier Moléculaire",
    categoryAr: "درع جزيئي واقي",
    targetFr: "Intracellulaire (Stress Ox)",
    targetAr: "داخل الخلايا (الإجهاد)",
    descFr: "Neutralisent les radicaux libres générés par la pollution, l'ozone et la lumière bleue du soleil.",
    descAr: "تحيد الجذور الحرة الناتجة عن التلوث، الأوزون، والضوء الأزرق المنبعث من الشمس.",
    concentration: "0.5% - 2.0%"
  },
  "مضادات الأكسدة": {
    categoryFr: "Bouclier Moléculaire",
    categoryAr: "درع جزيئي واقي",
    targetFr: "Intracellulaire (Stress Ox)",
    targetAr: "داخل الخلايا (الإجهاد)",
    descFr: "Neutralisent les radicaux libres générés par la pollution, l'ozone et la lumière bleue du soleil.",
    descAr: "تحيد الجذور الحرة الناتجة عن التلوث، الأوزون، والضوء الأزرق المنبعث من الشمس.",
    concentration: "0.5% - 2.0%"
  }
};

export function RoutineVisualizer() {
  const { language } = useTranslation();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);

  const isRTL = language === 'AR';

  const steps: Step[] = [
    {
      id: 1,
      nameFr: 'Nettoyer',
      nameAr: 'التنظيف',
      subtitleFr: 'Préparer la base',
      subtitleAr: 'تهيئة الأساس',
      descFr: 'Élimine les impuretés, l\'excès de sébum et les résidus de pollution sans décaper le film hydrolipidique de la peau.',
      descAr: 'يزيل الأتربة، الدهون الزائدة وبقايا التلوث دون إتلاف الغشاء الواقي للبشرة.',
      importanceFr: 'Nettoyer libère les pores obstrués et évite l\'accumulation bactérienne. C\'est l\'étape indispensable pour que les actifs suivants pénètrent efficacement.',
      importanceAr: 'ينظف المسام المسدودة ويمنع تراكم البكتيريا. وهي خطوة أساسية لضمان تغلغل المواد الفعالة التالية.',
      time: 'Both',
      activesFr: ['Acide Salicylique', 'Centella Asiatica', 'Glycerin'],
      activesAr: ['حمض الساليسيليك', 'سنتيلا أسياتيكا', 'الجلسرين'],
      benefitsFr: ['Régule le sébum', 'Prévient les imperfections', 'Purifie en douceur'],
      benefitsAr: ['تنظيم الدهون', 'منع ظهور الشوائب', 'تطهير لطيف للمسام'],
      color: 'rgba(20, 184, 166, 0.15)', // Teal
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 2,
      nameFr: 'Préparer',
      nameAr: 'التهيئة',
      subtitleFr: 'Équilibrer le pH',
      subtitleAr: 'إعادة توازن الحموضة',
      descFr: 'Le tonique rééquilibre le pH de la peau après le nettoyage et apporte une première couche d\'hydratation pour assouplir l\'épiderme.',
      descAr: 'يعيد التونر توازن درجة حموضة البشرة بعد الغسيل ويوفر طبقة ترطيب أولى لتنعيم أنسجة الجلد.',
      importanceFr: 'Une peau nettoyée a un pH déstabilisé et se comporte comme une éponge sèche. Le tonique l\'humidifie pour multiplier par 3 l\'absorption des sérums.',
      importanceAr: 'تكون حموضة البشرة غير مستقرة بعد التنظيف وتتصرف كإسفنجة جافة. يعمل التونر على ترطيبها لمضاعفة امتصاص السيروم 3 مرات.',
      time: 'Both',
      activesFr: ['Panthenol (B5)', 'Eau Thermale', 'Acide Hyaluronique'],
      activesAr: ['بانثينول (B5)', 'مياه حرارية', 'حمض الهيالورونيك'],
      benefitsFr: ['Équilibre le pH', 'Calme les rougeurs', 'Assouplit la barrière'],
      benefitsAr: ['توازن درجة الحموضة', 'تهدئة الاحمرار', 'تنعيم حاجز الجلد'],
      color: 'rgba(99, 102, 241, 0.15)', // Indigo
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 13.5a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      )
    },
    {
      id: 3,
      nameFr: 'Traiter',
      nameAr: 'العلاج',
      subtitleFr: 'Actifs concentrés',
      subtitleAr: 'مكونات نشطة مركزة',
      descFr: 'Sérums hautement concentrés formulés pour cibler directement les problématiques cutanées (imperfections, rides, taches ou teint terne).',
      descAr: 'سيروم عالي التركيز مصمم خصيصاً لاستهداف مشاكل محددة (البثور، التجاعيد، البقع الداكنة، أو البهتان).',
      importanceFr: 'C\'est l\'étape ciblée de la routine. Les actifs sélectionnés répondent au besoin indiqué dans votre questionnaire.',
      importanceAr: 'هذه هي المرحلة الأساسية للتصحيح السريري. تتغلغل الجزيئات النشطة بعمق لإعادة بناء وتجديد خلايا البشرة.',
      time: 'Both',
      activesFr: ['Retinol', 'Vitamine C', 'Acide Tranexamique', 'Niacinamide'],
      activesAr: ['ريتينول', 'فيتامين C', 'حمض الترانيكساميك', 'نياسيناميد'],
      benefitsFr: ['Atténue les taches', 'Stimule le collagène', 'Lisse le grain de peau'],
      benefitsAr: ['تقليل البقع الداكنة', 'تحفيز الكولاجين', 'تنعيم ملمس البشرة'],
      color: 'rgba(217, 119, 6, 0.15)', // Amber/Gold
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 4,
      nameFr: 'Hydrater',
      nameAr: 'الترطيب',
      subtitleFr: 'Sceller l\'eau',
      subtitleAr: 'حبس الرطوبة',
      descFr: 'Renforce le film hydrolipidique et empêche la perte insensible en eau (PIE) en scellant les hydratants précédents dans la peau.',
      descAr: 'يقوي الغشاء المائي الدهني ويمنع فقدان الماء عبر البشرة من خلال حبس المرطبات السابقة داخل الجلد.',
      importanceFr: 'Sans crème hydratante, les sérums s\'évaporent dans l\'air. Les lipides et céramides de la crème réparent le ciment intercellulaire.',
      importanceAr: 'بدون كريم مرطب، تتبخر فوائد السيروم في الهواء. تعمل الدهون والسيراميد في الكريم على إصلاح الروابط بين الخلايا.',
      time: 'Both',
      activesFr: ['Ceramides', 'Squalane', 'Peptides'],
      activesAr: ['سيراميد', 'سيروم السكوالين', 'ببتيدات'],
      benefitsFr: ['Répare la barrière', 'Maintient la souplesse', 'Hydratation 24h'],
      benefitsAr: ['إصلاح حاجز البشرة', 'الحفاظ على المرونة', 'ترطيب يدوم 24 ساعة'],
      color: 'rgba(59, 130, 246, 0.15)', // Blue
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 5,
      nameFr: 'Protéger',
      nameAr: 'الحماية',
      subtitleFr: 'Bouclier UV',
      subtitleAr: 'درع الأشعة فوق البنفسجية',
      descFr: 'Protège contre les rayons UVA et UVB, responsables de 80% du vieillissement cutané prématuré et de l\'hyperpigmentation.',
      descAr: 'يحمي من الأشعة فوق البنفسجية UVA و UVB، المسؤولة عن 80% من الشيخوخة المبكرة وتصبغات البشرة.',
      importanceFr: 'L\'utilisation de sérums traitants (surtout acides ou rétinol) rend la peau photosensible. Le SPF50+ est la protection absolue indispensable chaque matin.',
      importanceAr: 'استخدام السيروم العلاجي (خاصة الأحماض أو الريتينول) يجعل البشرة حساسة للضوء. واقي الشمس SPF50+ هو الدرع الواقي صباحاً.',
      time: 'AM',
      activesFr: ['Filtres UV Organiques', 'Filtres Minéraux', 'Antioxydants'],
      activesAr: ['فلاتر عضوية', 'فلاتر معدنية', 'مضادات الأكسدة'],
      benefitsFr: ['Prévient le photo-vieillissement', 'Évite les taches solaires', 'Protège des radicaux libres'],
      benefitsAr: ['منع الشيخوخة الضوئية', 'تجنب بقع الشمس الداكنة', 'حماية من الجذور الحرة'],
      color: 'rgba(245, 158, 11, 0.15)', // Gold/Amber
      icon: (
        <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )
    }
  ];

  const currentStepData = steps[activeStep];

  const icons = [Bubbles, Droplet, Pipette, Container, Sun];
  const selectStep = (index: number) => { setActiveStep(index); setSelectedMolecule(null); };
  const molecule = selectedMolecule ? MOLECULE_DATABASE[selectedMolecule] : null;

  return (
    <section className={styles.section} aria-labelledby="routine-title" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.decor} aria-hidden="true"><i /><i /><i /><span /></div>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}><Stethoscope size={19} />{isRTL ? 'التسلسل الطبيعي' : 'Ordre clinique'}</span>
          <h2 id="routine-title" className="public-section-title">{isRTL ? 'تسلسل خطوات روتينك اليومي المثالي' : <>L’Ordre de votre <em>Routine Skincare</em></>}</h2>
          <p>{isRTL ? 'تطبيق المستحضرات بالترتيب الصحيح يضمن أقصى استفادة لبشرتك ويحمي حاجزها الطبيعي.' : 'Appliquer les soins dans l’ordre recommandé facilite une routine régulière et limite les associations inadaptées.'}</p>
        </header>
        <div className={styles.steps} role="tablist" aria-label={isRTL ? 'خطوات الروتين' : 'Étapes de la routine'}>
          {steps.map((step, index) => {
            const Icon = icons[index];
            return <button type="button" role="tab" key={step.id} id={'routine-tab-' + step.id} aria-controls="routine-panel" aria-selected={index === activeStep} tabIndex={index === activeStep ? 0 : -1}
              onClick={() => selectStep(index)}
              onKeyDown={event => {
                let target = index;
                if (event.key === 'ArrowRight') target = (index + (isRTL ? 4 : 1)) % 5;
                else if (event.key === 'ArrowLeft') target = (index + (isRTL ? 1 : 4)) % 5;
                else if (event.key === 'Home') target = 0;
                else if (event.key === 'End') target = 4;
                else return;
                event.preventDefault(); selectStep(target); document.getElementById('routine-tab-' + (target + 1))?.focus();
              }}>
              <span className={styles.circle}><Icon size={32} strokeWidth={1.4} aria-hidden="true" /><b>{step.id}</b></span>
              <span className={styles.stepName}>{isRTL ? step.nameAr : step.nameFr}</span>
              <span className={styles.subtitle}>{isRTL ? step.subtitleAr : step.subtitleFr}</span>
            </button>;
          })}
        </div>
        <div id="routine-panel" role="tabpanel" aria-labelledby={'routine-tab-' + currentStepData.id} tabIndex={0} className={styles.panel}>
          <div className={styles.summary} key={activeStep}>
            <span className={styles.label}>{isRTL ? 'الخطوة' : 'Étape'} 0{currentStepData.id}</span>
            <h3>{isRTL ? currentStepData.nameAr : currentStepData.nameFr}<span>{isRTL ? currentStepData.subtitleAr : currentStepData.subtitleFr}</span></h3>
            <p className={styles.description}>{isRTL ? currentStepData.descAr : currentStepData.descFr}</p>
            <div className={styles.benefits}>
              <h4>{isRTL ? 'الفوائد الملموسة للبشرة' : 'Bénéfices cutanés'}</h4>
              <ul>{(isRTL ? currentStepData.benefitsAr : currentStepData.benefitsFr).map(benefit => <li key={benefit}><span><Check size={22} aria-hidden="true" /></span>{benefit}</li>)}</ul>
            </div>
            <p className={styles.signature}>{isRTL ? 'لحظة عناية، كل يوم' : 'Un moment pour votre peau, chaque jour'}</p>
          </div>
          <aside className={styles.context}>
            <h4 className={styles.contextTitle}><span><Brain size={25} strokeWidth={1.5} /></span>{isRTL ? 'لماذا هذه الخطوة مهمة؟' : 'Raisonnement clinique'}</h4>
            <p>{isRTL ? currentStepData.importanceAr : currentStepData.importanceFr}</p>
            <div className={styles.actives}>
              <h4>{isRTL ? 'الجزيئات النشطة الموصى بها' : 'Molécules actives'}</h4>
              <div className={styles.chips}>{(isRTL ? currentStepData.activesAr : currentStepData.activesFr).map(active => <button type="button" key={active} aria-expanded={selectedMolecule === active} aria-controls="routine-molecule" onClick={() => setSelectedMolecule(selectedMolecule === active ? null : active)}>{active}</button>)}</div>
              {molecule && <div className={styles.molecule} id="routine-molecule" aria-live="polite">
                <strong>{selectedMolecule}</strong><span>{isRTL ? molecule.categoryAr : molecule.categoryFr}</span>
                <p>{isRTL ? molecule.descAr : molecule.descFr}</p>
                <small>{isRTL ? 'الهدف:' : 'Cible :'} {isRTL ? molecule.targetAr : molecule.targetFr}</small>
              </div>}
            </div>
            <div className={styles.schedule}><h4>{isRTL ? 'جدول التطبيق' : 'Application'}</h4><div>
              {currentStepData.time !== 'PM' && <span className={styles.morning}><Sun size={20} />{isRTL ? 'صباحاً' : 'Matin'}</span>}
              {currentStepData.time !== 'AM' && <span className={styles.evening}><Moon size={20} />{isRTL ? 'مساءً' : 'Soir'}</span>}
            </div></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

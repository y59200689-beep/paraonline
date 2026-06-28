'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useUi } from '@/context/UiContext';
import { useAdmin } from '@/context/AdminContext';
import { Paintbrush, RotateCcw, Save, Sparkles, Check, Phone } from 'lucide-react';

interface ThemeColorSet {
  primary: string;
  primaryDark: string;
  secondary: string;
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentBg: string;
  gold: string;
  goldHover: string;
  whatsapp: string;
}

const PRESETS: { name: string; description: string; colors: ThemeColorSet }[] = [
  {
    name: 'Para Officinal Classique',
    description: 'Style original : Bleu ardoise, bleu marine foncé et accents vert dermo-clinique.',
    colors: {
      primary: '#2573a3',
      primaryDark: '#1a255d',
      secondary: '#ffffff',
      bg: '#ffffff',
      text: '#111827',
      textMuted: 'rgba(17, 24, 39, 0.7)',
      border: '#e2e8f0',
      accent: '#0d9488',
      accentBg: '#f0fdfa',
      gold: '#B09B71',
      goldHover: '#98845E',
      whatsapp: '#25d366'
    }
  },
  {
    name: 'K-Beauty Cerise & Bloom',
    description: 'Inspiré des soins coréens : Nuances chaudes cerise sauvage, champagne et fond doux blush.',
    colors: {
      primary: '#b91c1c',
      primaryDark: '#450a0a',
      secondary: '#ffffff',
      bg: '#fffafb',
      text: '#1c1917',
      textMuted: 'rgba(28, 25, 23, 0.7)',
      border: '#f5e0e0',
      accent: '#db2777',
      accentBg: '#fdf2f8',
      gold: '#d97706',
      goldHover: '#b45309',
      whatsapp: '#25d366'
    }
  },
  {
    name: 'Herbal Bio & Forest',
    description: 'Cosmétique naturelle : Vert feuille profond, terre cuite sablonneuse et bois chaud.',
    colors: {
      primary: '#15803d',
      primaryDark: '#14532d',
      secondary: '#ffffff',
      bg: '#fafdfb',
      text: '#1e293b',
      textMuted: 'rgba(30, 41, 59, 0.7)',
      border: '#e2e8f0',
      accent: '#16a34a',
      accentBg: '#f0fdf4',
      gold: '#b45309',
      goldHover: '#92400e',
      whatsapp: '#25d366'
    }
  },
  {
    name: 'Océan Clinique & Azur',
    description: 'Moderne et frais : Bleu indigo royal, turquoise clair et contrastes intenses.',
    colors: {
      primary: '#4f46e5',
      primaryDark: '#312e81',
      secondary: '#ffffff',
      bg: '#fcfdff',
      text: '#0f172a',
      textMuted: 'rgba(15, 23, 42, 0.7)',
      border: '#e0e7ff',
      accent: '#06b6d4',
      accentBg: '#ecfeff',
      gold: '#eab308',
      goldHover: '#ca8a04',
      whatsapp: '#25d366'
    }
  },
  {
    name: 'Minimaliste Charbon & Argile',
    description: 'Esthétique épurée : Gris ardoise scandinave, sable chaud et accents orange brique.',
    colors: {
      primary: '#475569',
      primaryDark: '#1e293b',
      secondary: '#ffffff',
      bg: '#f8fafc',
      text: '#0f172a',
      textMuted: 'rgba(15, 23, 42, 0.7)',
      border: '#cbd5e1',
      accent: '#ea580c',
      accentBg: '#fff7ed',
      gold: '#d97706',
      goldHover: '#b45309',
      whatsapp: '#25d366'
    }
  }
];

export default function AdminBrandingPage() {
  const { settings, saveSettings, loadSettings } = useSettings();
  const { showToast } = useUi();
  const { adminTheme } = useAdmin();

  // State to hold temporary customizer colors
  const [colors, setColors] = useState<ThemeColorSet>({
    primary: '#2573a3',
    primaryDark: '#1a255d',
    secondary: '#ffffff',
    bg: '#ffffff',
    text: '#111827',
    textMuted: 'rgba(17, 24, 39, 0.7)',
    border: '#e2e8f0',
    accent: '#0d9488',
    accentBg: '#f0fdfa',
    gold: '#B09B71',
    goldHover: '#98845E',
    whatsapp: '#25d366'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activePresetIdx, setActivePresetIdx] = useState<number | null>(null);

  // Initialize colors from loaded settings
  useEffect(() => {
    if (settings?.themeColors) {
      setColors({
        primary: settings.themeColors.primary || '#2573a3',
        primaryDark: settings.themeColors.primaryDark || '#1a255d',
        secondary: settings.themeColors.secondary || '#ffffff',
        bg: settings.themeColors.bg || '#ffffff',
        text: settings.themeColors.text || '#111827',
        textMuted: settings.themeColors.textMuted || 'rgba(17, 24, 39, 0.7)',
        border: settings.themeColors.border || '#e2e8f0',
        accent: settings.themeColors.accent || '#0d9488',
        accentBg: settings.themeColors.accentBg || '#f0fdfa',
        gold: settings.themeColors.gold || '#B09B71',
        goldHover: settings.themeColors.goldHover || '#98845E',
        whatsapp: settings.themeColors.whatsapp || '#25d366'
      });

      // Match preset if possible
      const match = PRESETS.findIndex(p => 
        Object.entries(p.colors).every(([key, val]) => (settings.themeColors as any)[key] === val)
      );
      setActivePresetIdx(match !== -1 ? match : null);
    }
  }, [settings]);

  // Apply colors temporarily to DOM for instant live previewing as they slide
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, val]) => {
      if (val) {
        const cssKey = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        root.style.setProperty(cssKey, val);
      }
    });
  }, [colors]);

  const handleColorChange = (key: keyof ThemeColorSet, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    setActivePresetIdx(null); // break preset matching
  };

  const applyPreset = (preset: ThemeColorSet, idx: number) => {
    setColors(preset);
    setActivePresetIdx(idx);
    showToast(`Palette "${PRESETS[idx].name}" appliquée temporairement.`, 'success');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        themeColors: colors
      };
      const success = await saveSettings(updatedSettings);
      if (success) {
        showToast('Configuration des couleurs enregistrée avec succès !', 'success');
        await loadSettings(true); // force reload settings in context
      } else {
        showToast('Erreur lors de l\'enregistrement des couleurs.', 'error');
      }
    } catch (err) {
      showToast('Erreur serveur.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Voulez-vous réinitialiser toutes les couleurs aux valeurs d\'origine de la marque ?')) {
      applyPreset(PRESETS[0].colors, 0);
    }
  };

  const isLight = adminTheme === 'light';

  return (
    <div className="space-y-6 admin-tab-enter">
      {/* Overview Card */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900/40 border-slate-800/80 shadow-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-emerald-500" /> Personnalisation de l&apos;Identité Visuelle
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} font-light max-w-2xl`}>
              Personnalisez les couleurs de votre site web en temps réel. Modifiez les teintes ci-dessous, observez la prévisualisation instantanée et cliquez sur &quot;Enregistrer la configuration&quot; pour appliquer le nouveau design à vos clients.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              type="button"
              className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600' 
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 transition active:scale-[0.97]"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Color Control Panels (8 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Curated Presets Container */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900/40 border-slate-800/80 shadow-md'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Palettes de Design Prédéfinies
            </h3>
            <div className="space-y-2.5">
              {PRESETS.map((preset, idx) => {
                const isActive = activePresetIdx === idx;
                return (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.colors, idx)}
                    className={`w-full p-3 border rounded-2xl flex items-center justify-between text-left transition cursor-pointer ${
                      isActive
                        ? (isLight ? 'border-emerald-500 bg-emerald-50/20' : 'border-emerald-500 bg-emerald-950/10')
                        : (isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-850 hover:bg-slate-900/30')
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{preset.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[9px] font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Actif
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] font-light ${isLight ? 'text-slate-450' : 'text-slate-550'}`}>
                        {preset.description}
                      </p>
                    </div>

                    {/* Color Swatch Preview Dot Sequence */}
                    <div className="flex items-center gap-1 shrink-0 ml-4">
                      {[preset.colors.primary, preset.colors.primaryDark, preset.colors.accent, preset.colors.gold, preset.colors.bg].map((c, i) => (
                        <span 
                          key={i} 
                          className="w-3.5 h-3.5 rounded-full border border-slate-200/50" 
                          style={{ backgroundColor: c }} 
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div className={`p-5 rounded-3xl border transition-all ${
            isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900/40 border-slate-800/80 shadow-md'
          }`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-5">
              Configuration Avancée des Couleurs
            </h3>

            <div className="space-y-6">
              {/* Group 1: Couleurs de Marque */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Couleurs de Marque Principales
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Color */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.primary} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Primaire (Marque)</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.primary}</span>
                    </div>
                  </div>

                  {/* Primary Dark */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.primaryDark} 
                      onChange={(e) => handleColorChange('primaryDark', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Contrastes & Titres</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.primaryDark}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Fond et Texte */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Surfaces, Textes & Cadres
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Page Background */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.bg} 
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Fond de Page</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.bg}</span>
                    </div>
                  </div>

                  {/* Page Text */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.text} 
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Texte de Base</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.text}</span>
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.border} 
                      onChange={(e) => handleColorChange('border', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Bordures & Séparateurs</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.border}</span>
                    </div>
                  </div>

                  {/* Text Muted */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.textMuted.startsWith('rgba') ? '#6b7280' : colors.textMuted} 
                      onChange={(e) => handleColorChange('textMuted', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Texte Secondaire</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.textMuted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Accents et Spécifiques */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Accents, Badges & Social
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Accent (Teal Green) */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.accent} 
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Accent (Statut & Badges)</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.accent}</span>
                    </div>
                  </div>

                  {/* Accent Background (Soft Teal) */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.accentBg} 
                      onChange={(e) => handleColorChange('accentBg', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Fond d&apos;Accent Soft</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.accentBg}</span>
                    </div>
                  </div>

                  {/* Gold Color */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.gold} 
                      onChange={(e) => handleColorChange('gold', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Boutons Quiz & Étoiles</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.gold}</span>
                    </div>
                  </div>

                  {/* WhatsApp Color */}
                  <div className="flex items-center gap-3 p-3 border dark:border-slate-800/80 rounded-2xl">
                    <input 
                      type="color" 
                      value={colors.whatsapp} 
                      onChange={(e) => handleColorChange('whatsapp', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-bold">Bouton WhatsApp</span>
                      <span className="text-[10px] text-slate-450 font-mono select-all uppercase">{colors.whatsapp}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Interactive Storefront Mock Preview (5 Columns) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <div className={`p-5 rounded-3xl border transition-all ${
              isLight ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-900/40 border-slate-800/80 shadow-md'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 mb-4">
                Aperçu de la Boutique en Temps Réel
              </h3>

              {/* Storefront Mock Frame */}
              <div 
                className="w-full border rounded-2xl overflow-hidden font-sans shadow-sm select-none"
                style={{ 
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }}
              >
                {/* 1. Announcement Bar */}
                <div 
                  className="px-3 py-1.5 text-[9px] font-semibold text-center transition tracking-wide"
                  style={{ 
                    backgroundColor: colors.primaryDark,
                    color: colors.secondary
                  }}
                >
                  LIVRAISON GRATUITE SUR TOUT LE MAROC 📦
                </div>

                {/* 2. Header */}
                <div 
                  className="px-4 py-3 border-b flex items-center justify-between transition"
                  style={{ 
                    borderColor: colors.border
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ backgroundColor: colors.primaryDark }}
                    >
                      PO
                    </span>
                    <span 
                      className="text-[11px] font-extrabold tracking-tight"
                      style={{ color: colors.primaryDark }}
                    >
                      Para Officinal
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span style={{ color: colors.text }}>Accueil</span>
                    <span style={{ color: colors.text }}>Visage</span>
                    <div className="relative shrink-0 flex items-center justify-center w-7 h-7 rounded-full border border-slate-200/50 bg-slate-50">
                      🛒
                      <span 
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] font-black flex items-center justify-center scale-90"
                        style={{ backgroundColor: colors.accent }}
                      >
                        2
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Hero Section Banner */}
                <div className="p-4 space-y-3">
                  <div 
                    className="p-4 rounded-2xl border flex flex-col items-center text-center space-y-2.5 transition"
                    style={{ 
                      borderColor: colors.border,
                      background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accentBg} 100%)`
                    }}
                  >
                    <span 
                      className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ 
                        color: colors.accent,
                        backgroundColor: colors.accentBg,
                        border: `1px solid ${colors.accent}20`
                      }}
                    >
                      Routine Clinique IA
                    </span>
                    <h4 
                      className="text-xs font-black tracking-tight max-w-[200px]"
                      style={{ color: colors.primaryDark }}
                    >
                      Diagnostic de Peau Intelligent
                    </h4>
                    <p 
                      className="text-[9px] leading-relaxed max-w-[220px]"
                      style={{ color: colors.textMuted }}
                    >
                      Découvrez les soins formulés sur-mesure par nos pharmaciens.
                    </p>
                    <button 
                      type="button"
                      className="px-3 py-1.5 text-[9px] font-bold rounded-lg text-white transition cursor-pointer active:scale-[0.97]"
                      style={{ backgroundColor: colors.gold }}
                    >
                      Commencer le Diagnostic
                    </button>
                  </div>
                </div>

                {/* 4. Product Grid (1 card example) */}
                <div className="px-4 pb-4">
                  <div 
                    className="border rounded-2xl overflow-hidden transition"
                    style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.secondary
                    }}
                  >
                    {/* Mock product image area */}
                    <div className="h-28 bg-slate-100 relative flex items-center justify-center text-slate-400 text-xs font-medium">
                      <span>Mockup Soin</span>
                      <span 
                        className="absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: colors.accentBg,
                          color: colors.accent,
                          border: `1px solid ${colors.accent}30`
                        }}
                      >
                        En Stock
                      </span>
                    </div>

                    <div className="p-3 space-y-2">
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400">ANUA</span>
                        <h5 
                          className="text-[10px] font-semibold truncate"
                          style={{ color: colors.text }}
                        >
                          Heartleaf Daily Cleanser Gel
                        </h5>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-[9px]">
                        <span style={{ color: colors.gold }}>★</span>
                        <span style={{ color: colors.gold }}>★</span>
                        <span style={{ color: colors.gold }}>★</span>
                        <span style={{ color: colors.gold }}>★</span>
                        <span style={{ color: colors.gold }}>★</span>
                        <span className="text-[8px] text-slate-400 ml-1">(48)</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span 
                          className="text-[11px] font-extrabold font-mono"
                          style={{ color: colors.primaryDark }}
                        >
                          189.00 DH
                        </span>
                        
                        <button 
                          type="button"
                          className="px-2.5 py-1 text-[8px] font-bold rounded-md text-white transition cursor-pointer"
                          style={{ backgroundColor: colors.primary }}
                        >
                          Acheter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Footer and WhatsApp preview */}
                <div 
                  className="p-4 border-t flex items-center justify-between transition text-[8px] font-medium"
                  style={{ 
                    borderColor: colors.border,
                    backgroundColor: colors.secondary
                  }}
                >
                  <span style={{ color: colors.textMuted }}>© 2026 Para Officinal S.A.</span>
                  
                  {/* Floating WhatsApp CTA */}
                  <div 
                    className="px-2 py-1 rounded-full text-white flex items-center gap-1 shadow-sm shrink-0"
                    style={{ backgroundColor: colors.whatsapp }}
                  >
                    <Phone className="w-2.5 h-2.5 text-white shrink-0" />
                    <span>WhatsApp Chat</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Context/Status Info Card */}
            <div className={`p-4 rounded-3xl border text-[11px] font-light leading-relaxed transition-all ${
              isLight ? 'bg-slate-50/50 border-slate-200 text-slate-500' : 'bg-slate-900/20 border-slate-850/60 text-slate-400'
            }`}>
              💡 **Astuce pro** : Cette prévisualisation utilise exactement le moteur CSS de votre site public. Les boutons, en-têtes et textes affichés ci-contre reflètent directement les couleurs que vous choisissez en temps réel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

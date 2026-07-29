'use client';

import React, { useState, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useAdmin } from '@/context/AdminContext';
import { 
  FolderTree, 
  Layers, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Edit3, 
  Sparkles, 
  Tag, 
  Eye, 
  SlidersHorizontal,
  ChevronRight,
  Upload
} from 'lucide-react';
import { Product } from '@/lib/data';

export default function CategoriesTab() {
  const { settings, saveSettings } = useSettings();
  const { products, loadProducts, adminTheme } = useAdmin();

  // Tab: 'categories' (Product Categories) vs 'concerns' (Skin Concerns / Curation) vs 'brands' (Brands)
  const [activeTab, setActiveTab] = useState<'categories' | 'concerns' | 'brands'>('categories');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Manage drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeDrawerItem, setActiveDrawerItem] = useState<any | null>(null); // the category/concern/brand being linked
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');

  // Toast / Status messages
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  // Create form state
  const [formId, setFormId] = useState('');
  const [formLabelFr, setFormLabelFr] = useState('');
  const [formLabelAr, setFormLabelAr] = useState('');
  const [formTaglineFr, setFormTaglineFr] = useState('');
  const [formTaglineAr, setFormTaglineAr] = useState('');
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [formIngredientKeywords, setFormIngredientKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [newIngKeywordInput, setNewIngKeywordInput] = useState('');

  // Brand-specific form states
  const [formDomain, setFormDomain] = useState('');
  const [formLogoUrl, setFormLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const customCategories = settings.customCategories || [];
  const customConcerns = settings.customConcerns || [];
  const brandSection = settings.homepageSections?.sectionOrder?.find((s: any) => s.type === 'brandPartners');
  const customBrands = brandSection?.settings?.brands || [];

  const categoryLabelFromId = (id: string) => id
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const displayCategories = useMemo(() => {
    const byId = new Map<string, any>();

    customCategories.forEach((category: any) => {
      if (!category?.id) return;
      const id = String(category.id).trim().toLowerCase();
      byId.set(id, {
        ...category,
        id,
        labelFr: category.labelFr || categoryLabelFromId(id),
        labelAr: category.labelAr || '-',
        source: 'settings',
      });
    });

    products.forEach(product => {
      const productCategories = Array.isArray(product.categories) && product.categories.length > 0
        ? product.categories
        : [product.category];

      productCategories.forEach(category => {
        if (!category) return;
        const id = String(category).trim().toLowerCase();
        if (!id || byId.has(id)) return;
        byId.set(id, {
          id,
          labelFr: categoryLabelFromId(id),
          labelAr: '-',
          source: 'catalog',
        });
      });
    });

    return Array.from(byId.values()).sort((a, b) => a.labelFr.localeCompare(b.labelFr));
  }, [customCategories, products]);

  const saveUpdatedBrands = async (newBrands: any[]) => {
    const sectionOrder = settings.homepageSections?.sectionOrder || [];
    const updatedSections = sectionOrder.map((s: any) => {
      if (s.type === 'brandPartners') {
        return {
          ...s,
          settings: {
            ...s.settings,
            brands: newBrands
          }
        };
      }
      return s;
    });

    const updatedSettings = {
      ...settings,
      homepageSections: {
        ...settings.homepageSections,
        sectionOrder: updatedSections
      }
    };
    return await saveSettings(updatedSettings);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, onComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onComplete(data.url);
        showToast('Image importée avec succès !', 'success');
      } else {
        showToast("Erreur lors de l'importation de l'image.", 'error');
      }
    } catch (err) {
      showToast("Erreur de connexion lors de l'importation.", 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMsg('');
      setStatusType('');
    }, 3000);
  };

  // Add/Remove keywords helper in form
  const handleAddKeyword = (e: React.FormEvent, type: 'kw' | 'ing') => {
    e.preventDefault();
    if (type === 'kw') {
      const val = newKeywordInput.trim().toLowerCase();
      if (val && !formKeywords.includes(val)) {
        setFormKeywords([...formKeywords, val]);
      }
      setNewKeywordInput('');
    } else {
      const val = newIngKeywordInput.trim().toLowerCase();
      if (val && !formIngredientKeywords.includes(val)) {
        setFormIngredientKeywords([...formIngredientKeywords, val]);
      }
      setNewIngKeywordInput('');
    }
  };

  const handleRemoveKeyword = (val: string, type: 'kw' | 'ing') => {
    if (type === 'kw') {
      setFormKeywords(formKeywords.filter(k => k !== val));
    } else {
      setFormIngredientKeywords(formIngredientKeywords.filter(k => k !== val));
    }
  };

  // Create Category, Concern or Brand submit handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'brands') {
      if (!formLabelFr.trim()) {
        showToast('Le nom de la marque est requis.', 'error');
        return;
      }
    } else if (!formId.trim() || !formLabelFr.trim() || !formLabelAr.trim()) {
      showToast('Veuillez remplir tous les champs requis.', 'error');
      return;
    }

    const itemKey = formId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

    setIsSaving(true);
    try {
      if (activeTab === 'brands') {
        const brandName = formLabelFr.trim();
        if (customBrands.some((b: any) => b.name.toLowerCase() === brandName.toLowerCase())) {
          showToast('Une marque avec ce nom existe déjà.', 'error');
          setIsSaving(false);
          return;
        }
        const newBrand = {
          name: brandName,
          domain: formDomain.trim() || 'example.com',
          logoUrl: formLogoUrl.trim() || ''
        };
        const success = await saveUpdatedBrands([...customBrands, newBrand]);
        if (success) {
          showToast('Marque créée avec succès !', 'success');
          setIsNewModalOpen(false);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      } else if (activeTab === 'categories') {
        // Check for duplicates
        if (displayCategories.some((c: any) => c.id === itemKey)) {
          showToast('Une catégorie avec cet identifiant existe déjà.', 'error');
          setIsSaving(false);
          return;
        }

        const newCat = { id: itemKey, labelFr: formLabelFr.trim(), labelAr: formLabelAr.trim() };
        const updated = {
          ...settings,
          customCategories: [...customCategories, newCat]
        };
        const success = await saveSettings(updated);
        if (success) {
          showToast('Catégorie créée avec succès !', 'success');
          setIsNewModalOpen(false);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      } else {
        // Check for duplicates
        if (customConcerns.some((c: any) => c.id === itemKey)) {
          showToast('Une préoccupation avec cet identifiant existe déjà.', 'error');
          setIsSaving(false);
          return;
        }

        // Color palettes presets for dynamic skin concerns
        const colorPresets = [
          { accentColor: 'bg-emerald-50', accentText: 'text-emerald-700', accentBorder: 'border-emerald-200', accentDot: '#059669' },
          { accentColor: 'bg-amber-50', accentText: 'text-amber-700', accentBorder: 'border-amber-200', accentDot: '#d97706' },
          { accentColor: 'bg-rose-50', accentText: 'text-rose-700', accentBorder: 'border-rose-200', accentDot: '#e11d48' },
          { accentColor: 'bg-sky-50', accentText: 'text-sky-700', accentBorder: 'border-sky-200', accentDot: '#0284c7' },
          { accentColor: 'bg-teal-50', accentText: 'text-teal-700', accentBorder: 'border-teal-200', accentDot: '#0d9488' },
          { accentColor: 'bg-orange-50', accentText: 'text-orange-700', accentBorder: 'border-orange-200', accentDot: '#ea580c' },
        ];
        const preset = colorPresets[customConcerns.length % colorPresets.length];

        const newConcern = {
          id: itemKey,
          labelFr: formLabelFr.trim(),
          labelAr: formLabelAr.trim(),
          taglineFr: formTaglineFr.trim(),
          taglineAr: formTaglineAr.trim(),
          keywords: formKeywords,
          ingredientKeywords: formIngredientKeywords,
          productIds: [],
          ...preset
        };

        const updated = {
          ...settings,
          customConcerns: [...customConcerns, newConcern]
        };
        const success = await saveSettings(updated);
        if (success) {
          showToast('Préoccupation créée avec succès !', 'success');
          setIsNewModalOpen(false);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      }
    } catch (err) {
      showToast('Erreur serveur.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Submit handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== 'brands' && (!formLabelFr.trim() || !formLabelAr.trim())) {
      showToast('Les noms Français et Arabe sont requis.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (activeTab === 'brands') {
        const oldName = editingItem.name;
        const newName = formLabelFr.trim();
        const newDomain = formDomain.trim() || 'example.com';
        const newLogo = formLogoUrl.trim();

        const updatedBrands = customBrands.map((b: any) => 
          b.name === oldName 
            ? { ...b, name: newName, domain: newDomain, logoUrl: newLogo } 
            : b
        );

        const success = await saveUpdatedBrands(updatedBrands);
        if (success) {
          if (oldName !== newName) {
            const productsToUpdate = products.filter(p => p.vendor === oldName);
            for (const p of productsToUpdate) {
              await fetch(`/api/admin/products?id=${p.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...p, vendor: newName, nameFr: p.nameFr || p.title })
              });
            }
            await loadProducts();
          }

          showToast('Marque mise à jour.', 'success');
          setEditingItem(null);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      } else if (activeTab === 'categories') {
        const updatedCats = customCategories.map((c: any) => 
          c.id === editingItem.id 
            ? { ...c, labelFr: formLabelFr.trim(), labelAr: formLabelAr.trim() } 
            : c
        );
        const updated = { ...settings, customCategories: updatedCats };
        const success = await saveSettings(updated);
        if (success) {
          showToast('Catégorie mise à jour.', 'success');
          setEditingItem(null);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      } else {
        const updatedConcerns = customConcerns.map((c: any) => 
          c.id === editingItem.id 
            ? { 
                ...c, 
                labelFr: formLabelFr.trim(), 
                labelAr: formLabelAr.trim(), 
                taglineFr: formTaglineFr.trim(), 
                taglineAr: formTaglineAr.trim(), 
                keywords: formKeywords,
                ingredientKeywords: formIngredientKeywords
              } 
            : c
        );
        const updated = { ...settings, customConcerns: updatedConcerns };
        const success = await saveSettings(updated);
        if (success) {
          showToast('Préoccupation mise à jour.', 'success');
          setEditingItem(null);
          resetForm();
        } else {
          showToast('Erreur lors de la sauvegarde.', 'error');
        }
      }
    } catch (err) {
      showToast('Erreur de connexion.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category or Concern
  const handleDeleteItem = async (id: string) => {
    const confirm = window.confirm(`Voulez-vous vraiment supprimer "${id}" ?`);
    if (!confirm) return;

    try {
      if (activeTab === 'brands') {
        const updatedBrands = customBrands.filter((b: any) => b.name !== id);
        const success = await saveUpdatedBrands(updatedBrands);
        if (success) {
          const productsToUpdate = products.filter(p => p.vendor === id);
          for (const p of productsToUpdate) {
            await fetch(`/api/admin/products?id=${p.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...p, vendor: '', nameFr: p.nameFr || p.title })
            });
          }
          await loadProducts();
          showToast('Marque supprimée.', 'success');
        }
      } else if (activeTab === 'categories') {
        const updatedCats = customCategories.filter((c: any) => c.id !== id);
        const updated = { ...settings, customCategories: updatedCats };
        const success = await saveSettings(updated);
        if (success) showToast('Catégorie supprimée.', 'success');
      } else {
        const updatedConcerns = customConcerns.filter((c: any) => c.id !== id);
        const updated = { ...settings, customConcerns: updatedConcerns };
        const success = await saveSettings(updated);
        if (success) showToast('Préoccupation supprimée.', 'success');
      }
    } catch (err) {
      showToast('Erreur de suppression.', 'error');
    }
  };

  const resetForm = () => {
    setFormId('');
    setFormLabelFr('');
    setFormLabelAr('');
    setFormTaglineFr('');
    setFormTaglineAr('');
    setFormKeywords([]);
    setFormIngredientKeywords([]);
    setNewKeywordInput('');
    setNewIngKeywordInput('');
    setFormDomain('');
    setFormLogoUrl('');
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'brands') {
      setFormLabelFr(item.name);
      setFormDomain(item.domain || '');
      setFormLogoUrl(item.logoUrl || '');
    } else {
      setFormId(item.id);
      setFormLabelFr(item.labelFr);
      setFormLabelAr(item.labelAr);
      if (activeTab === 'concerns') {
        setFormTaglineFr(item.taglineFr || '');
        setFormTaglineAr(item.taglineAr || '');
        setFormKeywords(item.keywords || []);
        setFormIngredientKeywords(item.ingredientKeywords || []);
      }
    }
  };

  // Open Product Management Drawer
  const openProductDrawer = (item: any) => {
    setActiveDrawerItem(item);
    setDrawerOpen(true);
    setDrawerSearchQuery('');
  };

  // Helper: Checks if a product belongs to a Category, Concern or Brand
  const getProductAssignment = (p: Product, type: 'category' | 'concern' | 'brand', id: string) => {
    if (type === 'category') {
      const categories = Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories
        : [p.category];
      return categories.some(category => String(category).trim().toLowerCase() === id.toLowerCase());
    } else if (type === 'brand') {
      return p.vendor?.toLowerCase() === id.toLowerCase();
    } else {
      // Skin Concern matches if explicit productIds includes it OR if tags includes it
      const targetConcern = customConcerns.find((c: any) => c.id === id);
      const isExplicit = targetConcern?.productIds?.includes(p.id) || false;
      const hasTag = (p.tags || []).includes(id);
      return isExplicit || hasTag;
    }
  };

  // Link/Unlink products callback handler
  const handleToggleProductAssociation = async (product: Product) => {
    if (!activeDrawerItem) return;

    const id = activeTab === 'brands' ? activeDrawerItem.name : activeDrawerItem.id;
    const isAssoc = getProductAssignment(product, activeTab === 'categories' ? 'category' : activeTab === 'brands' ? 'brand' : 'concern', id);

    setIsSaving(true);
    try {
      if (activeTab === 'brands') {
        const updatedProduct = {
          ...product,
          nameFr: product.nameFr || product.title,
          vendor: isAssoc ? '' : id
        };
        const res = await fetch(`/api/admin/products?id=${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        const data = await res.json();
        if (data.success) {
          await loadProducts();
          showToast('Liaison marque mise à jour.', 'success');
        } else {
          showToast(data.error || 'Erreur lors du mappage.', 'error');
        }
      } else if (activeTab === 'categories') {
        // Toggle product category
        const updatedProduct = {
          ...product,
          nameFr: product.nameFr || product.title,
          category: isAssoc ? 'visage' : id // fall back to visage if unlinked
        };

        const res = await fetch(`/api/admin/products?id=${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        const data = await res.json();
        if (data.success) {
          await loadProducts();
          showToast('Catégorie de produit mise à jour.', 'success');
        } else {
          showToast(data.error || 'Erreur lors du mappage.', 'error');
        }
      } else {
        // Toggle skin concern: update both the product tags AND concern productIds list
        const updatedTags = isAssoc 
          ? (product.tags || []).filter(t => t !== id && t !== activeDrawerItem.id)
          : Array.from(new Set([...(product.tags || []), id]));

        const updatedProduct = {
          ...product,
          nameFr: product.nameFr || product.title,
          tags: updatedTags
        };

        const productRes = await fetch(`/api/admin/products?id=${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct)
        });
        const productData = await productRes.json();

        if (productData.success) {
          // Now update settings customConcerns.productIds
          const currentProductIds = activeDrawerItem.productIds || [];
          const updatedProductIds = isAssoc
            ? currentProductIds.filter((pid: number) => pid !== product.id)
            : Array.from(new Set([...currentProductIds, product.id]));

          const updatedConcerns = customConcerns.map((c: any) => 
            c.id === id 
              ? { ...c, productIds: updatedProductIds } 
              : c
          );
          
          const success = await saveSettings({ ...settings, customConcerns: updatedConcerns });
          if (success) {
            setActiveDrawerItem({ ...activeDrawerItem, productIds: updatedProductIds });
            await loadProducts();
            showToast('Liaison produit mise à jour.', 'success');
          }
        }
      }
    } catch (err) {
      showToast('Erreur lors de la modification de la liaison.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter drawer products list
  const filteredDrawerProducts = useMemo(() => {
    if (!drawerSearchQuery) return products;
    const q = drawerSearchQuery.toLowerCase();
    return products.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.nameFr || '').toLowerCase().includes(q) || 
      (p.sku || '').toLowerCase().includes(q) ||
      p.vendor.toLowerCase().includes(q)
    );
  }, [products, drawerSearchQuery]);

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* Toast Alert Banner */}
      {statusMsg && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg font-bold text-xs uppercase tracking-wider animate-slide-in ${
          statusType === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 backdrop-blur-md'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 backdrop-blur-md'
        }`}>
          {statusType === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {statusMsg}
        </div>
      )}      {/* 1. Header & Overview bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Banner header info */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
          adminTheme === 'light' 
            ? 'bg-white border-slate-200/80 shadow-sm' 
            : 'bg-slate-900/30 border-slate-900'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3 h-3" /> Nouveau Module Dynamique
            </span>
            <h2 className="text-sm font-black tracking-tight uppercase leading-tight">Gestionnaire</h2>
            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-light mt-1">
              Gérez vos catégories, préoccupations de peau (Curation Clinique) et marques partenaires.
            </p>
          </div>
          <div className="flex gap-2.5 mt-3">
            <button
              onClick={() => { resetForm(); setIsNewModalOpen(true); }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm hover:scale-101 hover:shadow-md active:scale-98 transition duration-200 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {activeTab === 'categories' ? 'Catégorie' : activeTab === 'brands' ? 'Marque' : 'Préoccupation'}
            </button>
          </div>
        </div>

        {/* Dynamic metrics card 1 */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:shadow-md ${
          adminTheme === 'light' ? 'bg-white border-slate-200/85 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/20 border-slate-900/60'
        }`}>
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <FolderTree className="w-4 h-4" />
            </div>
            <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>Total Catégories</span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold font-mono leading-none" style={{ fontSize: 'var(--admin-text-2xl)', color: 'var(--admin-text-primary)' }}>{displayCategories.length}</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Figures catalogue</span>
          </div>
        </div>

        {/* Dynamic metrics card 2 */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:shadow-md ${
          adminTheme === 'light' ? 'bg-white border-slate-200/85 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/20 border-slate-900/60'
        }`}>
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>Total Cibles</span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold font-mono leading-none" style={{ fontSize: 'var(--admin-text-2xl)', color: 'var(--admin-text-primary)' }}>{customConcerns.length}</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Curation Clinique</span>
          </div>
        </div>

        {/* Dynamic metrics card 3 */}
        <div className={`p-5 rounded-3xl border flex flex-col justify-between transition hover:shadow-md ${
          adminTheme === 'light' ? 'bg-white border-slate-200/85 shadow-[var(--admin-shadow-sm)]' : 'bg-slate-900/20 border-slate-900/60'
        }`}>
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <Tag className="w-4 h-4" />
            </div>
            <span className="font-semibold uppercase tracking-widest" style={{ fontSize: 'var(--admin-text-2xs)', color: 'var(--admin-text-faint)' }}>Total Marques</span>
          </div>
          <div className="mt-3">
            <h3 className="font-bold font-mono leading-none" style={{ fontSize: 'var(--admin-text-2xl)', color: 'var(--admin-text-primary)' }}>{customBrands.length}</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">Laboratoires K-Beauty</span>
          </div>
        </div>

      </div>

      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-200/40 dark:border-slate-800/60 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('categories'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl font-semibold uppercase tracking-widest transition ${
              activeTab === 'categories'
                ? (adminTheme === 'light' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-900 shadow')
                : (adminTheme === 'light' ? 'bg-slate-100 text-slate-500 hover:text-slate-800' : 'bg-slate-900/40 text-slate-400 hover:text-slate-200')
            }`}
            style={{ fontSize: 'var(--admin-text-xs)' }}
          >
            Catégories
          </button>
          <button
            onClick={() => { setActiveTab('concerns'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl font-semibold uppercase tracking-widest transition ${
              activeTab === 'concerns'
                ? (adminTheme === 'light' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-900 shadow')
                : (adminTheme === 'light' ? 'bg-slate-100 text-slate-500 hover:text-slate-800' : 'bg-slate-900/40 text-slate-400 hover:text-slate-200')
            }`}
            style={{ fontSize: 'var(--admin-text-xs)' }}
          >
            Préoccupations de Peau
          </button>
          <button
            onClick={() => { setActiveTab('brands'); setEditingItem(null); }}
            className={`px-4 py-2 rounded-xl font-semibold uppercase tracking-widest transition ${
              activeTab === 'brands'
                ? (adminTheme === 'light' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-900 shadow')
                : (adminTheme === 'light' ? 'bg-slate-100 text-slate-500 hover:text-slate-800' : 'bg-slate-900/40 text-slate-400 hover:text-slate-200')
            }`}
            style={{ fontSize: 'var(--admin-text-xs)' }}
          >
            Marques Partenaires
          </button>
        </div>
      </div>

      {/* 3. Editing Panel (if an item is selected for editing inline) */}
      {editingItem && (
        <form onSubmit={handleEditSubmit} className={`p-5 rounded-3xl border space-y-4 animate-fade-in ${
          adminTheme === 'light' ? 'bg-emerald-50/20 border-emerald-200' : 'bg-emerald-950/10 border-emerald-900/40'
        }`}>
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Modification : {activeTab === 'brands' ? editingItem.name : editingItem.labelFr} {activeTab !== 'brands' && `(${editingItem.id})`}
            </h4>
            <button
              type="button"
              onClick={() => { setEditingItem(null); resetForm(); }}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'brands' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nom de la Marque *</label>
                  <input
                    type="text"
                    value={formLabelFr}
                    onChange={e => setFormLabelFr(e.target.value)}
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Lien du Site (Domain)</label>
                  <input
                    type="text"
                    value={formDomain}
                    onChange={e => setFormDomain(e.target.value)}
                    placeholder="Ex: cosrx.com"
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Logo de la Marque (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formLogoUrl}
                      onChange={e => setFormLogoUrl(e.target.value)}
                      placeholder="URL du logo..."
                      className={`w-full text-xs rounded-xl border px-3 py-2 ${
                        adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-950 text-slate-200 border-slate-800'
                      }`}
                    />
                    <label className={`px-4 py-2 font-extrabold rounded-xl text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border shrink-0 transition-all ${
                      adminTheme === 'light'
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}>
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      {isUploading ? '...' : 'Importer'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => setFormLogoUrl(url))}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nom (Français) *</label>
                  <input
                    type="text"
                    value={formLabelFr}
                    onChange={e => setFormLabelFr(e.target.value)}
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Nom (Arabe) *</label>
                  <input
                    type="text"
                    value={formLabelAr}
                    onChange={e => setFormLabelAr(e.target.value)}
                    dir="rtl"
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 text-slate-200 border-slate-800'
                    }`}
                    required
                  />
                </div>
              </>
            )}

            {activeTab === 'concerns' && (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Slogan (Français)</label>
                  <input
                    type="text"
                    value={formTaglineFr}
                    onChange={e => setFormTaglineFr(e.target.value)}
                    placeholder="Ex: BHA · Centella · Niacinamide"
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Slogan (Arabe)</label>
                  <input
                    type="text"
                    value={formTaglineAr}
                    onChange={e => setFormTaglineAr(e.target.value)}
                    dir="rtl"
                    className={`w-full text-xs rounded-xl border px-3 py-2 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                </div>
              </>
            )}
          </div>

          {activeTab === 'concerns' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Keywords Tag Editor */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Mots-clés automatiques (Titre/Desc)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={e => setNewKeywordInput(e.target.value)}
                    placeholder="Taper un mot-clé et cliquer +..."
                    className={`flex-1 text-xs rounded-xl border px-3 py-1.5 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddKeyword(e, 'kw')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formKeywords.map(kw => (
                    <span 
                      key={kw} 
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        adminTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {kw}
                      <X className="w-2.5 h-2.5 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => handleRemoveKeyword(kw, 'kw')} />
                    </span>
                  ))}
                  {formKeywords.length === 0 && <span className="text-[9px] text-slate-400 italic">Aucun mot-clé</span>}
                </div>
              </div>

              {/* Ingredients Keywords Editor */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400">Ingrédients actifs (Déclencheurs)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngKeywordInput}
                    onChange={e => setNewIngKeywordInput(e.target.value)}
                    placeholder="Taper un ingrédient et cliquer +..."
                    className={`flex-1 text-xs rounded-xl border px-3 py-1.5 ${
                      adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleAddKeyword(e, 'ing')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formIngredientKeywords.map(ing => (
                    <span 
                      key={ing} 
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        adminTheme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40'
                      }`}
                    >
                      {ing}
                      <X className="w-2.5 h-2.5 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => handleRemoveKeyword(ing, 'ing')} />
                    </span>
                  ))}
                  {formIngredientKeywords.length === 0 && <span className="text-[9px] text-slate-400 italic">Aucun ingrédient</span>}
                </div>
              </div>

            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setEditingItem(null); resetForm(); }}
              className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider border ${
                adminTheme === 'light' ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-98 transition"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* 4. Grid of category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* If product categories list is selected */}
        {activeTab === 'categories' && displayCategories.map((cat: any) => {
          const matchedProducts = products.filter(p => getProductAssignment(p, 'category', cat.id));
          return (
            <div 
              key={cat.id} 
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-200 hover:shadow-lg relative group ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-900/30 border-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${adminTheme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'}`}>
                      <Tag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black font-mono leading-none text-slate-400 tracking-wider">ID: {cat.id}</h4>
                      <h3 className="font-extrabold text-sm mt-1">{cat.labelFr}</h3>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {cat.source === 'settings' && (
                      <button
                        onClick={() => startEdit(cat)}
                        title="Modifier"
                        className={`p-1.5 rounded-lg border transition ${
                          adminTheme === 'light' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      </button>
                    )}
                    {cat.source === 'settings' && (
                      <button
                        onClick={() => handleDeleteItem(cat.id)}
                        title="Supprimer"
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200/50 dark:border-slate-800 pt-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-light">Traduction Arabe :</span>
                    <span className="font-bold text-slate-700" dir="rtl">{cat.labelAr}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  matchedProducts.length > 0
                    ? (adminTheme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/20 text-indigo-400')
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {matchedProducts.length} Produits associés
                </span>
                <button
                  onClick={() => openProductDrawer(cat)}
                  className={`text-[9px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1 ${
                    adminTheme === 'light' ? 'text-slate-900 hover:underline' : 'text-emerald-400 hover:text-emerald-400'
                  }`}
                >
                  Gérer les produits <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}

        {/* If concerns / curation list is selected */}
        {activeTab === 'concerns' && customConcerns.map((concern: any) => {
          const matchedProducts = products.filter(p => getProductAssignment(p, 'concern', concern.id));
          return (
            <div 
              key={concern.id}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-205 hover:shadow-lg relative group ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-900/30 border-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: concern.accentDot || '#cbd5e1' }} />
                    <div>
                      <h4 className="text-xs font-black font-mono leading-none text-slate-400 tracking-wider">ID: {concern.id}</h4>
                      <h3 className="font-extrabold text-sm mt-1">{concern.labelFr}</h3>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(concern)}
                      title="Modifier"
                      className={`p-1.5 rounded-lg border transition ${
                        adminTheme === 'light' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(concern.id)}
                      title="Supprimer"
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs border-t border-dashed border-slate-200/50 dark:border-slate-800 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-light">Slogan (FR) :</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{concern.taglineFr || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-light">Slogan (AR) :</span>
                    <span className="font-semibold text-slate-600" dir="rtl">{concern.taglineAr || '-'}</span>
                  </div>
                </div>

                {/* Keywords list overview */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Mots-clés matching</span>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {concern.keywords.map((kw: any) => (
                      <span key={kw} className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-md ${
                        adminTheme === 'light' ? 'bg-slate-50 text-slate-600 border border-slate-100' : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>{kw}</span>
                    ))}
                    {concern.keywords.length === 0 && <span className="text-[8px] italic text-slate-400">Aucun</span>}
                  </div>
                </div>

                {/* Ingredients list overview */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Actifs déclencheurs</span>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                    {concern.ingredientKeywords.map((ing: any) => (
                      <span key={ing} className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                        adminTheme === 'light' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/40'
                      }`}>{ing}</span>
                    ))}
                    {concern.ingredientKeywords.length === 0 && <span className="text-[8px] italic text-emerald-400">Aucun</span>}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  matchedProducts.length > 0
                    ? (adminTheme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/20 text-indigo-400')
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {matchedProducts.length} Produits correspondants
                </span>
                <button
                  onClick={() => openProductDrawer(concern)}
                  className={`text-[9px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1 ${
                    adminTheme === 'light' ? 'text-slate-900 hover:underline' : 'text-emerald-400 hover:text-emerald-400'
                  }`}
                >
                  Lier des produits <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}

        {/* If brands list is selected */}
        {activeTab === 'brands' && customBrands.map((brand: any) => {
          const matchedProducts = products.filter(p => getProductAssignment(p, 'brand', brand.name));
          return (
            <div 
              key={brand.name}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-205 hover:shadow-lg relative group ${
                adminTheme === 'light' ? 'bg-white border-slate-200/80' : 'bg-slate-900/30 border-slate-900'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {brand.logoUrl ? (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={brand.logoUrl} alt={brand.name} className="object-contain w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-extrabold flex items-center justify-center shrink-0">
                        {brand.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-sm leading-tight text-slate-800 dark:text-slate-100">{brand.name}</h3>
                      <a href={`https://${brand.domain}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-500 hover:underline font-mono">
                        {brand.domain || 'example.com'}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(brand)}
                      title="Modifier"
                      className={`p-1.5 rounded-lg border transition ${
                        adminTheme === 'light' ? 'bg-slate-50 hover:bg-slate-100 border-slate-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500 hover:text-slate-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(brand.name)}
                      title="Supprimer"
                      className={`p-1.5 rounded-lg border transition ${
                        adminTheme === 'light' ? 'bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600' : 'bg-slate-800 hover:bg-rose-950/20 border-slate-700 hover:border-rose-900 text-slate-500 hover:text-rose-400'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-dashed border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  matchedProducts.length > 0
                    ? (adminTheme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-950/20 text-indigo-400')
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {matchedProducts.length} Produits
                </span>
                <button
                  onClick={() => openProductDrawer(brand)}
                  className={`text-[9px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
                    adminTheme === 'light' ? 'text-slate-900 hover:underline' : 'text-emerald-400 hover:text-emerald-400'
                  }`}
                >
                  Gérer les produits <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}

      </div>

      {/* 5. Create New Category/Concern Modal Dialog */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-[2px] animate-fade-in">
          <div className={`w-full max-w-xl p-6 rounded-3xl border shadow-2xl relative ${
            adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200/50 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> 
                {activeTab === 'categories' ? 'Créer une Catégorie' : 'Créer une Préoccupation Cutanée'}
              </h3>
              <button
                onClick={() => { setIsNewModalOpen(false); resetForm(); }}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab === 'brands' ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Nom de la Marque *</label>
                      <input
                        type="text"
                        value={formLabelFr}
                        onChange={e => setFormLabelFr(e.target.value)}
                        placeholder="Ex: Anua, COSRX"
                        className={`w-full text-xs rounded-xl border px-3 py-2 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Lien du Site (Domain)</label>
                      <input
                        type="text"
                        value={formDomain}
                        onChange={e => setFormDomain(e.target.value)}
                        placeholder="Ex: anua.kr"
                        className={`w-full text-xs rounded-xl border px-3 py-2 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Logo de la Marque (URL)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formLogoUrl}
                          onChange={e => setFormLogoUrl(e.target.value)}
                          placeholder="URL du logo..."
                          className={`w-full text-xs rounded-xl border px-3 py-2 ${
                            adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-200 text-slate-200'
                          }`}
                        />
                        <label className={`px-4 py-2 font-extrabold rounded-xl text-[10px] uppercase cursor-pointer flex items-center gap-1.5 border shrink-0 transition-all ${
                          adminTheme === 'light'
                            ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}>
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          {isUploading ? '...' : 'Importer'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, (url) => setFormLogoUrl(url))}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Identifiant (Code unique en anglais) *</label>
                      <input
                        type="text"
                        value={formId}
                        onChange={e => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                        placeholder="Ex: cheveux, acne, antiage"
                        className={`w-full text-xs rounded-xl border px-3 py-2 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 select-none">Catégorie parente</label>
                      <div className={`text-xs p-2 border border-dashed rounded-xl ${
                        adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}>
                        Racine (Principale)
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Nom en Français *</label>
                      <input
                        type="text"
                        value={formLabelFr}
                        onChange={e => setFormLabelFr(e.target.value)}
                        placeholder="Ex: Hydratation & Barrière"
                        className={`w-full text-xs rounded-xl border px-3 py-2 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Nom en Arabe *</label>
                      <input
                        type="text"
                        value={formLabelAr}
                        onChange={e => setFormLabelAr(e.target.value)}
                        placeholder="Ex: ترطيب وحماية"
                        dir="rtl"
                        className={`w-full text-xs rounded-xl border px-3 py-2 ${
                          adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                        }`}
                        required
                      />
                    </div>

                    {activeTab === 'concerns' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Slogan en Français</label>
                          <input
                            type="text"
                            value={formTaglineFr}
                            onChange={e => setFormTaglineFr(e.target.value)}
                            placeholder="Ex: Acide Hyaluronique · Céramides"
                            className={`w-full text-xs rounded-xl border px-3 py-2 ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Slogan en Arabe</label>
                          <input
                            type="text"
                            value={formTaglineAr}
                            onChange={e => setFormTaglineAr(e.target.value)}
                            placeholder="Ex: حمض الهيالورونيك · سيراميد"
                            dir="rtl"
                            className={`w-full text-xs rounded-xl border px-3 py-2 ${
                              adminTheme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                            }`}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {activeTab === 'concerns' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {/* Keywords Tag Editor */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Mots-clés automatiques</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeywordInput}
                        onChange={e => setNewKeywordInput(e.target.value)}
                        placeholder="Mot-clé..."
                        className={`flex-1 text-xs rounded-xl border px-3 py-1.5 ${
                          adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleAddKeyword(e, 'kw')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                      {formKeywords.map(kw => (
                        <span key={kw} className="text-[8px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {kw}
                          <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => handleRemoveKeyword(kw, 'kw')} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients Tag Editor */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Actifs Déclencheurs</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newIngKeywordInput}
                        onChange={e => setNewIngKeywordInput(e.target.value)}
                        placeholder="Actif (ex: retinol)..."
                        className={`flex-1 text-xs rounded-xl border px-3 py-1.5 ${
                          adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleAddKeyword(e, 'ing')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                      {formIngredientKeywords.map(ing => (
                        <span key={ing} className="text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          {ing}
                          <X className="w-2.5 h-2.5 cursor-pointer" onClick={() => handleRemoveKeyword(ing, 'ing')} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsNewModalOpen(false); resetForm(); }}
                  className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider border ${
                    adminTheme === 'light' ? 'bg-white text-slate-500 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[10px] uppercase tracking-wider shadow-md hover:opacity-90 active:scale-98 transition"
                >
                  {isSaving ? 'Création...' : 'Créer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. Product Linker Slide-over Drawer Panel */}
      {drawerOpen && activeDrawerItem && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          
          {/* Overlay backdrop */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-[1px] cursor-pointer"
          />

          {/* Drawer container */}
          <div className={`relative w-full max-w-lg h-full shadow-2xl flex flex-col p-6 border-l z-10 transition-transform duration-300 animate-slide-in-right ${
            adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            
            {/* Header info */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200/40 dark:border-slate-800/60">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1 mb-1">
                  <Eye className="w-3.5 h-3.5" /> Liaison produits en direct
                </span>
                <h3 className="font-extrabold text-sm uppercase tracking-tight">
                  {activeTab === 'brands' ? activeDrawerItem.name : activeDrawerItem.labelFr}
                </h3>
                <p className="text-[10px] text-slate-400 font-light mt-0.5">
                  {activeTab === 'brands' 
                    ? 'Cochez les produits correspondants pour les lier à cette marque.'
                    : 'Cochez les produits correspondants pour les lier manuellement à cette catégorie.'}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticky Search bar */}
            <div className="relative my-4 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-text-faint)' }} />
              <input
                type="text"
                placeholder="Filtrer par titre, marque ou SKU..."
                value={drawerSearchQuery}
                onChange={e => setDrawerSearchQuery(e.target.value)}
                className="admin-input admin-focus-ring w-full pl-9"
              />
            </div>

            {/* Scrollable list of products */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
              {filteredDrawerProducts.map(p => {
                const isAssoc = getProductAssignment(p, activeTab === 'categories' ? 'category' : 'concern', activeDrawerItem.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleToggleProductAssociation(p)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition select-none hover:translate-x-0.5 hover:shadow-sm ${
                      isAssoc
                        ? (adminTheme === 'light' ? 'bg-emerald-50/40 border-emerald-200 text-emerald-800' : 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400')
                        : (adminTheme === 'light' ? 'bg-white border-slate-100 hover:border-slate-200' : 'bg-slate-950/20 border-slate-900 hover:border-slate-800')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      
                      {/* Product check status */}
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isAssoc
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-transparent'
                      }`}>
                        {isAssoc && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Product Image */}
                      <div className={`w-8 h-8 rounded-lg overflow-hidden border shrink-0 bg-slate-100 flex items-center justify-center ${
                        adminTheme === 'light' ? 'border-slate-100' : 'border-slate-800'
                      }`}>
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Tag className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>

                      {/* Details */}
                      <div>
                        <h4 className="font-bold text-[11px] leading-tight line-clamp-1">{p.nameFr || p.title}</h4>
                        <span className="text-[9px] text-slate-400 mt-0.5 block font-light">{p.vendor} • SKU: {p.sku || p.id}</span>
                      </div>

                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold block">{p.price} DH</span>
                      {p.stock !== undefined && (
                        <span className={`text-[8px] font-bold block ${p.stock > 0 ? 'text-slate-400' : 'text-rose-500'}`}>
                          {p.stock > 0 ? `${p.stock} en stock` : 'Rupture'}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}

              {filteredDrawerProducts.length === 0 && (
                <div className="p-8 text-center space-y-2">
                  <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs text-slate-400 italic font-light">Aucun produit ne correspond à votre recherche.</p>
                </div>
              )}
            </div>

            {/* Bottom count display */}
            <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/60 flex justify-between items-center text-xs shrink-0">
              <span className="text-slate-400">Total : {filteredDrawerProducts.length} produits</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-[10px] uppercase tracking-wider"
              >
                Fermer
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

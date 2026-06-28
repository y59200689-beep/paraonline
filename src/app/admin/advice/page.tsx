'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { canManageAdvice } from '@/lib/permissions';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  Globe, 
  BookOpen, 
  Check, 
  X, 
  Eye, 
  AlertCircle,
  Clock,
  Tag,
  ArrowUpDown,
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
  Code
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
  lang: 'fr' | 'ar';
  adminTheme: 'light' | 'dark';
}

function MarkdownEditor({ value, onChange, disabled, placeholder, lang, adminTheme }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = React.useState<'write' | 'preview'>('write');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (syntax: string, placeholderText = '') => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(startPos, endPos) || placeholderText;

    let insertion = '';
    if (syntax === 'bold') {
      insertion = `**${selectedText}**`;
    } else if (syntax === 'italic') {
      insertion = `*${selectedText}*`;
    } else if (syntax === 'heading') {
      insertion = `\n### ${selectedText}`;
    } else if (syntax === 'list') {
      insertion = `\n- ${selectedText}`;
    } else if (syntax === 'link') {
      insertion = `[${selectedText}](https://example.com)`;
    } else if (syntax === 'code') {
      insertion = `\n\`\`\`javascript\n${selectedText}\n\`\`\`\n`;
    }

    const newValue = text.substring(0, startPos) + insertion + text.substring(endPos);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + insertion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const parseMarkdownToHtml = (mdText: string) => {
    if (!mdText) return '';
    let html = mdText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-950 text-slate-200 p-3.5 rounded-xl font-mono text-[10px] overflow-auto my-3 border border-slate-800"><code>$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[10px] border dark:border-slate-800 text-rose-500 font-bold">$1</code>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-lg font-black mt-4 mb-2">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-md font-extrabold mt-4 mb-2 border-b pb-1 dark:border-slate-850">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-extrabold mt-3 mb-1.5">$1</h3>');
    html = html.replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-500 hover:underline font-semibold">$1</a>');

    const lines = html.split('\n');
    let insidePre = false;
    const processedLines = lines.map(line => {
      if (line.includes('<pre') || line.includes('<code')) insidePre = true;
      if (line.includes('</pre>') || line.includes('</code>')) insidePre = false;
      
      if (insidePre) return line;
      if (line.trim() === '') return '<div class="h-2"></div>';
      
      if (!line.startsWith('<h') && !line.startsWith('<li') && !line.startsWith('<pre') && !line.startsWith('<div')) {
        return `<p class="my-1 text-[11px] leading-relaxed">${line}</p>`;
      }
      return line;
    });

    return processedLines.join('\n');
  };

  const previewHtml = React.useMemo(() => parseMarkdownToHtml(value), [value]);
  const light = adminTheme === 'light';

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
      light ? 'bg-white border-slate-200/80 shadow-sm' : 'bg-slate-900/20 border-slate-800/80'
    }`}>
      <div className={`flex flex-wrap justify-between items-center px-4 py-2 border-b gap-2 ${
        light ? 'bg-slate-50 border-slate-200/60' : 'bg-slate-950/40 border-slate-850'
      }`}>
        <div className={`flex items-center gap-1.5 transition-opacity ${activeTab === 'preview' ? 'opacity-30 pointer-events-none' : ''}`}>
          <button
            type="button"
            onClick={() => insertMarkdown('bold', 'texte gras')}
            title="Gras"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('italic', 'texte italique')}
            title="Italique"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('heading', 'Titre')}
            title="Titre H3"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <Heading className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('list', 'élément')}
            title="Liste à puces"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('link', 'texte du lien')}
            title="Lien"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdown('code', '// code ici')}
            title="Code block"
            disabled={disabled}
            className={`p-1.5 rounded hover:bg-slate-550/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`flex rounded-lg p-0.5 border ${light ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'write'
                ? (light ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white')
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            Éditeur
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'preview'
                ? (light ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-800 text-white')
                : 'text-slate-500 hover:text-slate-400'
            }`}
          >
            Aperçu
          </button>
        </div>
      </div>

      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          rows={8}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3.5 py-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border-0 outline-none transition focus:bg-white dark:focus:bg-black resize-y ${
            light ? 'text-slate-800' : 'text-slate-200'
          }`}
          placeholder={placeholder}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
      ) : (
        <div 
          className={`w-full px-4 py-3 min-h-[164px] max-h-[320px] overflow-y-auto prose dark:prose-invert text-[11px] leading-relaxed select-text ${
            lang === 'ar' ? 'text-right' : 'text-left'
          } ${light ? 'bg-white text-slate-800' : 'bg-slate-950 text-slate-300'}`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          dangerouslySetInnerHTML={{ __html: previewHtml || `<em class="text-slate-400 font-light">${lang === 'ar' ? 'لا يوجد محتوى للمعاينة' : 'Aucun contenu à prévisualiser.'}</em>` }}
        />
      )}
    </div>
  );
}

export default function AdminAdvicePage() {
  const { 
    adviceArticles, 
    products, 
    currentUser, 
    adminTheme,
    handleCreateAdviceArticle,
    handleUpdateAdviceArticle,
    handleDeleteAdviceArticle
  } = useAdmin();

  const isOwner = currentUser ? canManageAdvice(currentUser.role) : false;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<'fr' | 'ar'>('fr');

  // Form states
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState('skincare');
  const [formImage, setFormImage] = useState('');
  const [formReadTime, setFormReadTime] = useState(5);
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formRecommendedProducts, setFormRecommendedProducts] = useState<number[]>([]);
  
  // Localized FR Form states
  const [formTitleFr, setFormTitleFr] = useState('');
  const [formSummaryFr, setFormSummaryFr] = useState('');
  const [formContentFr, setFormContentFr] = useState('');

  // Localized AR Form states
  const [formTitleAr, setFormTitleAr] = useState('');
  const [formSummaryAr, setFormSummaryAr] = useState('');
  const [formContentAr, setFormContentAr] = useState('');

  // Auto-generate slug helper
  const handleTitleFrChange = (val: string) => {
    setFormTitleFr(val);
    if (!editingId) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, '-'); // replace spaces with hyphens
      setFormSlug(generated);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = adviceArticles.length;
    const published = adviceArticles.filter(a => a.status === 'published').length;
    const drafts = total - published;
    return { total, published, drafts };
  }, [adviceArticles]);

  // Filtered advice articles
  const filteredArticles = useMemo(() => {
    return adviceArticles.filter(art => {
      const matchesSearch = 
        art.title_fr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.slug.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || art.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [adviceArticles, searchQuery, categoryFilter, statusFilter]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormSlug('');
    setFormCategory('skincare');
    setFormImage('');
    setFormReadTime(5);
    setFormStatus('draft');
    setFormRecommendedProducts([]);
    setFormTitleFr('');
    setFormSummaryFr('');
    setFormContentFr('');
    setFormTitleAr('');
    setFormSummaryAr('');
    setFormContentAr('');
    setActiveLangTab('fr');
  };

  // Open creation modal
  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (article: any) => {
    setEditingId(article.id);
    setFormSlug(article.slug);
    setFormCategory(article.category);
    setFormImage(article.image);
    setFormReadTime(article.read_time);
    setFormStatus(article.status);
    setFormRecommendedProducts(article.recommended_products || []);
    
    setFormTitleFr(article.title_fr);
    setFormSummaryFr(article.summary_fr);
    setFormContentFr(article.content_fr);
    
    setFormTitleAr(article.title_ar);
    setFormSummaryAr(article.summary_ar);
    setFormContentAr(article.content_ar);

    setActiveLangTab('fr');
    setIsModalOpen(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSlug || !formTitleFr || !formTitleAr || !formContentFr || !formContentAr || !formSummaryFr || !formSummaryAr || !formImage) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      slug: formSlug,
      category: formCategory,
      image: formImage,
      read_time: Number(formReadTime),
      status: formStatus,
      recommended_products: formRecommendedProducts,
      title_fr: formTitleFr,
      summary_fr: formSummaryFr,
      content_fr: formContentFr,
      title_ar: formTitleAr,
      summary_ar: formSummaryAr,
      content_ar: formContentAr
    };

    let success = false;
    if (editingId) {
      success = await handleUpdateAdviceArticle(editingId, payload);
    } else {
      success = await handleCreateAdviceArticle(payload);
    }

    if (success) {
      setIsModalOpen(false);
      resetForm();
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Voulez-vous vraiment supprimer l'article "${title}" ?`)) {
      await handleDeleteAdviceArticle(id);
    }
  };

  // Toggle recommended products selection
  const handleProductToggle = (productId: number) => {
    if (formRecommendedProducts.includes(productId)) {
      setFormRecommendedProducts(formRecommendedProducts.filter(id => id !== productId));
    } else {
      setFormRecommendedProducts([...formRecommendedProducts, productId]);
    }
  };

  return (
    <div className="space-y-6 admin-tab-enter">
      
      {/* 1. Metrics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Articles", value: metrics.total, desc: "Articles rédigés", border: "border-slate-200/60 dark:border-slate-800" },
          { label: "Publiés", value: metrics.published, desc: "Visibles sur le site", border: "border-emerald-200/50 dark:border-emerald-950/30", text: "text-emerald-500" },
          { label: "Brouillons", value: metrics.drafts, desc: "En cours de rédaction", border: "border-amber-200/50 dark:border-amber-950/30", text: "text-amber-500" }
        ].map((m, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-sm flex flex-col justify-between ${m.border}`}
          >
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{m.label}</span>
              <span className={`text-3xl font-black mt-2 block ${m.text || 'text-slate-800 dark:text-slate-100'}`}>{m.value}</span>
            </div>
            <span className="text-xs text-slate-400 font-light mt-3 block">{m.desc}</span>
          </div>
        ))}
      </div>

      {/* 2. Controls toolbar */}
      <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-900/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher par titre ou slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 focus:border-emerald-500/60 text-slate-700 dark:text-slate-200 rounded-xl outline-none transition"
            />
          </div>

          {/* Category selection */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl outline-none transition cursor-pointer"
          >
            <option value="all">Toutes Catégories</option>
            <option value="skincare">Soin de peau</option>
            <option value="kbeauty">K-Beauty</option>
            <option value="routine">Routine</option>
          </select>

          {/* Status selection */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-300 rounded-xl outline-none transition cursor-pointer"
          >
            <option value="all">Tous les Statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>

        {/* Add button (only for owners) */}
        {isOwner ? (
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Rédiger un Article</span>
          </button>
        ) : (
          <div className="text-xs font-medium text-amber-500 flex items-center gap-1.5 px-3 py-2 border border-amber-500/20 bg-amber-500/5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Mode Lecture Seule</span>
          </div>
        )}
      </div>

      {/* 3. Grid / Table of articles */}
      <div className="border border-slate-200/60 dark:border-slate-900 rounded-2xl overflow-hidden bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-900 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                <th className="p-4 font-semibold">Visuel</th>
                <th className="p-4 font-semibold">Article / Titre</th>
                <th className="p-4 font-semibold">Catégorie</th>
                <th className="p-4 font-semibold">Temps de lecture</th>
                <th className="p-4 font-semibold">Produits Liés</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-600 font-light text-xs">
                    Aucun article trouvé.
                  </td>
                </tr>
              ) : (
                filteredArticles.map(art => (
                  <tr 
                    key={art.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition duration-150 text-slate-700 dark:text-slate-300"
                  >
                    {/* Cover image thumbnail */}
                    <td className="p-4">
                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={art.image} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200&auto=format&fit=crop';
                          }}
                        />
                      </div>
                    </td>

                    {/* Excerpt / Titles */}
                    <td className="p-4 max-w-xs">
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-slate-100 truncate leading-normal" title={art.title_fr}>
                          {art.title_fr}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block truncate mt-0.5" dir="ltr">
                          /{art.slug}
                        </span>
                      </div>
                    </td>

                    {/* Category tag */}
                    <td className="p-4 font-semibold capitalize">
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        <span>{art.category === 'kbeauty' ? 'K-Beauty' : art.category === 'skincare' ? 'Soin de Peau' : art.category}</span>
                      </span>
                    </td>

                    {/* Read time */}
                    <td className="p-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{art.read_time} min</span>
                      </span>
                    </td>

                    {/* Recommended products count */}
                    <td className="p-4 font-semibold text-slate-500">
                      <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-full">
                        {art.recommended_products?.length || 0} produits
                      </span>
                    </td>

                    {/* Status pill */}
                    <td className="p-4">
                      {art.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                          <Check className="w-3 h-3 stroke-[2.5]" /> Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200/50 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800">
                          Brouillon
                        </span>
                      )}
                    </td>

                    {/* Actions buttons */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(art)}
                          title="Modifier"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleDelete(art.id, art.title_fr)}
                            title="Supprimer"
                            className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Creation & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className={`w-full max-w-4xl border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 ${
              adminTheme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              adminTheme === 'light' ? 'border-slate-100 bg-slate-50/30' : 'border-slate-800 bg-slate-950/10'
            }`}>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {editingId ? "Modifier l'Article Conseils" : "Créer un Nouvel Article Conseils"}
                </h3>
                <span className="text-[10px] text-slate-400 font-light block">
                  {isOwner ? "Saisissez les informations dans les deux langues." : "Mode aperçu - Modification désactivée."}
                </span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Common Configuration Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Catégorie</label>
                  <select
                    value={formCategory}
                    disabled={!isOwner}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition cursor-pointer"
                  >
                    <option value="skincare">Soin de peau (Skincare)</option>
                    <option value="kbeauty">K-Beauty Coréen</option>
                    <option value="routine">Routine de Soin</option>
                  </select>
                </div>

                {/* Read time */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Temps de lecture (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={formReadTime}
                    disabled={!isOwner}
                    onChange={(e) => setFormReadTime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition"
                    required
                  />
                </div>

                {/* Publication Status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Statut</label>
                  <select
                    value={formStatus}
                    disabled={!isOwner}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition cursor-pointer"
                  >
                    <option value="draft">Brouillon (Non visible)</option>
                    <option value="published">Publié (En Ligne)</option>
                  </select>
                </div>
              </div>

              {/* Cover Image & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Slug */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Slug d&apos;URL unique</label>
                  <input
                    type="text"
                    value={formSlug}
                    disabled={!isOwner}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                    className="w-full px-3.5 py-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition"
                    placeholder="ex: ma-routine-skincare-kbeauty"
                    required
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">URL de l&apos;image couverture</label>
                  <input
                    type="text"
                    value={formImage}
                    disabled={!isOwner}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition"
                    placeholder="https://images.unsplash.com/..."
                    required
                  />
                </div>
              </div>

              {/* Translation Tabs */}
              <div className="space-y-4">
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
                  {[
                    { id: 'fr', label: "Français (FR)" },
                    { id: 'ar', label: "عربي (AR)" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveLangTab(tab.id as any)}
                      className={`px-4 py-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                        activeLangTab === tab.id
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* French fields */}
                {activeLangTab === 'fr' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Titre (FR)</label>
                      <input
                        type="text"
                        value={formTitleFr}
                        disabled={!isOwner}
                        onChange={(e) => handleTitleFrChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition"
                        placeholder="Rédiger le titre français..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Extrait / Résumé Court (FR)</label>
                      <textarea
                        rows={2}
                        value={formSummaryFr}
                        disabled={!isOwner}
                        onChange={(e) => setFormSummaryFr(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition resize-none"
                        placeholder="Court résumé de présentation de l'article pour le feed..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contenu de l&apos;article en Markdown (FR)</label>
                      <MarkdownEditor
                        value={formContentFr}
                        onChange={setFormContentFr}
                        disabled={!isOwner}
                        placeholder="Rédigez l'article complet au format Markdown..."
                        lang="fr"
                        adminTheme={adminTheme}
                      />
                    </div>
                  </div>
                )}
 
                {/* Arabic fields */}
                {activeLangTab === 'ar' && (
                  <div className="space-y-4 animate-in fade-in duration-200" dir="rtl" style={{ textAlign: 'right' }}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">العنوان (AR)</label>
                      <input
                        type="text"
                        value={formTitleAr}
                        disabled={!isOwner}
                        onChange={(e) => setFormTitleAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition"
                        placeholder="اكتب العنوان باللغة العربية..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">موجز قصير (AR)</label>
                      <textarea
                        rows={2}
                        value={formSummaryAr}
                        disabled={!isOwner}
                        onChange={(e) => setFormSummaryAr(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 text-slate-700 dark:text-slate-200 rounded-xl outline-none focus:border-emerald-500/60 transition resize-none"
                        placeholder="ملخص المقال للعرض في صفحة المقالات..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">محتوى المقال بتنسيق Markdown (AR)</label>
                      <MarkdownEditor
                        value={formContentAr}
                        onChange={setFormContentAr}
                        disabled={!isOwner}
                        placeholder="اكتب المقال الكامل باللغة العربية بتنسيق Markdown..."
                        lang="ar"
                        adminTheme={adminTheme}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Product Mapping Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Associer des Produits Recommandés ({formRecommendedProducts.length} sélectionnés)
                </label>
                <div className="p-4 border border-slate-200/60 dark:border-slate-850 rounded-2xl max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-950/20">
                  {products.map(p => {
                    const isChecked = formRecommendedProducts.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={!isOwner}
                        onClick={() => handleProductToggle(p.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-left border transition text-xs select-none active:scale-[0.98] ${
                          isChecked 
                            ? 'bg-emerald-50/50 border-emerald-500/30 text-slate-800 dark:bg-emerald-950/10 dark:text-emerald-400' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-3 font-semibold">{p.name || p.title}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions Footer */}
              {isOwner && (
                <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200/60 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl cursor-pointer text-xs font-semibold active:scale-[0.98] transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer text-xs active:scale-[0.98] transition"
                  >
                    {editingId ? "Enregistrer les modifications" : "Publier / Créer l'Article"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

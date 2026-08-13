'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import type { CmsBrandRecord } from '@/lib/cms-brands';
import { ShopShell } from '@/components/ShopShell';

function pick(value: Record<string, unknown>, key: string, language: string) {
  return String(value[`${key}${language === 'AR' ? 'Ar' : 'Fr'}`] ?? value[key] ?? '');
}

export function CmsBrandPage({ brand }: { brand: CmsBrandRecord }) {
  const { language } = useTranslation();
  const sections = brand.page_sections ?? [];
  return <ShopShell>
    <main className="public-page min-h-screen bg-[var(--public-surface-muted)] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative isolate overflow-hidden rounded-[var(--public-radius-lg)] bg-[var(--public-ink)] px-6 py-16 text-white shadow-[var(--public-shadow-lg)] sm:px-12">
          {brand.hero_settings?.image ? <Image src={String(brand.hero_settings.image)} alt={brand.name} fill className="-z-10 object-cover opacity-45" sizes="100vw" priority /> : null}
          <div className="relative max-w-3xl space-y-5"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">{pick(brand.hero_settings ?? {}, 'eyebrow', language) || brand.name}</p><h1 className="text-4xl font-black leading-[1.05] sm:text-6xl">{pick(brand.hero_settings ?? {}, 'title', language) || brand.taglineFr}</h1><p className="max-w-2xl text-base leading-7 text-slate-200">{pick(brand.hero_settings ?? {}, 'description', language) || (language === 'AR' ? brand.descriptionAr : brand.descriptionFr)}</p></div>
        </section>
        {sections.map((section, index) => <section key={String(section.id ?? index)} className="public-card grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
          {section.image ? <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--public-radius-md)] bg-slate-100"><Image src={String(section.image)} alt={pick(section, 'title', language)} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" /></div> : null}
          <div className="space-y-4"><h2 className="text-2xl font-black text-[var(--public-ink)]">{pick(section, 'title', language)}</h2><p className="whitespace-pre-line leading-7 text-slate-600">{pick(section, 'body', language)}</p>{section.ctaLink && section.ctaLabel ? <Link href={String(section.ctaLink)} className="po-ui-button po-ui-button--primary inline-flex">{pick(section, 'ctaLabel', language)} <span aria-hidden="true">→</span></Link> : null}</div>
        </section>)}
      </div>
    </main>
  </ShopShell>;
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import type { CmsPublicPage, CmsPageSection } from '@/lib/cms-pages';

function text(settings: Record<string, unknown>, key: string, language: string) {
  const suffix = language === 'AR' ? 'Ar' : 'Fr';
  return String(settings[`${key}${suffix}`] ?? settings[key] ?? '');
}

function Section({ section, language }: { section: CmsPageSection; language: string }) {
  if (section.visible === false) return null;
  const settings = section.settings ?? {};
  const type = section.section_type ?? section.type ?? 'richText';
  const title = text(settings, 'title', language);
  const body = text(settings, 'body', language) || text(settings, 'html', language);
  const image = String(settings.image ?? settings.imageUrl ?? '');
  const cta = text(settings, 'ctaLabel', language) || text(settings, 'ctaText', language);
  const href = String(settings.ctaLink ?? settings.href ?? '#');

  if (type === 'hero') return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-white sm:px-12">
      {image ? <Image src={image} alt="" fill className="-z-10 object-cover opacity-35" sizes="100vw" /> : null}
      <div className="relative max-w-3xl space-y-5"><p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">{text(settings, 'eyebrow', language)}</p><h1 className="text-4xl font-black tracking-tight sm:text-6xl">{title}</h1><p className="max-w-2xl text-base leading-7 text-slate-200">{body}</p>{cta && href ? <Link href={href} className="inline-flex rounded-full bg-emerald-400 px-6 py-3 font-bold text-slate-950">{cta}</Link> : null}</div>
    </section>
  );

  if (type === 'imageText' || type === 'image_text') return (
    <section className="grid items-center gap-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
      {image ? <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100"><Image src={image} alt={title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" /></div> : null}
      <div className="space-y-4"><h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{title}</h2><p className="whitespace-pre-line leading-7 text-slate-600">{body}</p>{cta && href ? <Link href={href} className="inline-flex font-bold text-emerald-700">{cta} →</Link> : null}</div>
    </section>
  );

  return <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><h2 className="text-2xl font-black text-slate-950">{title}</h2>{body ? <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">{body}</p> : null}{cta && href ? <Link href={href} className="mt-5 inline-flex font-bold text-emerald-700">{cta} →</Link> : null}</section>;
}

export function CmsPageRenderer({ page }: { page: CmsPublicPage }) {
  const { language } = useTranslation();
  const sections = Array.isArray(page.section_order) ? page.section_order : [];
  if (!sections.length) return null;
  return <main className="min-h-screen bg-[#f7faf9] px-4 py-10 sm:px-8"><div className="mx-auto max-w-6xl space-y-6">{sections.map(section => <Section key={section.id} section={section} language={language} />)}</div></main>;
}

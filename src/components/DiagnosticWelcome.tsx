'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ArrowUpRight, ScanFace, Sparkles, X } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import styles from './DiagnosticWelcome.module.css';

const SEEN_KEY = 'para-divine-diagnostic-welcome-v1';

type DiagnosticWelcomeProps = {
  blocked: boolean;
  onStart: () => void;
};

export function DiagnosticWelcome({ blocked, onStart }: DiagnosticWelcomeProps) {
  const { language } = useTranslation();
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isArabic = language === 'AR';

  useEffect(() => {
    if (blocked || open || shownRef.current) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Storage may be unavailable; the invitation can still be dismissed.
    }

    const timer = window.setTimeout(() => {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      shownRef.current = true;
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* Storage is optional. */ }
      setOpen(true);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [blocked, open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const storefront = document.querySelector<HTMLElement>('.public-page');
    const wasInert = storefront?.inert ?? false;
    if (storefront) storefront.inert = true;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (storefront) storefront.inert = wasInert;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) setOpen(false);
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostic-welcome-title"
        aria-describedby="diagnostic-welcome-description"
        dir={isArabic ? 'rtl' : 'ltr'}
        className={styles.dialog}
      >
        <div className={styles.visual}>
          <Image
            src="/images/about-diagnostic-face-scan.webp"
            alt={isArabic ? 'تصوير توضيحي لتحليل البشرة' : 'Illustration d’une analyse personnalisée de la peau'}
            fill
            sizes="(max-width: 700px) 100vw, 360px"
            className={styles.photo}
            priority
          />
          <div className={styles.visualShade} />
          <div className={styles.visualMark} aria-hidden="true"><ScanFace size={22} strokeWidth={1.7} /></div>
          <div className={styles.visualCaption}>
            <span className={styles.visualCaptionLine} />
            {isArabic ? 'العناية تبدأ بفهم بشرتك' : 'La beauté commence par vous connaître'}
          </div>
        </div>

        <div className={styles.content}>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label={isArabic ? 'إغلاق النافذة' : 'Fermer la fenêtre'}
          >
            <X size={20} strokeWidth={1.8} />
          </button>

          <div className={styles.copy}>
            <span className={styles.eyebrow}><Sparkles size={15} /> {isArabic ? 'جديد لدى بارا ديفين' : 'NOUVEAU CHEZ PARA DIVINE'}</span>
            <h2 id="diagnostic-welcome-title" className={styles.title}>
              {isArabic ? <>بشرتك فريدة.<br /><em>روتينك كذلك.</em></> : <>Votre peau est unique.<br /><em>Votre routine aussi.</em></>}
            </h2>
            <p id="diagnostic-welcome-description" className={styles.description}>
              {isArabic
                ? 'اكتشفي تشخيص البشرة الذكي لدينا. أجيبي عن بضعة أسئلة لنساعدك على اختيار روتين ومنتجات تناسب احتياجات بشرتك.'
                : 'Découvrez notre diagnostic de peau IA. Répondez à quelques questions pour trouver une routine et des soins adaptés à vos besoins.'}
            </p>
            <div className={styles.rule} />
            <p className={styles.note}>
              <span className={styles.noteIcon}><ScanFace size={18} strokeWidth={1.7} /></span>
              {isArabic ? 'نصائح مخصصة، بخطوات بسيطة' : 'Des conseils personnalisés, en quelques étapes'}
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => { setOpen(false); onStart(); }}
            >
              <span>{isArabic ? 'ابدئي تشخيص بشرتك' : 'Découvrir mon diagnostic'}</span>
              <ArrowUpRight size={19} strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" className={styles.secondary} onClick={() => setOpen(false)}>
              {isArabic ? 'ربما لاحقًا' : 'Peut-être plus tard'}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

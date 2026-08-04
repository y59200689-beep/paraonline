'use client';

import { useServerInsertedHTML } from 'next/navigation';

/**
 * Injects the theme/language initialisation script during SSR via
 * useServerInsertedHTML so it lands outside the React component tree.
 *
 * Store settings, including the public colour system, are rendered by the
 * server. Do not read them from browser storage here: storage is private to
 * each browser and could otherwise leave two visitors on different versions
 * of the same storefront theme.
 */
export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      id="theme-language-init"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `try{
  document.documentElement.classList.remove('dark-mode');
  var l=localStorage.getItem('selectedLanguageBM');
  if(l==='AR'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}
  else{document.documentElement.dir='ltr';document.documentElement.lang='fr';}
  window.__PARA_GALLERY_OVERRIDES__={};
  window.__PARA_SETTINGS_CACHE__=null;
}catch(e){window.__PARA_GALLERY_OVERRIDES__={};window.__PARA_SETTINGS_CACHE__=null;}`,
      }}
    />
  ));
  return null;
}

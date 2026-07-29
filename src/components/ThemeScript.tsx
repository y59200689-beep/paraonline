'use client';

import { useServerInsertedHTML } from 'next/navigation';

/**
 * Injects the theme/language initialisation script during SSR via
 * useServerInsertedHTML so it lands outside the React component tree.
 *
 * Gallery images are intentionally excluded from browser storage. Their
 * registry is loaded from the server with the rest of the initial settings.
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
  var sc=localStorage.getItem('para_settings_cache');
  var sp=sc?JSON.parse(sc):null;
  window.__PARA_SETTINGS_CACHE__=sp;
}catch(e){window.__PARA_GALLERY_OVERRIDES__={};window.__PARA_SETTINGS_CACHE__=null;}`,
      }}
    />
  ));
  return null;
}

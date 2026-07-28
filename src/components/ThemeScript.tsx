'use client';

import { useServerInsertedHTML } from 'next/navigation';

/**
 * Injects the theme/language initialisation script during SSR via
 * useServerInsertedHTML so it lands outside the React component tree.
 * This avoids the React 19 "Encountered a script tag while rendering"
 * warning that fires when a <script> element is rendered by React itself.
 *
 * Also stamps gallery overrides and settings cache onto window from
 * localStorage BEFORE React hydrates, eliminating hero image flash.
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
  var go=localStorage.getItem('custom_gallery_overrides');
  window.__PARA_GALLERY_OVERRIDES__=go?JSON.parse(go):{};
  var sc=localStorage.getItem('para_settings_cache');
  var sp=sc?JSON.parse(sc):null;
  window.__PARA_SETTINGS_CACHE__=(sp&&sp.__v==='v3')?sp:null;
}catch(e){window.__PARA_GALLERY_OVERRIDES__={};window.__PARA_SETTINGS_CACHE__=null;}`,
      }}
    />
  ));
  return null;
}

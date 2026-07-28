'use client';

import { useServerInsertedHTML } from 'next/navigation';

/**
 * Injects the theme/language initialisation script during SSR via
 * useServerInsertedHTML so it lands outside the React component tree.
 *
 * Also stamps gallery overrides and settings cache onto window from
 * localStorage BEFORE React hydrates, eliminating hero image flash.
 *
 * KEY CHANGE: also patches banners[i].bgImage from galleryOverrides
 * so next-refresh uses the correct image URL without any fetch delay.
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
  var overrides=go?JSON.parse(go):{};
  window.__PARA_GALLERY_OVERRIDES__=overrides;
  var sc=localStorage.getItem('para_settings_cache');
  var sp=sc?JSON.parse(sc):null;
  if(sp&&typeof sp==='object'){
    sp.galleryOverrides=Object.assign({},sp.galleryOverrides||{},overrides);
    var keysMap=['hero_bestsellers','hero_summersale','hero_weeklypromo','hero_newarrivals'];
    if(Array.isArray(sp.banners)){
      sp.banners=sp.banners.map(function(b,i){
        var k=keysMap[i];
        var ov=k&&sp.galleryOverrides[k];
        return ov?Object.assign({},b,{bgImage:ov}):b;
      });
    }
  }
  window.__PARA_SETTINGS_CACHE__=sp;
}catch(e){window.__PARA_GALLERY_OVERRIDES__={};window.__PARA_SETTINGS_CACHE__=null;}`,
      }}
    />
  ));
  return null;
}

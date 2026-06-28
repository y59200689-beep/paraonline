'use client';

import { useServerInsertedHTML } from 'next/navigation';

/**
 * Injects the theme/language initialisation script during SSR via
 * useServerInsertedHTML so it lands outside the React component tree.
 * This avoids the React 19 "Encountered a script tag while rendering"
 * warning that fires when a <script> element is rendered by React itself.
 */
export function ThemeScript() {
  useServerInsertedHTML(() => (
    <script
      id="theme-language-init"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `try{document.documentElement.classList.remove('dark-mode');var l=localStorage.getItem('selectedLanguageBM');if(l==='AR'){document.documentElement.dir='rtl';document.documentElement.lang='ar';}else{document.documentElement.dir='ltr';document.documentElement.lang='fr';}}catch(e){}`,
      }}
    />
  ));
  return null;
}

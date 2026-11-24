'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/context/ProductsContext';
import type { HomepageSectionItem, Settings } from '@/context/SettingsContext';
import type { Product } from '@/lib/data';
import { getBestSellerPins, resolveHomepageBestSellers } from '@/lib/homepage-best-sellers';

export function useHomepageBestSellers(homepage: Settings['homepageSections'], sections?: HomepageSectionItem[]) {
  const { products, isLoading } = useProducts();
  const best = sections?.find(section => section.type === 'bestSellers');
  const weekly = sections?.find(section => section.type === 'weeklySales');
  const knownIds = new Set(products.map(product => product.id));
  const missingIds = [...new Set([
    ...getBestSellerPins(homepage, best),
    ...(weekly?.settings?.productIds ?? homepage?.weeklySalesProductIds ?? []),
  ])].filter(id => !knownIds.has(id)).sort((a, b) => a - b).join(',');
  const [extra, setExtra] = useState<{ ids: string; products: Product[] }>();

  useEffect(() => {
    if (!missingIds || isLoading) return;
    const controller = new AbortController();
    const ids = missingIds.split(',');
    const requests = [];
    for (let offset = 0; offset < ids.length; offset += 50) {
      requests.push(fetch(`/api/products?ids=${ids.slice(offset, offset + 50).join(',')}`, {
        cache: 'no-store',
        signal: controller.signal,
      }).then(async response => {
        if (!response.ok) throw new Error('Homepage products unavailable');
        const data = await response.json();
        return (data.products ?? []) as Product[];
      }));
    }
    void Promise.allSettled(requests).then(results => {
      if (controller.signal.aborted) return;
      setExtra({ ids: missingIds, products: results.flatMap(result => result.status === 'fulfilled' ? result.value : []) });
    });
    return () => controller.abort();
  }, [isLoading, missingIds]);

  const resolved = extra?.ids === missingIds ? [...products, ...extra.products] : products;
  return {
    products: resolveHomepageBestSellers(resolved, homepage, sections),
    isLoading: Boolean(isLoading || (missingIds && extra?.ids !== missingIds)),
  };
}

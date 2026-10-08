export type SitemapProductRow = {
  id: number;
  updated_at: string | null;
};

type ProductBatch = {
  data: SitemapProductRow[] | null;
  error: unknown;
};

type FetchProductBatch = (from: number, to: number) => Promise<ProductBatch>;
type SitemapLogger = (message: string, details?: { code: string }) => void;

const DEFAULT_PAGE_SIZE = 1000;

function safeErrorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && /^[A-Z0-9_-]{1,32}$/i.test(code)) return code;
  }
  return 'unknown';
}

/**
 * Fetch every live product for the sitemap. A partial or empty product list
 * would falsely signal successful sitemap generation, so failures are logged
 * without database messages/credentials and then propagated to the route.
 */
export async function loadSitemapProducts(
  fetchBatch: FetchProductBatch,
  pageSize = DEFAULT_PAGE_SIZE,
  logger: SitemapLogger = console.error,
): Promise<SitemapProductRow[]> {
  const products: SitemapProductRow[] = [];

  try {
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await fetchBatch(offset, offset + pageSize - 1);
      if (error) throw error;

      const batch = data ?? [];
      products.push(...batch);
      if (batch.length < pageSize) break;
    }
  } catch (error) {
    logger('[sitemap] Live product query failed; refusing to emit an incomplete product sitemap.', {
      code: safeErrorCode(error),
    });
    throw new Error('Unable to load live products for sitemap; refusing incomplete product URLs.');
  }

  if (products.length === 0) {
    logger('[sitemap] Live product query returned no rows; refusing to emit an empty product sitemap.');
    throw new Error('Live product query returned no rows; refusing an empty product sitemap.');
  }

  return products;
}

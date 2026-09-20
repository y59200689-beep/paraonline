// Official replacement assets, bundled to avoid third-party logo service failures.
const logos: Record<string, string> = {
  anua: '/images/brands/anua-official.png',
  larocheposay: '/images/brands/laroche.webp',
  vichy: '/images/brands/vichy.webp',
  cerave: '/images/brands/cerave-official.svg',
  eucerin: '/images/brands/eucerin-official.svg',
  bioderma: '/images/brands/bioderma-official.svg',
  svr: '/images/brands/svr-official.png',
  cetaphil: '/images/brands/cetaphil-official.png',
  avene: '/images/brands/avene-official.png',
  mixa: '/images/brands/mixa-official.png',
  lorealparis: '/images/brands/loreal-official.svg',
  garnier: '/images/brands/garnier-official.png',
};
export function storefrontBrandLogo(name: string) {
  const key = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return logos[key];
}

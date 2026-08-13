import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  allowedDevOrigins: ['127.0.0.1'],
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  outputFileTracingIncludes: {
    '/api/admin/recover-mock-data': ['./supabase-mock-db.json', './supabase-mock-db.json.bak'],
    '/api/admin/repair-product-fields': ['./supabase-mock-db.json'],
  },
  images: {
    minimumCacheTTL: 31536000,
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'beautymarket.ma',
      },
      {
        protocol: 'https',
        hostname: 'paraofficinal.store',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Gallery uploads are served from this project's public Supabase bucket.
      // Keep the exact host in addition to the wildcard because the Vercel image
      // optimizer enforces this allowlist at runtime.
      {
        protocol: 'https',
        hostname: 'doaoitspwukhwbcweewn.supabase.co',
        pathname: '/storage/v1/object/public/products/**',
      },
    ],
  },
  // Custom headers to ensure assets under /public/images/ and /public/uploads/ are cached for a year
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Not immutable — gallery images can be replaced by admin. must-revalidate ensures
            // the browser checks the server after the cache expires (1 hour).
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

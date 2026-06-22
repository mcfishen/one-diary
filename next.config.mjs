/** @type {import('next').NextConfig} */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://okatskswirzuixnlwlie.supabase.co";

const nextConfig = {
  // Проксируем запросы к Supabase через наш домен (Vercel),
  // чтобы база работала без VPN там, где Supabase заблокирован.
  async rewrites() {
    return [
      { source: "/db/:path*", destination: `${SUPABASE_URL}/:path*` },
    ];
  },

  // Кешируем медиа из хранилища, чтобы фото/видео не качались заново
  async headers() {
    return [
      {
        source: "/db/storage/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;

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
};

export default nextConfig;

/**
 * Next.js configuration for the app router setup.
 * React Server Components are the default; no client-only overrides here.
 */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  eslint: {
    // This will skip the Prettier/Linting checks during the Vercel build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Highly recommended to add this too, in case Prettier causes type mismatches
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

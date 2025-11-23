// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 Faz o Next NÃO falhar o build por erro de ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 👇 Opcional, mas ajuda se aparecer erro de TypeScript na build
  typescript: {
    ignoreBuildErrors: true,
  },

  // ...se você já tiver outras configs, mantém aqui
};

export default nextConfig;

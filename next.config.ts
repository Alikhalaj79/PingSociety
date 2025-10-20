import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'trustseal.enamad.ir',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

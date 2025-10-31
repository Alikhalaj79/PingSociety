import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trustseal.enamad.ir",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pingsociety.storage.c2.liara.space",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "209.38.235.116",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "209.38.235.116",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

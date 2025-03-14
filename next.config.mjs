/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "hebbkx1anhila5yf.public.blob.vercel-storage.com", 
      "ipfs.io",
      "opensea.io",
      "gateway.pinata.cloud"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "opensea.io",
        pathname: "/static/images/logos/**", 
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**", 
      },
    ],
  },
};

export default nextConfig;

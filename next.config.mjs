/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "hebbkx1anhila5yf.public.blob.vercel-storage.com", 
      "ipfs.io",
      "opensea.io" 
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
    ],
  },
};

export default nextConfig;

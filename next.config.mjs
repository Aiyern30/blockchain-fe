/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "hebbkx1anhila5yf.public.blob.vercel-storage.com", 
      "ipfs.io"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
    ],
  },
};

export default nextConfig;

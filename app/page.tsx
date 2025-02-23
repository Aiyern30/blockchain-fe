"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pacifico } from "next/font/google";
import Image from "next/image";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

const fadeUpVariants = (i: number) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
});

export default function Home() {
  return (
    <div className="relative z-10 container mx-auto px-4 md:px-6 min-h-[calc(100vh-128px)] flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          custom={0}
          variants={fadeUpVariants(0)}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
        >
          <Image
            src="https://kokonutui.com/logo.svg"
            alt="NFT Marketplace"
            width={20}
            height={20}
          />
          <span className="text-sm text-white/60 tracking-wide">
            NFT Marketplace
          </span>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUpVariants(1)}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Discover, Trade &
            </span>
            <br />
            <span
              className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 ",
                pacifico.className
              )}
            >
              Own Unique NFTs
            </span>
          </h1>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUpVariants(2)}
          initial="hidden"
          animate="visible"
        >
          <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
            Buy, sell, and collect exclusive NFTs in a decentralized
            marketplace. Powered by blockchain for secure and transparent
            transactions.
            <br />
            <strong>(Blockchain Group Assignment)</strong>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pacifico } from "next/font/google";
import Image from "next/image";
import { CheckCircle, Sparkles } from "lucide-react";
import Link from "next/link";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

const services = [
  {
    title: "Mint & List NFTs",
    description: "Create, showcase, and sell your unique NFTs with ease.",
    icon: CheckCircle,
  },
  {
    title: "Secure Transactions",
    description:
      "Blockchain ensures all transactions are safe and transparent.",
    icon: CheckCircle,
  },
  {
    title: "Exclusive NFT Drops",
    description: "Access limited-time collections from top creators.",
    icon: CheckCircle,
  },
  {
    title: "Community & Rewards",
    description: "Earn rewards by engaging with our marketplace.",
    icon: CheckCircle,
  },
];

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.8,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0.5 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.2,
    rotate: [0, 10, -10, 0],
    filter: "drop-shadow(0 0 8px rgba(165, 180, 252, 0.8))",
    transition: {
      duration: 0.4,
      ease: "easeOut",
      rotate: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: 0,
        repeatType: "mirror" as const,
      },
    },
  },
};

const sparkleVariants = {
  hidden: { opacity: 0, scale: 0 },
  hover: {
    opacity: [0, 1, 0],
    scale: [0.5, 1.2, 0.5],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop" as const,
    },
  },
};

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 20px rgba(165, 180, 252, 0.4)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 0 10px rgba(165, 180, 252, 0.4)",
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

export default function Home() {
  return (
    <>
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
              marketplace. Powered by GamerTokenHub for secure and transparent
              transactions.
              <br />
              <strong>(Blockchain Group Assignment)</strong>
            </p>
          </motion.div>
        </div>
      </div>
      <div className="relative z-10 container mx-auto px-4 md:px-6 min-h-[calc(100vh-128px)] flex items-center justify-center">
        <motion.div
          custom={3}
          variants={fadeUpVariants(3)}
          initial="hidden"
          animate="visible"
          className="w-full max-w-5xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6 tracking-tight">
            Our NFT Marketplace Services
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
            Explore the features that make our marketplace a seamless and secure
            platform for NFT enthusiasts.
          </p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className="p-6 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex flex-col items-center text-center space-y-4 relative overflow-hidden transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 opacity-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div className="relative" variants={iconVariants}>
                  <service.icon className="w-10 h-10 text-indigo-300 relative z-10" />

                  <motion.div
                    className="absolute top-0 right-0 text-indigo-200"
                    variants={sparkleVariants}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-0 left-0 text-indigo-200"
                    variants={sparkleVariants}
                    transition={{ delay: 0.2 }}
                  >
                    <Sparkles className="w-3 h-3" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-xl font-medium text-white relative z-10"
                  whileHover={{
                    textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {service.title}
                </motion.h3>

                <motion.p
                  className="text-sm text-white/60 relative z-10"
                  whileHover={{
                    color: "rgba(255, 255, 255, 0.8)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {service.description}
                </motion.p>

                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent opacity-0"
                  initial={{ opacity: 0 }}
                  whileHover={{
                    opacity: 1,
                    borderColor: "rgba(165, 180, 252, 0.3)",
                    boxShadow: "0 0 15px rgba(165, 180, 252, 0.2)",
                    transition: { duration: 0.5 },
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            custom={3}
            variants={fadeUpVariants(3)}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
          >
            <Link href="/Explore" className="w-full sm:w-auto">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-medium text-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Explore NFTs</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div className="absolute -inset-1 rounded-full blur-md bg-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>

            <Link href="/Create" className="w-full sm:w-auto">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-transparent border-2 border-indigo-400/30 text-white font-medium text-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Create NFT</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div className="absolute -inset-1 rounded-full blur-md bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

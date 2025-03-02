"use client";

import Link from "next/link";
import { ArrowRight, Grid, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export default function CreatePage() {
  const { theme } = useTheme();

  const getGradient = (isHovered: boolean) => {
    const baseGradient =
      theme === "dark" ? "from-zinc-900 to-zinc-800" : "from-white to-zinc-100";

    const hoverGradient =
      theme === "dark"
        ? "from-indigo-900/30 to-purple-900/30"
        : "from-indigo-100 to-purple-100";

    return isHovered ? hoverGradient : baseGradient;
  };

  return (
    <div className="min-h-[calc(100vh-128px)] p-6 flex items-center justify-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Create</h1>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href="/Create/Drop" className="block">
              <motion.div
                className={`p-6 rounded-lg border border-zinc-700/50 dark:border-zinc-300/50 shadow-lg transition-all duration-300 relative overflow-hidden group`}
                whileHover={{
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity duration-300 ease-in-out z-0`}
                  initial={{
                    background: `linear-gradient(to bottom right, ${getGradient(
                      false
                    )})`,
                  }}
                  whileHover={{
                    background: `linear-gradient(to bottom right, ${getGradient(
                      true
                    )})`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Grid className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">Drop</h2>
                    </div>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
                    A drop is the release of a new project. This usually happens
                    on a specified date and time. Items will be revealed after
                    they have been purchased.
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link href="/Create/Collection" className="block">
              <motion.div
                className={`p-6 rounded-lg border border-zinc-700/50 dark:border-zinc-300/50 shadow-lg transition-all duration-300 relative overflow-hidden group`}
                whileHover={{
                  boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                }}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity duration-300 ease-in-out z-0`}
                  initial={{
                    background: `linear-gradient(to bottom right, ${getGradient(
                      false
                    )})`,
                  }}
                  whileHover={{
                    background: `linear-gradient(to bottom right, ${getGradient(
                      true
                    )})`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">
                        Collection or item
                      </h2>
                    </div>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
                    Create a new NFT collection or add an NFT to an existing
                    one. Your items will display immediately. List for sale when
                    you&apos;re ready.
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

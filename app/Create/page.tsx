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

  return (
    <div className="min-h-[calc(100vh-128px)] p-6 flex items-center justify-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 text-white">
          <Package className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Create</h1>
        </div>

        <div className="space-y-6">
          {[
            {
              href: "/Create/Drop",
              title: "Drop",
              description:
                "A drop is the release of a new project. This usually happens on a specified date and time. Items will be revealed after they have been purchased.",
              icon: <Grid className="w-6 h-6" />,
            },
            {
              href: "/Create/Collection",
              title: "Collection or item",
              description:
                "Create a new NFT collection or add an NFT to an existing one. Your items will display immediately. List for sale when you're ready.",
              icon: <Package className="w-6 h-6" />,
            },
          ].map(({ href, title, description, icon }, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Link href={href} className="block">
                <motion.div
                  className={`p-6 rounded-lg border shadow-lg transition-all duration-300 relative overflow-hidden flex items-center justify-between
                  ${
                    theme === "dark"
                      ? "bg-zinc-900 border-zinc-700 text-white"
                      : "bg-white border-zinc-200 text-black"
                  }
                `}
                  whileHover={{
                    boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {icon}
                      <h2 className="text-xl font-semibold">{title}</h2>
                    </div>
                    <p className="mt-2 text-sm text-opacity-80">
                      {description}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

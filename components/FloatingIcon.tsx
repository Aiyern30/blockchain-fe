"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingIcon({ count = 5 }) {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setPositions(
      Array.from({ length: count }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }))
    );

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [count]);

  return (
    <div className="relative w-full h-full">
      {positions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: pos.x,
            y: pos.y,
          }}
          animate={{
            x: [
              pos.x,
              Math.random() * dimensions.width,
              Math.random() * dimensions.width,
            ],
            y: [
              pos.y,
              Math.random() * dimensions.height,
              Math.random() * dimensions.height,
            ],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="relative w-16 h-20 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex items-center justify-center transform hover:scale-110 transition-transform">
            <Bot
              className={cn(
                "w-8 h-8 transition-colors",
                "text-purple-400 dark:text-[#007bff]"
              )}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

"use client";

import { ReactNode, useState } from "react";
import { motion, Variants } from "framer-motion";

interface Props {
  title: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
}

export default function MotionButton({ title, onClick, icon }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripple, setRipple] = useState({ x: 0, y: 0, visible: false });

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const iconVariants: Variants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
        repeatType: "loop",
      },
    },
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setRipple({ x, y, visible: true });
    setTimeout(() => setRipple({ x: 0, y: 0, visible: false }), 500);

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.button
      className="relative overflow-hidden px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg flex items-center space-x-2"
      style={{
        background: "linear-gradient(45deg, #4F46E5, #7C3AED)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {icon && (
        <motion.span
          className="relative z-10"
          animate={isHovered ? "spin" : ""}
          variants={iconVariants}
        >
          {icon}
        </motion.span>
      )}
      <motion.span className="relative z-10">{title}</motion.span>
      <motion.div
        className="absolute inset-0 bg-white opacity-20"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: isHovered ? 1 : 0, opacity: isHovered ? 0.2 : 0.5 }}
        transition={{ duration: 0.3 }}
      />
      {ripple.visible && (
        <motion.div
          className="absolute bg-white rounded-full"
          style={{
            width: 100,
            height: 100,
            x: ripple.x - 50,
            y: ripple.y - 50,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}
